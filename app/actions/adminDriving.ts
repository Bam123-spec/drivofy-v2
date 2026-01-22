'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getInstructorBusyTimes, createCalendarEvent } from '@/lib/googleCalendar'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function getDrivingSessions(filters?: {
    instructorId?: string,
    studentId?: string,
    status?: string,
    startDate?: string,
    endDate?: string
}) {
    let query = supabase
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
    const { data, error } = await supabase.from('instructors').select('*').eq('status', 'active').order('full_name')
    if (error) throw new Error(error.message)
    return data
}

export async function getStudents() {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').order('full_name')
    if (error) throw new Error(error.message)
    return data
}

export async function getVehicles() {
    const { data, error } = await supabase.from('vehicles').select('*').eq('status', 'active').order('name')
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

        // 0. Resolve Profile ID (Required for Google Sync)
        const { data: instructor } = await supabase
            .from('instructors')
            .select('profile_id, full_name')
            .eq('id', data.instructorId)
            .single()

        if (!instructor?.profile_id) {
            console.warn(`⚠️ No profile_id found for instructor ${data.instructorId}, skipping GCal sync.`)
        }

        // 1. Conflict Check (Internal)
        const { data: internalConflicts } = await supabase
            .from('driving_sessions')
            .select('id')
            .eq('instructor_id', data.instructorId)
            .neq('status', 'cancelled')
            .lt('start_time', endDateTime.toISOString())
            .gt('end_time', startDateTime.toISOString())

        if (internalConflicts && internalConflicts.length > 0) {
            return { success: false, error: "It conflicts with another scheduled time (Internal)" }
        }

        // 2. Conflict Check (Google Calendar)
        if (instructor?.profile_id) {
            try {
                const busySlots = await getInstructorBusyTimes(
                    instructor.profile_id,
                    startDateTime.toISOString(),
                    endDateTime.toISOString()
                )
                if (busySlots && busySlots.length > 0) {
                    return { success: false, error: `It conflicts with ${instructor.full_name}'s Google Calendar` }
                }
            } catch (e) {
                console.warn("Google Calendar check failed, proceeding anyway", e)
            }
        }

        // 3. Insert Session
        const { data: session, error } = await supabase
            .from('driving_sessions')
            .insert([{
                student_id: data.studentId,
                instructor_id: data.instructorId,
                vehicle_id: data.vehicleId,
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

        // 4. Sync to Google Calendar
        if (instructor?.profile_id) {
            try {
                await createCalendarEvent(instructor.profile_id, {
                    studentName: session.profiles?.full_name || "Student",
                    title: `Lesson: ${session.profiles?.full_name || "Student"}`,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    description: `Driving Lesson (Drivofy: ${session.profiles?.full_name})`,
                    location: "Drivofy Driving School"
                })
            } catch (e) {
                console.error("GCal Sync Failed", e)
            }
        }

        revalidatePath('/admin/driving')
        revalidatePath('/admin/schedule')
        return { success: true }
    } catch (error: any) {
        console.error("Create Session Error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateSessionStatus(id: string, status: string) {
    const { error } = await supabase
        .from('driving_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/driving')
    return { success: true }
}

export async function updateSessionNotes(id: string, notes: string) {
    const { error } = await supabase
        .from('driving_sessions')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/driving')
    return { success: true }
}
