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

export async function createDrivingSession(data: {
    studentId: string,
    instructorId: string,
    vehicleId?: string,
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

        // 1. Fetch instructor details for display
        const { data: instructor, error: instructorError } = await supabaseService
            .from('instructors')
            .select('full_name, email')
            .eq('id', data.instructorId)
            .single()

        if (instructorError) {
            console.error("❌ Failed to fetch instructor:", instructorError)
            return { success: false, error: "Failed to fetch instructor details" }
        }

        console.log("👨‍🏫 Instructor details:", instructor.full_name)

        // 2. Conflict Check (Internal DB only - no Google Calendar check needed)
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
                notes: data.notes,
                source: 'admin'
            }])
            .select('*, profiles:student_id(full_name)')
            .single()

        if (error) throw error

        console.log("✅ Session created in database:", session.id)

        // 4. Sync to Admin's Google Calendar
        if (user) {
            try {
                console.log("🚀 Syncing to ADMIN's Google Calendar...")
                console.log("   Admin ID:", user.id)
                console.log("   Instructor:", instructor.full_name)
                console.log("   Student:", session.profiles?.full_name)

                const calendarEvent = await createCalendarEvent(user.id, {
                    studentName: session.profiles?.full_name || "Student",
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    title: `${instructor.full_name} - ${session.profiles?.full_name}`,
                    description: `Driving Session\nInstructor: ${instructor.full_name}\nStudent: ${session.profiles?.full_name}\nDuration: ${data.duration} hour(s)\nNotes: ${data.notes || 'N/A'}`,
                    location: "Driving School"
                })

                console.log("✅ Calendar event created on ADMIN calendar!")
                console.log("   Link:", calendarEvent.htmlLink)
            } catch (calendarError: any) {
                console.error("❌ Calendar sync failed:", calendarError.message)
                calendarSyncWarning = `Calendar sync failed: ${calendarError.message}. Check your Google Calendar connection.`
            }
        } else {
            console.log("⏭️ No authenticated admin - skipping calendar sync")
            calendarSyncWarning = "Calendar sync skipped - admin not authenticated"
        }

        // 5. Send Email Notification to Instructor
        try {
            if (instructor?.email) {
                await sendTransactionalEmail({
                    to: [{ email: instructor.email, name: instructor.full_name }],
                    subject: `New Driving Session Assigned: ${session.profiles?.full_name}`,
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #1e293b; margin-bottom: 16px;">New Driving Session</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                                Hi ${instructor.full_name}, a new driving session has been booked for you.
                            </p>
                            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                                <p style="margin: 0; color: #64748b; font-size: 14px;">Student</p>
                                <p style="margin: 4px 0 12px 0; color: #1e293b; font-weight: bold;">${session.profiles?.full_name}</p>
                                
                                <p style="margin: 0; color: #64748b; font-size: 14px;">Date & Time</p>
                                <p style="margin: 4px 0 12px 0; color: #1e293b; font-weight: bold;">
                                    ${format(startDateTime, 'EEEE, MMMM do')} at ${format(startDateTime, 'h:mm a')}
                                </p>
                                
                                <p style="margin: 0; color: #64748b; font-size: 14px;">Duration</p>
                                <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: bold;">${data.duration} hour(s)</p>
                            </div>
                            <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                                You can view your full schedule in the <a href="https://selamdriving.drivofy.com/instructor/schedule" style="color: #2563eb; text-decoration: none;">Instructor Portal</a>.
                            </p>
                        </div>
                    `
                });
                console.log('✅ Instructor notification sent')
            }
        } catch (e) {
            console.error("Instructor Email Notification Failed", e)
        }

        revalidatePath('/admin/driving')
        revalidatePath('/admin/schedule')

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
    const { error } = await supabaseService
        .from('driving_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/driving')
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
    return { success: true }
}

