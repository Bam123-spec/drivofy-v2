'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { getInstructorBusyTimes, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/googleCalendar'
import { sendTransactionalEmail } from '@/lib/brevo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseService = createServiceClient(supabaseUrl, supabaseServiceKey)

function enrollmentEmailFromRecord(enrollment: any) {
    const customerEmail = enrollment?.customer_details?.email
    return enrollment?.email || customerEmail || null
}

function enrollmentPhoneFromRecord(enrollment: any) {
    const customerPhone = enrollment?.customer_details?.phone
    return enrollment?.phone || customerPhone || null
}

export async function getDrivingSessions(filters?: {
    instructorId?: string,
    studentId?: string,
    status?: string,
    startDate?: string,
    endDate?: string
}) {
    let drivingQuery = supabaseService
        .from('driving_sessions')
        .select(`
            *,
            profiles:student_id(id, full_name, email, phone),
            instructors(id, full_name, email, phone),
            vehicles(id, name)
        `)
        .order('start_time', { ascending: false })

    let btwQuery = supabaseService
        .from('behind_the_wheel_sessions')
        .select('*')
        .order('starts_at', { ascending: false })

    let tenHourQuery = supabaseService
        .from('ten_hour_package_sessions')
        .select('*')
        .order('start_time', { ascending: false })

    if (filters?.instructorId && filters.instructorId !== 'all') {
        drivingQuery = drivingQuery.eq('instructor_id', filters.instructorId)
        btwQuery = btwQuery.eq('instructor_id', filters.instructorId)
        tenHourQuery = tenHourQuery.eq('instructor_id', filters.instructorId)
    }
    if (filters?.studentId) {
        drivingQuery = drivingQuery.eq('student_id', filters.studentId)
        btwQuery = btwQuery.eq('student_id', filters.studentId)
        tenHourQuery = tenHourQuery.eq('student_id', filters.studentId)
    }
    if (filters?.status && filters.status !== 'all') {
        drivingQuery = drivingQuery.eq('status', filters.status)
        btwQuery = btwQuery.eq('status', filters.status)
        tenHourQuery = tenHourQuery.eq('status', filters.status)
    }
    if (filters?.startDate) {
        drivingQuery = drivingQuery.gte('start_time', filters.startDate)
        btwQuery = btwQuery.gte('starts_at', filters.startDate)
        tenHourQuery = tenHourQuery.gte('start_time', filters.startDate)
    }
    if (filters?.endDate) {
        drivingQuery = drivingQuery.lte('start_time', filters.endDate)
        btwQuery = btwQuery.lte('starts_at', filters.endDate)
        tenHourQuery = tenHourQuery.lte('start_time', filters.endDate)
    }

    const [
        { data: drivingRows, error: drivingError },
        { data: btwRows, error: btwError },
        { data: tenHourRows, error: tenHourError }
    ] = await Promise.all([drivingQuery, btwQuery, tenHourQuery])

    if (drivingError) throw new Error(drivingError.message)
    if (btwError) throw new Error(btwError.message)
    if (tenHourError) throw new Error(tenHourError.message)

    const packageRows = [...(btwRows || []), ...(tenHourRows || [])]
    const packageStudentIds = Array.from(
        new Set(packageRows.map((row: any) => row.student_id).filter(Boolean))
    )
    const packageInstructorIds = Array.from(
        new Set(packageRows.map((row: any) => row.instructor_id).filter(Boolean))
    )

    let packageProfilesById = new Map<string, any>()
    let packageInstructorsById = new Map<string, any>()

    if (packageStudentIds.length > 0) {
        const { data: packageProfiles, error: packageProfilesError } = await supabaseService
            .from('profiles')
            .select('id, full_name, email, phone')
            .in('id', packageStudentIds)
        if (packageProfilesError) throw new Error(packageProfilesError.message)
        packageProfilesById = new Map((packageProfiles || []).map((profile: any) => [profile.id, profile]))
    }

    if (packageInstructorIds.length > 0) {
        const { data: packageInstructors, error: packageInstructorsError } = await supabaseService
            .from('instructors')
            .select('id, full_name, email, phone')
            .in('id', packageInstructorIds)
        if (packageInstructorsError) throw new Error(packageInstructorsError.message)
        packageInstructorsById = new Map((packageInstructors || []).map((instructor: any) => [instructor.id, instructor]))
    }

    const normalizedDriving = (drivingRows || []).map((row: any) => ({
        ...row,
        source_table: 'driving_sessions'
    }))

    const normalizedBTW = (btwRows || []).map((row: any) => ({
        ...row,
        source_table: 'behind_the_wheel_sessions',
        start_time: row.starts_at,
        end_time: row.ends_at,
        service_slug: row.session_type || 'btw',
        plan_key: row.session_type === 'road_test' ? 'road_test' : 'btw',
        duration_minutes: row.starts_at && row.ends_at
            ? Math.max(0, Math.round((new Date(row.ends_at).getTime() - new Date(row.starts_at).getTime()) / 60000))
            : null,
        profiles: packageProfilesById.get(row.student_id) || null,
        instructors: packageInstructorsById.get(row.instructor_id) || null,
        vehicles: null
    }))

    const normalizedTenHour = (tenHourRows || []).map((row: any) => ({
        ...row,
        source_table: 'ten_hour_package_sessions',
        service_slug: 'ten_hour_package',
        plan_key: 'TEN_HOUR',
        duration_minutes: row.start_time && row.end_time
            ? Math.max(0, Math.round((new Date(row.end_time).getTime() - new Date(row.start_time).getTime()) / 60000))
            : null,
        profiles: packageProfilesById.get(row.student_id) || null,
        instructors: packageInstructorsById.get(row.instructor_id) || null,
        vehicles: null
    }))

    const mergedSessions = [...normalizedDriving, ...normalizedBTW, ...normalizedTenHour]
    const sessionStudentIds = Array.from(new Set(
        mergedSessions.map((row: any) => row.student_id).filter(Boolean)
    ))
    const sessionStudentIdSet = new Set(sessionStudentIds)

    const { data: enrollments, error: enrollmentsError } = await supabaseService
        .from('enrollments')
        .select('student_id, email, phone, customer_details, enrolled_at')
        .order('enrolled_at', { ascending: false })

    if (enrollmentsError) throw new Error(enrollmentsError.message)

    const phoneByStudentId = new Map<string, string>()
    const phoneByEmail = new Map<string, string>()

    for (const enrollment of (enrollments || [])) {
        const studentId = enrollment.student_id
        const email = enrollmentEmailFromRecord(enrollment)
        const phone = enrollmentPhoneFromRecord(enrollment)

        if (!phone) continue
        if (studentId && sessionStudentIdSet.has(studentId) && !phoneByStudentId.has(studentId)) {
            phoneByStudentId.set(studentId, phone)
        }

        const normalizedEmail = String(email || '').toLowerCase().trim()
        if (normalizedEmail && !phoneByEmail.has(normalizedEmail)) {
            phoneByEmail.set(normalizedEmail, phone)
        }
    }

    return mergedSessions
        .map((row: any) => {
            const profile = row.profiles || null
            const existingPhone = profile?.phone || null
            if (existingPhone) return row

            const byStudentId = row.student_id ? phoneByStudentId.get(row.student_id) : null
            const byEmail = profile?.email ? phoneByEmail.get(String(profile.email).toLowerCase().trim()) : null
            const fallbackPhone = byStudentId || byEmail || null

            if (!fallbackPhone) return row

            return {
                ...row,
                profiles: {
                    ...(profile || {}),
                    phone: fallbackPhone
                }
            }
        })
        .filter((row: any) => !!row.start_time)
        .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
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

export async function getDrivingServices() {
    const { data, error } = await supabaseService
        .from('service_packages')
        .select(`
            *,
            service_package_instructors (
                instructor_id,
                instructors (
                    id,
                    full_name
                )
            )
        `)
        .order('display_name')
    if (error) throw new Error(error.message)
    return data
}

export async function createDrivingService(data: {
    display_name: string
    plan_key: string
    instructor_ids: string[]
    duration_minutes: number
    price?: number | null
    price_cents?: number | null
    category?: string
    credits_granted?: number
}) {
    const payload: Record<string, any> = {
        display_name: data.display_name,
        plan_key: data.plan_key,
        duration_minutes: data.duration_minutes,
        category: data.category || 'service',
        credits_granted: data.credits_granted || 0
    }

    if (data.price !== undefined) payload.price = data.price
    if (data.price_cents !== undefined) payload.price_cents = data.price_cents

    const { data: created, error } = await supabaseService
        .from('service_packages')
        .insert([payload])
        .select('*')
        .single()

    if (error) throw new Error(error.message)
    if (data.instructor_ids?.length) {
        const { error: linkError } = await supabaseService
            .from('service_package_instructors')
            .insert(data.instructor_ids.map((instructorId) => ({
                service_package_id: created.id,
                instructor_id: instructorId
            })))
        if (linkError) throw new Error(linkError.message)
    }
    return created
}

export async function updateDrivingService(data: {
    id: string
    display_name: string
    plan_key: string
    instructor_ids: string[]
    duration_minutes: number
    price?: number | null
    price_cents?: number | null
    category?: string
    credits_granted?: number
}) {
    const payload: Record<string, any> = {
        display_name: data.display_name,
        plan_key: data.plan_key,
        duration_minutes: data.duration_minutes,
    }

    if (data.price !== undefined) payload.price = data.price
    if (data.price_cents !== undefined) payload.price_cents = data.price_cents
    if (data.category !== undefined) payload.category = data.category
    if (data.credits_granted !== undefined) payload.credits_granted = data.credits_granted

    const { data: updated, error } = await supabaseService
        .from('service_packages')
        .update(payload)
        .eq('id', data.id)
        .select('*')
        .single()

    if (error) throw new Error(error.message)

    await supabaseService
        .from('service_package_instructors')
        .delete()
        .eq('service_package_id', data.id)

    if (data.instructor_ids?.length) {
        const { error: linkError } = await supabaseService
            .from('service_package_instructors')
            .insert(data.instructor_ids.map((instructorId) => ({
                service_package_id: data.id,
                instructor_id: instructorId
            })))
        if (linkError) throw new Error(linkError.message)
    }
    return updated
}

export async function grantPackageCredits(studentId: string, packageId: string) {
    try {
        // 1. Fetch Package Details (including plan_key)
        const { data: pkg, error: pkgError } = await supabaseService
            .from('service_packages')
            .select('credits_granted, display_name, duration_minutes, plan_key')
            .eq('id', packageId)
            .single()

        if (pkgError || !pkg) throw new Error("Package not found")

        const creditsToGrant = pkg.credits_granted || 0
        const durationMinutes = pkg.duration_minutes || 120
        const hoursToGrant = (creditsToGrant * durationMinutes) / 60

        if (creditsToGrant <= 0) throw new Error("This package grants no sessions")

        // 2. Fetch Student Profile
        const { data: student, error: studentError } = await supabaseService
            .from('profiles')
            .select('driving_balance_sessions, driving_balance_hours, full_name, email, ten_hour_sessions_total, ten_hour_sessions_used')
            .eq('id', studentId)
            .single()

        if (studentError || !student) throw new Error("Student not found")

        // 3. Route based on package type (plan_key)
        const packageType = pkg.plan_key

        if (packageType === 'TEN_HOUR') {
            // === TEN_HOUR_PACKAGE ===
            // Step 1: Create enrollment (unlocks /student/ten-hour route)
            const { error: enrollmentError } = await supabaseService
                .from('enrollments')
                .insert([{
                    student_id: studentId,
                    user_id: studentId,
                    status: 'enrolled',
                    enrolled_at: new Date().toISOString(),
                    customer_details: {
                        service_type: 'TEN_HOUR_PACKAGE',
                        name: student.full_name,
                        email: student.email
                    }
                }])

            if (enrollmentError) {
                console.error('TEN_HOUR enrollment error:', enrollmentError)
                throw new Error(`Failed to create enrollment: ${enrollmentError.message}`)
            }

            // Step 2: Initialize ten_hour credits in profile
            const newTenHourTotal = (student.ten_hour_sessions_total || 0) + creditsToGrant
            const newTenHourUsed = student.ten_hour_sessions_used || 0

            const { error: updateError } = await supabaseService
                .from('profiles')
                .update({
                    ten_hour_package_paid: true,
                    ten_hour_sessions_total: newTenHourTotal,
                    ten_hour_sessions_used: newTenHourUsed,
                    updated_at: new Date().toISOString()
                })
                .eq('id', studentId)

            if (updateError) throw updateError

            // Audit Log
            await supabaseService.from('audit_logs').insert([{
                action: 'grant_ten_hour_package',
                entity_type: 'student',
                entity_id: studentId,
                metadata: {
                    package_id: packageId,
                    package_name: pkg.display_name,
                    package_type: 'TEN_HOUR_PACKAGE',
                    credits_granted: creditsToGrant,
                    new_ten_hour_total: newTenHourTotal,
                    customer_details: {
                        service_type: 'TEN_HOUR_PACKAGE',
                        name: student.full_name,
                        email: student.email
                    }
                },
                message: `Granted TEN_HOUR_PACKAGE (${creditsToGrant} sessions) to ${student.full_name}`
            }])

        } else if (packageType === 'BTW_3_SESSION') {
            // === BTW_PACKAGE ===
            // Step 1: Create enrollment (unlocks /student/behind-the-wheel route)
            const { error: enrollmentError } = await supabaseService
                .from('enrollments')
                .insert([{
                    student_id: studentId,
                    user_id: studentId,
                    status: 'enrolled',
                    enrolled_at: new Date().toISOString(),
                    customer_details: {
                        service_type: 'BTW_PACKAGE',
                        name: student.full_name,
                        email: student.email
                    }
                }])

            if (enrollmentError) {
                console.error('BTW enrollment error:', enrollmentError)
                throw new Error(`Failed to create BTW enrollment: ${enrollmentError.message}`)
            }

            // Step 2: Create BTW allocation
            const { error: allocationError } = await supabaseService
                .from('student_btw_allocations')
                .insert([{
                    student_id: studentId,
                    package_id: packageId,
                    total_included_sessions: creditsToGrant,
                    sessions_used: 0
                }])

            if (allocationError) {
                console.error('BTW allocation error:', allocationError)
                throw new Error(`Failed to create BTW allocation: ${allocationError.message}`)
            }

            // Audit Log
            await supabaseService.from('audit_logs').insert([{
                action: 'grant_btw_package',
                entity_type: 'student',
                entity_id: studentId,
                metadata: {
                    package_id: packageId,
                    package_name: pkg.display_name,
                    package_type: 'BTW_PACKAGE',
                    credits_granted: creditsToGrant,
                    customer_details: {
                        service_type: 'BTW_PACKAGE',
                        name: student.full_name,
                        email: student.email
                    }
                },
                message: `Granted BTW_PACKAGE (${creditsToGrant} sessions) to ${student.full_name}`
            }])

        } else {
            // === ONE-OFF SESSIONS (PRACTICE, ROAD_TEST) ===
            // Keep current approach: generic driving_balance fields
            const newSessionsBalance = (student.driving_balance_sessions || 0) + creditsToGrant
            const newHoursBalance = (student.driving_balance_hours || 0) + hoursToGrant

            const { error: updateError } = await supabaseService
                .from('profiles')
                .update({
                    driving_balance_sessions: newSessionsBalance,
                    driving_balance_hours: newHoursBalance,
                    updated_at: new Date().toISOString()
                })
                .eq('id', studentId)

            if (updateError) throw updateError

            // Audit Log
            await supabaseService.from('audit_logs').insert([{
                action: 'grant_credits',
                entity_type: 'student',
                entity_id: studentId,
                metadata: {
                    package_id: packageId,
                    package_name: pkg.display_name,
                    package_type: packageType || 'ONE_OFF_SESSION',
                    credits_granted: creditsToGrant,
                    hours_granted: hoursToGrant,
                    previous_sessions: student.driving_balance_sessions,
                    new_sessions: newSessionsBalance,
                    previous_hours: student.driving_balance_hours,
                    new_hours: newHoursBalance
                },
                message: `Granted ${creditsToGrant} sessions (${hoursToGrant} hours) to ${student.full_name} via ${pkg.display_name}`
            }])
        }

        revalidatePath('/admin/driving')
        revalidatePath('/admin/students')
        return { success: true, granted: creditsToGrant }
    } catch (error: any) {
        console.error("Grant Credits Error:", error)
        return { success: false, error: error.message }
    }
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
                const googleEvent = await createCalendarEvent(user.id, {
                    studentName: student.full_name || "Student",
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    title: `Session: ${instructor.full_name} / ${student.full_name}`,
                    description: `Driving Session\nInstructor: ${instructor.full_name}\nStudent: ${student.full_name}\nDuration: ${data.duration} hour(s)\nNotes: ${data.notes || 'N/A'}`,
                    location: "Driving School"
                })
                console.log("📅 Calendar sync successful", googleEvent.id)

                // Save Google Event ID
                await supabaseService
                    .from('driving_sessions')
                    .update({ google_event_id: googleEvent.id })
                    .eq('id', session.id)

            } catch (calendarError: any) {
                console.error("❌ Calendar sync failed:", calendarError.message)
                calendarSyncWarning = `Calendar sync failed. Check your Google Calendar connection. ${calendarError.message}`
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
            // ... Email logic remains same ...
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

        // 5. Sync Cancellation to Google Calendar
        if (status === 'cancelled' && session.google_event_id) {
            const cookieStore = await cookies()
            const supabase = createClient(cookieStore)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                try {
                    await deleteCalendarEvent(user.id, session.google_event_id)
                    // Optional: Clear the ID from DB? Or keep it for log?
                    // Let's clear it to avoid double deletion errors
                    await supabaseService
                        .from('driving_sessions')
                        .update({ google_event_id: null })
                        .eq('id', id)
                } catch (err) {
                    console.error("Failed to delete calendar event on cancellation:", err)
                }
            }
        }

        // 6. Unlock Slot
        await supabaseService
            .from('instructor_availability')
            .delete()
            .eq('booking_id', id)
    } catch (e) {
        console.error("Failed to process session automation:", e)
    }

    revalidatePath('/admin/driving')
    revalidatePath('/dashboard') // Revalidate Student Dashboard
    return { success: true }
}

export async function updateSessionNotes(id: string, notes: string) {
    // 1. Update DB
    const { data: session, error } = await supabaseService
        .from('driving_sessions')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
            *,
            profiles:student_id(full_name),
            instructors(full_name)
        `)
        .single()

    if (error) throw new Error(error.message)

    // 2. Sync to Google Calendar
    if (session?.google_event_id) {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            try {
                await updateCalendarEvent(user.id, session.google_event_id, {
                    studentName: session.profiles?.full_name || "Student",
                    startTime: session.start_time,
                    endTime: session.end_time,
                    title: `Session: ${session.instructors?.full_name || 'Instructor'} / ${session.profiles?.full_name || 'Student'}`,
                    description: `Driving Session\nInstructor: ${session.instructors?.full_name}\nStudent: ${session.profiles?.full_name}\nDuration: ${session.duration_minutes / 60} hour(s)\nNotes: ${notes}`,
                    location: "Driving School"
                })
            } catch (err) {
                console.error("Failed to update Google Calendar event notes:", err)
            }
        }
    }

    revalidatePath('/admin/driving')
    return { success: true }
}

export async function deleteDrivingSession(id: string) {
    // 1. Get Session for Google Event ID
    const { data: session } = await supabaseService
        .from('driving_sessions')
        .select('google_event_id')
        .eq('id', id)
        .single()

    // 2. Delete from Google Calendar
    if (session?.google_event_id) {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            try {
                await deleteCalendarEvent(user.id, session.google_event_id)
            } catch (err) {
                console.error("Failed to delete Google Calendar event:", err)
            }
        }
    }

    // 3. Unlock Slot
    await supabaseService
        .from('instructor_availability')
        .delete()
        .eq('booking_id', id)

    // 3. Delete from DB
    const { error } = await supabaseService
        .from('driving_sessions')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/driving')
    revalidatePath('/dashboard') // Revalidate Student Dashboard
    return { success: true }
}
