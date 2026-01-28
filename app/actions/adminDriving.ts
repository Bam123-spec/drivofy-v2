'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { getInstructorBusyTimes, createCalendarEvent } from '@/lib/googleCalendar'
import { sendTransactionalEmail } from '@/lib/brevo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey)

export async function getDrivingSessions(filters?: {
    instructorId?: string,
    studentId?: string,
    status?: string,
    startDate?: string,
    endDate?: string
}) {
    let query = supabaseService
        .from('driving_sessions')
        .select(`
            *,
            profiles:student_id(id, full_name, email, phone),
            instructors(id, full_name, email, phone),
            vehicles(id, name)
        `)
        .order('start_time', { ascending: false })

    if (filters?.instructorId && filters.instructorId !== 'all') query = query.eq('instructor_id', filters.instructorId)
    if (filters?.studentId) query = query.eq('student_id', filters.studentId)
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters?.startDate) query = query.gte('start_time', filters.startDate)
    if (filters?.endDate) query = query.lte('start_time', filters.endDate)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

export async function getInstructors() {
    const { data, error } = await supabaseService.from('instructors').select('*').eq('status', 'active').order('full_name')
    if (error) throw new Error(error.message)
    return data
}

export async function getStudents() {
    const { data, error } = await supabaseService.from('profiles').select('*').eq('role', 'student').order('full_name')
    if (error) throw new Error(error.message)
    return data
}

export async function getVehicles() {
    const { data, error } = await supabaseService.from('vehicles').select('*').eq('status', 'active').order('name')
    if (error) throw new Error(error.message)
    return data
}

export async function getServicePackages() {
    const { data, error } = await supabaseService.from('service_packages').select('*').order('display_name')
    if (error) throw new Error(error.message)
    return data
}

export async function createDrivingSession(data: {
    studentId: string,
    instructorId: string,
    vehicleId?: string,
    plan_key?: string,
    date: string,
    time: string,
    duration: number // hours
    notes?: string
}) {
    try {
        const startDateTime = new Date(`${data.date}T${data.time}`)
        const endDateTime = new Date(startDateTime.getTime() + data.duration * 60 * 60 * 1000)
        const durationMinutes = data.duration * 60

        console.log("📋 Creating driving session for instructor:", data.instructorId)

        // 0. Get authenticated admin user for calendar sync
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("❌ Failed to get authenticated user:", authError)
        } else {
            console.log("👤 Admin user authenticated:", user.id)
        }

        let calendarSyncWarning: string | null = null

        // 1. Fetch instructor and student details
        const { data: student, error: studentError } = await supabaseService
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', data.studentId)
            .single()

        const { data: instructor, error: instructorError } = await supabaseService
            .from('instructors')
            .select('full_name, email')
            .eq('id', data.instructorId)
            .single()

        if (studentError || instructorError || !student) {
            console.error("❌ Failed to fetch participants:", { studentError, instructorError, studentFound: !!student })
            return { success: false, error: "Failed to fetch participant details. Please ensure the student and instructor exist." }
        }

        console.log("👨‍🏫 Instructor details:", instructor.full_name, instructor.email)
        console.log("👤 Student details:", student.full_name, student.email)

        // 2. Conflict Check
        const { data: internalConflicts } = await supabaseService
            .from('driving_sessions')
            .select('id')
            .eq('instructor_id', data.instructorId)
            .neq('status', 'cancelled')
            .lt('start_time', endDateTime.toISOString())
            .gt('end_time', startDateTime.toISOString())

        if (internalConflicts && internalConflicts.length > 0) {
            return { success: false, error: "Instructor is already booked for that time" }
        }

        // 3. Insert Session
        const { data: session, error } = await supabaseService
            .from('driving_sessions')
            .insert([{
                student_id: data.studentId,
                instructor_id: data.instructorId,
                vehicle_id: data.vehicleId || null,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                duration_minutes: durationMinutes,
                status: 'scheduled',
                notes: data.notes || null,
                source: 'admin',
                plan_key: data.plan_key || null
            }])
            .select('*, profiles:student_id(full_name)')
            .single()

        if (error) throw error

        console.log("✅ Session created in database:", session.id)

        // 4. Handle BTW Cooldown for Manual Entry
        if (data.plan_key === 'btw') {
            const cooldownUntil = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000).toISOString()
            console.log("❄️ Setting BTW cooldown until:", cooldownUntil)

            const { error: cooldownError } = await supabaseService
                .from('profiles')
                .update({ btw_cooldown_until: cooldownUntil })
                .eq('id', data.studentId)

            if (cooldownError) {
                console.error("❌ Failed to set cooldown profile:", cooldownError)
            }

            // Queue Cooldown Email
            const { error: queueError } = await supabaseService.from('email_queue').upsert({
                student_id: data.studentId,
                email_type: 'btw_cooldown_ready',
                send_at: cooldownUntil,
                status: 'pending'
            }, { onConflict: 'student_id, email_type, send_at' })

            if (queueError) {
                console.error("❌ Failed to queue cooldown email:", queueError)
            }
        }

        // 5. Sync to Admin's Google Calendar
        if (user) {
            try {
                await createCalendarEvent(user.id, {
                    studentName: student.full_name || "Student",
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    title: `Session: ${instructor.full_name} / ${student.full_name}`,
                    description: `Driving Session\nInstructor: ${instructor.full_name}\nStudent: ${student.full_name}\nDuration: ${data.duration} hour(s)\nNotes: ${data.notes || 'N/A'}`,
                    location: "Driving School"
                })
                console.log("📅 Calendar sync successful")
            } catch (calendarError: any) {
                console.error("❌ Calendar sync failed:", calendarError.message)
                calendarSyncWarning = `Calendar sync failed. Check your Google Calendar connection.`
            }
        }

        // 6. Send Email Notification to BOTH Instructor and Student
        try {
            console.log("📧 Attempting to send notifications...")
            const sessionDateFormatted = format(startDateTime, 'EEEE, MMMM do')
            const sessionTimeFormatted = format(startDateTime, 'h:mm a')

            const sessionDetailsHtml = `
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                    <div style="margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Date & Time</span>
                        <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 16px; font-weight: bold;">${sessionDateFormatted} at ${sessionTimeFormatted}</p>
                    </div>
                    <div>
                        <span style="color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Duration</span>
                        <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 16px; font-weight: bold;">${data.duration} hour(s)</p>
                    </div>
                </div>
            `

            // To Instructor
            if (instructor?.email) {
                const instructorEmailResult = await sendTransactionalEmail({
                    to: [{ email: instructor.email, name: instructor.full_name }],
                    subject: `New Session Assigned: ${student.full_name}`,
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1e293b;">
                            <h2 style="font-size: 24px; margin-bottom: 8px;">New Session Assigned</h2>
                            <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Hi ${instructor.full_name}, a new driving session has been assigned to you for <b>${student.full_name}</b>.</p>
                            ${sessionDetailsHtml}
                            <p style="font-size: 14px; color: #64748b; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                                View your schedule at <a href="https://selamdriving.drivofy.com/instructor/schedule" style="color: #2563eb; font-weight: bold; text-decoration: none;">Instructor Portal</a>.
                            </p>
                        </div>
                    `
                });
                console.log("Instructor email result:", instructorEmailResult)
            }

            // To Student
            if (student?.email) {
                const studentEmailResult = await sendTransactionalEmail({
                    to: [{ email: student.email, name: student.full_name }],
                    subject: `Booking Confirmed: ${format(startDateTime, 'MMM d, h:mm a')}`,
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1e293b;">
                            <h2 style="font-size: 24px; margin-bottom: 8px;">Driving Session Confirmed</h2>
                            <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Hi ${student.full_name}, your driving session with <b>${instructor.full_name}</b> has been booked successfully.</p>
                            ${sessionDetailsHtml}
                            <p style="font-size: 14px; color: #64748b; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                                Manage your bookings and feedback in the <a href="https://selamdriving.drivofy.com/dashboard" style="color: #2563eb; font-weight: bold; text-decoration: none;">Student Dashboard</a>.
                            </p>
                        </div>
                    `
                });
                console.log("Student email result:", studentEmailResult)
            }
        } catch (e) {
            console.error("❌ Notification process failed:", e)
        }

        revalidatePath('/admin/driving')
        revalidatePath('/admin/schedule')
        revalidatePath('/dashboard')

        return {
            success: true,
            warning: calendarSyncWarning
        }
    } catch (error: any) {
        console.error("Create Session Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateSessionStatus(id: string, status: string) {
    // 1. Fetch Session & Participant Details
    const { data: session, error: fetchError } = await supabaseService
        .from('driving_sessions')
        .select(`
            *,
            profiles:student_id(id, full_name, email, btw_cooldown_until),
            instructors(full_name)
        `)
        .eq('id', id)
        .single()

    if (fetchError || !session) throw new Error("Session not found")

    // 2. Perform Update
    const { error } = await supabaseService
        .from('driving_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)

    // 3. Handle Cooldown & Notifications
    try {
        const isBTW = session.plan_key === 'btw'

        if (status === 'completed' && isBTW) {
            const cooldownUntil = new Date(new Date(session.end_time).getTime() + 24 * 60 * 60 * 1000).toISOString()
            await supabaseService
                .from('profiles')
                .update({ btw_cooldown_until: cooldownUntil })
                .eq('id', session.student_id)

            // Queue Cooldown Email
            await supabaseService.from('email_queue').upsert({
                student_id: session.student_id,
                email_type: 'btw_cooldown_ready',
                send_at: cooldownUntil,
                status: 'pending'
            }, { onConflict: 'student_id, email_type, send_at' })
        }

        // 4. Send Student Status Update Email
        if (session.profiles?.email) {
            const statusConfig: any = {
                completed: { title: "Session Completed ✅", message: "Your driving session has been marked as completed. We hope it was a great learning experience!" },
                cancelled: { title: "Session Cancelled ❌", message: "Your driving session has been cancelled. If this was a mistake, please reach out or book a new slot." },
                no_show: { title: "Student No-Show ⚠️", message: "We've marked your session as a 'No-Show' because you weren't present. Please contact us to reschedule." }
            }

            const config = statusConfig[status]
            if (config) {
                await sendTransactionalEmail({
                    to: [{ email: session.profiles.email, name: session.profiles.full_name }],
                    subject: `Update: Driving Session ${status.replace('_', ' ').toUpperCase()}`,
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #1e293b; margin-top: 0;">${config.title}</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${session.profiles.full_name},</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">${config.message}</p>
                            
                            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Session Details</p>
                                <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 14px;">
                                    <b>Date:</b> ${format(new Date(session.start_time), 'EEEE, MMMM do')}<br/>
                                    <b>Instructor:</b> ${session.instructors?.full_name}
                                </p>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                                You can check your progress anytime at <a href="https://selamdriving.drivofy.com/dashboard" style="color: #2563eb; text-decoration: none;">selamdriving.com</a>.
                            </p>
                        </div>
                    `
                })
            }
        }
    } catch (e) {
        console.error("Failed to process session automation:", e)
    }

    revalidatePath('/admin/driving')
    revalidatePath('/dashboard') // Revalidate Student Dashboard
    return { success: true }
}

export async function updateSessionNotes(id: string, notes: string) {
    const { error } = await supabaseService
        .from('driving_sessions')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/driving')
    return { success: true }
}

export async function deleteDrivingSession(id: string) {
    const { error } = await supabaseService
        .from('driving_sessions')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/driving')
    revalidatePath('/dashboard') // Revalidate Student Dashboard
    return { success: true }
}

