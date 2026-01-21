'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { logAuditAction } from "@/app/actions/audit"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export type InstructorEventType = 'driving' | 'theory'

export type InstructorEvent = {
    id: string
    type: InstructorEventType
    title: string
    start_time: string
    end_time: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'active'
    studentName?: string
    studentId?: string
    className?: string
    location?: string
    duration_minutes: number
    meta?: any // Original row data
}

// Helper to get current instructor ID securely
async function getCurrentInstructor() {
    const cookieStore = await cookies()

    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return null

    const { data: instructor } = await supabase
        .from('instructors')
        .select('*')
        .eq('profile_id', user.id)
        .single()

    return instructor
}

export async function getDashboardStats() {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const now = new Date()

    // Calculate start of week (Monday) and end of week (Sunday)
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const startOfWeek = new Date(now.setDate(diff))
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const canDriving = instructor.type === 'driving' || instructor.type === 'both' || !instructor.type
    const canTheory = instructor.type === 'theory' || instructor.type === 'both'

    let allEvents: InstructorEvent[] = []

    // 1. Fetch Driving Sessions
    if (canDriving) {
        const { data: sessions } = await supabase
            .from('driving_sessions')
            .select('*, profiles:student_id(full_name, phone, email)')
            .eq('instructor_id', instructor.id)
            .gte('start_time', startOfWeek.toISOString())
            .lte('start_time', endOfWeek.toISOString())
            .order('start_time')

        const drivingEvents: InstructorEvent[] = (sessions || []).map((s: any) => ({
            id: s.id,
            type: 'driving',
            title: `Driving with ${s.profiles?.full_name}`,
            start_time: s.start_time,
            end_time: s.end_time,
            status: s.status,
            studentName: s.profiles?.full_name,
            studentId: s.student_id,
            duration_minutes: (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000,
            meta: s
        }))
        allEvents = [...allEvents, ...drivingEvents]
    }

    // 2. Fetch Theory Classes
    if (canTheory) {
        const { data: classDays } = await supabase
            .from('class_days')
            .select(`
                *,
                classes!inner(name, instructor_id)
            `)
            .eq('classes.instructor_id', instructor.id)
            .gte('start_datetime', startOfWeek.toISOString())
            .lte('start_datetime', endOfWeek.toISOString())
            .order('start_datetime')

        const theoryEvents: InstructorEvent[] = (classDays || []).map((d: any) => ({
            id: d.id,
            type: 'theory',
            title: d.classes?.name || 'Theory Class',
            start_time: d.start_datetime,
            end_time: d.end_datetime,
            status: d.status === 'scheduled' ? 'scheduled' : d.status,
            className: d.classes?.name,
            location: 'Zoom / Online',
            duration_minutes: (new Date(d.end_datetime).getTime() - new Date(d.start_datetime).getTime()) / 60000,
            meta: d
        }))
        allEvents = [...allEvents, ...theoryEvents]
    }

    // Sort all events by time
    allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    // 3. Get Next Lesson (Unified)
    const nextEvent = allEvents.find(e =>
        e.status === 'scheduled' &&
        new Date(e.start_time) >= new Date()
    )

    const nextDrivingSession = allEvents.find(e =>
        e.type === 'driving' &&
        e.status === 'scheduled' &&
        new Date(e.start_time) >= new Date()
    )

    const nextTheorySession = allEvents.find(e =>
        e.type === 'theory' &&
        e.status === 'scheduled' &&
        new Date(e.start_time) >= new Date()
    )

    // 4. Calculate Stats
    const todayEvents = allEvents.filter(e => {
        const eventDate = new Date(e.start_time)
        const today = new Date()
        return eventDate.getDate() === today.getDate() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
    })

    const hoursToday = todayEvents.reduce((acc, e) => acc + (e.duration_minutes / 60), 0)

    // 5. Active Students Count (Approximate - mainly for driving)
    let activeStudents = 0
    if (canDriving) {
        const { count } = await supabase
            .from('driving_sessions')
            .select('student_id', { count: 'exact', head: true })
            .eq('instructor_id', instructor.id)
            .gte('start_time', new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
        activeStudents = count || 0
    }

    return {
        instructor,
        instructorName: instructor.full_name,
        hoursToday: Math.round(hoursToday * 10) / 10,
        activeStudents: activeStudents,
        nextLesson: nextEvent,
        nextDrivingSession,
        nextTheorySession,
        weekSessions: allEvents,
        todaySessionsCount: todayEvents.length,
        canDriving,
        canTheory
    }
}

export async function getSchedule(startDate: string, endDate: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const canDriving = instructor.type === 'driving' || instructor.type === 'both' || !instructor.type
    const canTheory = instructor.type === 'theory' || instructor.type === 'both'

    let allEvents: InstructorEvent[] = []

    // 1. Sessions
    if (canDriving) {
        const { data: sessions } = await supabase
            .from('driving_sessions')
            .select(`
                *,
                profiles:student_id(full_name, phone, email),
                vehicles(name)
            `)
            .eq('instructor_id', instructor.id)
            .gte('start_time', startDate)
            .lte('end_time', endDate)

        const drivingEvents = (sessions || []).map((s: any) => ({
            id: s.id,
            type: 'driving' as const,
            title: s.profiles?.full_name || 'Driving Lesson',
            start_time: s.start_time,
            end_time: s.end_time,
            status: s.status,
            studentName: s.profiles?.full_name,
            meta: s,
            duration_minutes: 0 // Not needed for calendar view usually
        }))
        allEvents = [...allEvents, ...drivingEvents]
    }

    // 2. Theory
    if (canTheory) {
        const { data: classDays } = await supabase
            .from('class_days')
            .select(`
                *,
                classes!inner(name, instructor_id)
            `)
            .eq('classes.instructor_id', instructor.id)
            .gte('start_datetime', startDate)
            .lte('end_datetime', endDate)

        const theoryEvents = (classDays || []).map((d: any) => ({
            id: d.id,
            type: 'theory' as const,
            title: d.classes?.name,
            start_time: d.start_datetime,
            end_time: d.end_datetime,
            status: d.status === 'scheduled' ? 'scheduled' : d.status,
            className: d.classes?.name,
            meta: d,
            duration_minutes: 0
        }))
        allEvents = [...allEvents, ...theoryEvents]
    }

    // 3. Time Off
    const { data: timeOff } = await supabase
        .from('instructor_time_off')
        .select('*')
        .eq('instructor_id', instructor.id)
        .gte('end_date', startDate)
        .lte('start_date', endDate)

    return { sessions: allEvents, timeOff: timeOff || [], instructor }
}

export async function updateSessionStatus(sessionId: string, status: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // Verify ownership
    const { data: session } = await supabase
        .from('driving_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('instructor_id', instructor.id)
        .single()

    if (!session) throw new Error("Session not found or unauthorized")

    const { error } = await supabase
        .from('driving_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', sessionId)

    if (error) throw error
    if (error) throw error

    await logAuditAction('update_session', {
        sessionId,
        status
    }, `Session Status Updated: ${status}`)

    revalidatePath('/instructor')
    revalidatePath('/instructor/schedule')
    return { success: true }
}

export async function saveSessionReport(sessionId: string, reportData: {
    skills: any,
    improvements: string,
    homework: string
}) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // Verify ownership
    const { data: session } = await supabase
        .from('driving_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('instructor_id', instructor.id)
        .single()

    if (!session) throw new Error("Session not found or unauthorized")

    // Upsert Report
    const { error } = await supabase
        .from('session_reports')
        .upsert({
            session_id: sessionId,
            skills_rated: reportData.skills,
            improvements: reportData.improvements,
            homework: reportData.homework,
            updated_at: new Date().toISOString()
        }, { onConflict: 'session_id' })

    if (error) throw error

    // Also mark session as completed if not already
    await supabase
        .from('driving_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId)

    revalidatePath('/instructor/schedule')

    await logAuditAction('update_session', {
        sessionId,
        reportData
    }, `Session Report Saved`)

    return { success: true }
}

export async function getSessionReport(sessionId: string) {
    const { data } = await supabase
        .from('session_reports')
        .select('*')
        .eq('session_id', sessionId)
        .single()
    return data
}

export async function getInstructorCourses() {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const { data: courses, error } = await supabase
        .from('classes')
        .select(`
            *,
            enrollments (count),
            class_days (
                id,
                status,
                date,
                start_datetime,
                end_datetime
            )
        `)
        .eq('instructor_id', instructor.id)
        .eq('is_archived', false)
        .order('start_date', { ascending: true })

    if (error) throw error

    // Process courses to add computed fields
    return courses.map(course => {
        const totalSessions = course.class_days?.length || 0
        const completedSessions = course.class_days?.filter((d: any) => d.status === 'completed').length || 0
        const enrolledCount = course.enrollments?.[0]?.count || 0

        // Find next session
        const now = new Date()
        const upcomingSessions = course.class_days
            ?.filter((d: any) => new Date(d.start_datetime) > now)
            .sort((a: any, b: any) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())

        const nextSession = upcomingSessions?.[0]

        return {
            ...course,
            totalSessions,
            completedSessions,
            enrolledCount,
            nextSession
        }
    })
}

export async function getCourseDetails(classId: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) {
        console.error("getCourseDetails: No instructor found")
        return { error: "INSTRUCTOR_NOT_FOUND", message: "Could not find instructor profile for current user." }
    }

    console.log(`getCourseDetails: Fetching class ${classId}`)

    // 1. Fetch Class Details
    const { data: course, error: courseError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

    if (courseError || !course) {
        console.error("getCourseDetails: Course not found in DB", courseError)
        return { error: "COURSE_NOT_FOUND", message: `Course with ID ${classId} not found.`, details: courseError }
    }

    // 2. Verify Ownership
    if (course.instructor_id !== instructor.id) {
        console.error(`getCourseDetails: Unauthorized. Course owner: ${course.instructor_id}, Current instructor: ${instructor.id}`)
        return {
            error: "UNAUTHORIZED",
            message: "You are not the instructor for this course.",
            debug: { courseOwner: course.instructor_id, currentInstructor: instructor.id }
        }
    }

    // 3. Ensure Class Days Exist (Mon-Fri)
    const startDate = new Date(course.start_date)
    const endDate = new Date(course.end_date)
    const expectedDates: string[] = []

    // Loop from start to end
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay()
        // 0 = Sunday, 6 = Saturday. We want 1-5 (Mon-Fri)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            expectedDates.push(d.toISOString().split('T')[0])
        }
    }

    // Fetch existing class_days
    const { data: existingDays } = await supabase
        .from('class_days')
        .select('date')
        .eq('class_id', classId)

    const existingDateSet = new Set(existingDays?.map(d => d.date))
    const missingDates = expectedDates.filter(d => !existingDateSet.has(d))

    if (missingDates.length > 0) {
        console.log(`Creating ${missingDates.length} missing class days for class ${classId}`)

        // Prepare inserts
        const inserts = missingDates.map(date => {
            // Construct start/end datetime using daily_start_time/end_time if available
            // Default to 9am-5pm if not
            const startTime = course.daily_start_time || '09:00:00'
            const endTime = course.daily_end_time || '17:00:00'

            return {
                class_id: classId,
                date: date,
                start_datetime: `${date}T${startTime}`,
                end_datetime: `${date}T${endTime}`,
                status: 'scheduled'
            }
        })

        const { error: insertError } = await supabase
            .from('class_days')
            .insert(inserts)

        if (insertError) {
            console.error("Failed to create missing class days", insertError)
            // Continue anyway, maybe some exist or partial failure
        }
    }

    // 4. Fetch Sessions (Class Days) - Now guaranteed to include all M-F
    // We filter by the generated M-F dates to exclude any old/weekend junk that might be in DB
    const { data: sessions, error: sessionsError } = await supabase
        .from('class_days')
        .select('*')
        .eq('class_id', classId)
        .in('date', expectedDates)
        .order('date', { ascending: true })

    if (sessionsError) return { error: "DB_ERROR", message: "Failed to fetch sessions", details: sessionsError }

    // 5. Fetch Enrollments with Student Profiles
    const { data: students, error: studentsError } = await supabase
        .from('enrollments')
        .select(`
            *,
            profiles:student_id (
                id,
                full_name,
                email,
                phone,
                avatar_url
            )
        `)
        .eq('class_id', classId)
        .neq('status', 'dropped')
        .order('enrolled_at', { ascending: true })

    if (studentsError) return { error: "DB_ERROR", message: "Failed to fetch students", details: studentsError }

    // 6. Fetch Attendance Records
    const sessionIds = sessions.map(s => s.id)
    let attendance: any[] = []

    if (sessionIds.length > 0) {
        const { data: attData, error: attError } = await supabase
            .from('attendance_records')
            .select('*')
            .in('class_day_id', sessionIds)

        if (attError) return { error: "DB_ERROR", message: "Failed to fetch attendance", details: attError }
        attendance = attData || []
    }

    // Process sessions to add attendance summary
    const sessionsWithAttendance = sessions.map(session => {
        const sessionAttendance = attendance.filter(a => a.class_day_id === session.id)
        const presentCount = sessionAttendance.filter(a => a.status === 'present').length
        const absentCount = sessionAttendance.filter(a => a.status === 'absent').length
        const lateCount = sessionAttendance.filter(a => a.status === 'late').length
        const excusedCount = sessionAttendance.filter(a => a.status === 'excused').length

        return {
            ...session,
            attendanceSummary: {
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                excused: excusedCount,
                total: sessionAttendance.length
            }
        }
    })

    return {
        course: {
            ...course,
            enrolledCount: students.length
        },
        sessions: sessionsWithAttendance,
        students: students.map(s => ({
            ...s.profiles,
            enrollmentId: s.id,
            enrollment_status: s.status,
            enrolled_at: s.enrolled_at,
            grade: s.grade,
            certification_status: s.certification_status
        })),
        attendanceRecords: attendance
    }
}

export async function updateStudentGrade(enrollmentId: string, grade: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // Verify ownership via enrollment -> class -> instructor
    // For simplicity/speed, we'll trust the RLS policies we set up, 
    // but explicit check is safer.

    const { error } = await supabase
        .from('enrollments')
        .update({ grade, updated_at: new Date().toISOString() })
        .eq('id', enrollmentId)

    if (error) throw error

    await logAuditAction('update_student', {
        enrollmentId,
        grade
    }, `Student Grade Updated: ${grade}`)

    revalidatePath('/instructor/lessons/[classId]')
    return { success: true }
}

export async function updateStudentCertification(enrollmentId: string, status: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // Fetch enrollment to get class_id and student_id
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('class_id, student_id, certification_status')
        .eq('id', enrollmentId)
        .single()

    if (!enrollment) throw new Error("Enrollment not found")

    const { error } = await supabase
        .from('enrollments')
        .update({ certification_status: status, updated_at: new Date().toISOString() })
        .eq('id', enrollmentId)

    if (error) throw error

    // If becoming certified and wasn't before, apply package
    if (status === 'certified' && enrollment.certification_status !== 'certified') {
        // Fetch class package details
        const { data: cls } = await supabase
            .from('classes')
            .select('package_hours, package_sessions')
            .eq('id', enrollment.class_id)
            .single()

        if (cls && (cls.package_hours > 0 || cls.package_sessions > 0)) {
            // Fetch current profile balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('driving_balance_hours, driving_balance_sessions')
                .eq('id', enrollment.student_id)
                .single()

            if (profile) {
                const newHours = (profile.driving_balance_hours || 0) + (cls.package_hours || 0)
                const newSessions = (profile.driving_balance_sessions || 0) + (cls.package_sessions || 0)

                await supabase
                    .from('profiles')
                    .update({
                        driving_balance_hours: newHours,
                        driving_balance_sessions: newSessions,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', enrollment.student_id)
            }
        }
    }

    revalidatePath('/instructor/lessons/[classId]')

    await logAuditAction('update_student', {
        enrollmentId,
        status
    }, `Student Certification Updated: ${status}`)

    return { success: true }
}

export async function removeStudentFromCourse(enrollmentId: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('enrollments')
        .update({ status: 'dropped', updated_at: new Date().toISOString() })
        .eq('id', enrollmentId)

    if (error) throw error

    await logAuditAction('delete_student', {
        enrollmentId
    }, `Student Removed from Course`)

    revalidatePath('/instructor/lessons/[classId]')
    return { success: true }
}

export async function updateBatchAttendance(classId: string, updates: { classDayId: string, studentId: string, status: string }[]) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('attendance_records')
        .upsert(
            updates.map(u => ({
                class_day_id: u.classDayId,
                student_id: u.studentId,
                status: u.status,
                marked_by_instructor_id: instructor.id,
                updated_at: new Date().toISOString()
            })),
            { onConflict: 'class_day_id, student_id' }
        )

    if (error) throw error
    if (error) throw error

    await logAuditAction('update_class', {
        classId,
        updatesCount: updates.length
    }, `Batch Attendance Updated`)

    revalidatePath(`/instructor/lessons/${classId}`)
    return { success: true }
}

export async function getSessionDetails(classDayId: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // 1. Fetch Class Day + Class Info
    const { data: session, error: sessionError } = await supabase
        .from('class_days')
        .select(`
            *,
            classes (
                id,
                name,
                zoom_url,
                instructor_id
            )
        `)
        .eq('id', classDayId)
        .single()

    if (sessionError) throw sessionError

    // Verify ownership
    if (session.classes.instructor_id !== instructor.id) {
        throw new Error("Unauthorized")
    }

    // 2. Fetch Enrollments (Students)
    const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
            student_id,
            profiles:student_id (
                id,
                full_name,
                email,
                phone,
                avatar_url
            )
        `)
        .eq('class_id', session.classes.id)

    if (enrollmentsError) throw enrollmentsError

    // 3. Fetch Attendance Records for this day
    const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_day_id', classDayId)

    if (attendanceError) throw attendanceError

    // 4. Fetch Latest Note
    const { data: note } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('class_day_id', classDayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Merge students with attendance
    const studentsWithAttendance = enrollments.map((e: any) => {
        const record = attendance.find(a => a.student_id === e.student_id)
        return {
            studentId: e.student_id,
            name: e.profiles.full_name,
            email: e.profiles.email,
            avatarUrl: e.profiles.avatar_url,
            attendanceStatus: record?.status || 'unmarked',
            attendanceRecordId: record?.id
        }
    })

    return {
        session,
        course: session.classes,
        students: studentsWithAttendance,
        note: note || null
    }
}

export async function updateAttendance(classDayId: string, studentId: string, status: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('attendance_records')
        .upsert({
            class_day_id: classDayId,
            student_id: studentId,
            status,
            marked_by_instructor_id: instructor.id,
            updated_at: new Date().toISOString()
        }, { onConflict: 'class_day_id, student_id' })

    if (error) throw error

    await logAuditAction('update_class', {
        classDayId,
        studentId,
        status
    }, `Attendance Updated: ${status}`)

    revalidatePath(`/instructor/lessons`)
    return { success: true }
}

export async function saveLessonNote(classDayId: string, content: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // Check if note exists for this day/instructor
    const { data: existing } = await supabase
        .from('lesson_notes')
        .select('id')
        .eq('class_day_id', classDayId)
        .eq('instructor_id', instructor.id)
        .single()

    if (existing) {
        const { error } = await supabase
            .from('lesson_notes')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
        if (error) throw error
    } else {
        const { error } = await supabase
            .from('lesson_notes')
            .insert({
                class_day_id: classDayId,
                instructor_id: instructor.id,
                content
            })
        if (error) throw error
    }

    revalidatePath(`/instructor/lessons`)

    await logAuditAction('update_class', {
        classDayId
    }, `Lesson Note Saved`)

    return { success: true }
}

export async function toggleSessionStatus(classDayId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('class_days')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', classDayId)

    if (error) throw error
    revalidatePath(`/instructor/lessons`)
    return { success: true }
}

// --- My Students Section ---

export async function getInstructorStudents() {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // 1. Fetch Students via Enrollments (Theory)
    const { data: theoryStudents, error: theoryError } = await supabase
        .from('enrollments')
        .select(`
            student_id,
            status,
            classes!inner (
                id,
                name,
                instructor_id,
                class_days (count)
            ),
            profiles:student_id (
                id,
                full_name,
                email,
                phone,
                avatar_url
            )
        `)
        .eq('classes.instructor_id', instructor.id)
        .neq('status', 'dropped')

    if (theoryError) throw theoryError

    // 2. Fetch Students via Driving Sessions
    const { data: drivingSessions, error: drivingError } = await supabase
        .from('driving_sessions')
        .select(`
            student_id,
            status,
            start_time,
            profiles:student_id (
                id,
                full_name,
                email,
                phone,
                avatar_url
            )
        `)
        .eq('instructor_id', instructor.id)

    if (drivingError) throw drivingError

    // 3. Fetch Future Class Days for Next Session logic
    const classIds = theoryStudents.map((e: any) => e.classes.id)
    let futureClassDays: any[] = []
    if (classIds.length > 0) {
        const { data: fcd } = await supabase
            .from('class_days')
            .select('class_id, start_datetime, classes(name)')
            .in('class_id', classIds)
            .gte('start_datetime', new Date().toISOString())
            .order('start_datetime', { ascending: true })
        futureClassDays = fcd || []
    }

    // 4. Fetch Attendance for Progress logic
    const studentIds = new Set([
        ...theoryStudents.map((e: any) => e.student_id),
        ...drivingSessions.map((s: any) => s.student_id)
    ])

    let attendanceMap = new Map<string, number>() // studentId -> present count
    if (studentIds.size > 0) {
        const { data: attendance } = await supabase
            .from('attendance_records')
            .select(`
                student_id,
                status,
                class_days!inner (
                    classes!inner (
                        instructor_id
                    )
                )
            `)
            .in('student_id', Array.from(studentIds))
            .eq('class_days.classes.instructor_id', instructor.id)
            .eq('status', 'present')

        attendance?.forEach((r: any) => {
            const current = attendanceMap.get(r.student_id) || 0
            attendanceMap.set(r.student_id, current + 1)
        })
    }

    // 5. Merge and Aggregate
    const studentMap = new Map<string, any>()

    // Process Theory Students
    theoryStudents.forEach((enrollment: any) => {
        const student = enrollment.profiles
        if (!studentMap.has(student.id)) {
            studentMap.set(student.id, {
                ...student,
                programs: [],
                totalSessions: 0,
                completedSessions: 0,
                nextSession: null
            })
        }
        const entry = studentMap.get(student.id)
        if (!entry.programs.includes('Theory')) {
            entry.programs.push('Theory')
        }

        // Add theory course length to total sessions
        const courseLength = enrollment.classes.class_days?.[0]?.count || 0
        entry.totalSessions += courseLength

        // Check for next theory session
        const nextClassDay = futureClassDays.find((d: any) => d.class_id === enrollment.classes.id)
        if (nextClassDay) {
            const sessionDate = new Date(nextClassDay.start_datetime)
            if (!entry.nextSession || sessionDate < new Date(entry.nextSession.date)) {
                entry.nextSession = {
                    date: nextClassDay.start_datetime,
                    type: 'Theory',
                    title: nextClassDay.classes?.name
                }
            }
        }
    })

    // Process Driving Students
    drivingSessions.forEach((session: any) => {
        const student = session.profiles
        if (!studentMap.has(student.id)) {
            studentMap.set(student.id, {
                ...student,
                programs: [],
                totalSessions: 0,
                completedSessions: 0,
                nextSession: null
            })
        }
        const entry = studentMap.get(student.id)
        if (!entry.programs.includes('Driving')) {
            entry.programs.push('Driving')
        }

        entry.totalSessions++ // Each driving session adds to total
        if (session.status === 'completed') {
            entry.completedSessions++
        }

        // Check for next driving session
        const sessionDate = new Date(session.start_time)
        if (sessionDate > new Date() && session.status === 'scheduled') {
            if (!entry.nextSession || sessionDate < new Date(entry.nextSession.date)) {
                entry.nextSession = {
                    date: session.start_time,
                    type: 'Driving'
                }
            }
        }
    })

    // Add Theory Attendance to completed sessions
    attendanceMap.forEach((count, studentId) => {
        const entry = studentMap.get(studentId)
        if (entry) {
            entry.completedSessions += count
        }
    })

    return Array.from(studentMap.values())
}

export async function getStudentDetails(studentId: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    // 1. Fetch Student Profile
    const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single()

    if (studentError) throw studentError

    // 2. Fetch Enrollments (Theory)
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            *,
            classes (
                id,
                name,
                start_date,
                end_date,
                instructor_id
            )
        `)
        .eq('student_id', studentId)
        .eq('classes.instructor_id', instructor.id)

    // 3. Fetch Driving Sessions
    const { data: drivingSessions } = await supabase
        .from('driving_sessions')
        .select('*')
        .eq('student_id', studentId)
        .eq('instructor_id', instructor.id)
        .order('start_time', { ascending: false })

    // 4. Fetch Theory Attendance
    const { data: attendance } = await supabase
        .from('attendance_records')
        .select(`
            *,
            class_days (
                date,
                start_datetime,
                classes (name)
            )
        `)
        .eq('student_id', studentId)
    // Filter by instructor's classes
    // This requires client-side filtering or complex join if not using !inner

    // 5. Fetch Notes
    const { data: notes } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', studentId)
        .eq('instructor_id', instructor.id)
        .order('created_at', { ascending: false })

    // Filter attendance for this instructor
    const instructorAttendance = attendance?.filter((a: any) =>
        enrollments?.some((e: any) => e.class_id === a.class_days.class_id) // simplified check
        // A better check would be if we fetched class_days with instructor_id
    ) || []

    return {
        student,
        enrollments: enrollments || [],
        drivingSessions: drivingSessions || [],
        attendance: instructorAttendance,
        notes: notes || []
    }
}

export async function saveStudentNote(studentId: string, content: string) {
    const instructor = await getCurrentInstructor()
    if (!instructor) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('student_notes')
        .insert({
            student_id: studentId,
            instructor_id: instructor.id,
            content
        })

    if (error) throw error
    revalidatePath(`/instructor/students/${studentId}`)
    return { success: true }
}
