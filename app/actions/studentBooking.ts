'use server'

import { createClient } from '@/lib/supabase/server'
import { createCalendarEvent, getInstructorBusyTimes } from '@/lib/googleCalendar'
import { revalidatePath } from 'next/cache'

import { cookies } from "next/headers"
import { logAuditAction } from "@/app/actions/audit"

export async function bookStudentLesson(data: {
    instructorId: string,
    date: string,
    time: string,
    duration: number, // hours
    plan_key?: string
}) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // 1. Check Student Credits
        const { data: profile } = await supabase
            .from('profiles')
            .select('driving_balance_sessions, driving_balance_hours, full_name, email, phone, btw_cooldown_until')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return { success: false, error: "Profile not found" }
        }

        // 1b. Check BTW Cooldown
        const isBTW = data.plan_key === 'btw';
        if (isBTW && profile.btw_cooldown_until) {
            const cooldownUntil = new Date(profile.btw_cooldown_until);
            if (cooldownUntil > new Date()) {
                return {
                    success: false,
                    error: `BTW Cooldown active. You can book another BTW session after ${cooldownUntil.toLocaleString('en-US', { timeZone: 'America/New_York' })}`
                }
            }
        }

        // 1c. Enforce BTW Duration (2 hours)
        if (isBTW && data.duration !== 2) {
            return { success: false, error: "Behind-the-Wheel sessions must be exactly 2 hours." }
        }

        if ((profile.driving_balance_sessions || 0) <= 0) {
            return { success: false, error: "Insufficient session credits. Please contact admin to purchase more." }
        }

        // Optional: Check hours balance too? 
        // For now, let's strictly enforce sessions as the primary unit for booking.
        // But we should deduct hours as well.

        // 2. Calculate Timestamps
        const startDateTime = new Date(`${data.date}T${data.time}`)
        const endDateTime = new Date(startDateTime.getTime() + data.duration * 60 * 60 * 1000)

        // 3. Check for Conflicts (Instructor)
        console.log("🔍 Checking for conflicts...")

        // 3a. Check Google Calendar Busy Times
        try {
            const busySlots = await getInstructorBusyTimes(
                data.instructorId,
                startDateTime.toISOString(),
                endDateTime.toISOString()
            )

            if (busySlots && busySlots.length > 0) {
                console.warn("⚠️ Google Calendar Conflict Detected:", busySlots)
                return { success: false, error: "The instructor is not available at this time (Calendar Conflict)" }
            }
        } catch (error) {
            console.error("⚠️ Failed to check Google Calendar availability:", error)
            // Fail safe: if we can't verify availability, we shouldn't book?
            // Or proceed with warning? Let's be strict for students.
            return { success: false, error: "Could not verify instructor availability. Please try again later." }
        }

        // 3b. Check Internal Database Conflicts
        const { data: internalConflicts } = await supabase
            .from('driving_sessions')
            .select('id')
            .eq('instructor_id', data.instructorId)
            .neq('status', 'cancelled')
            .lt('start_time', endDateTime.toISOString())
            .gt('end_time', startDateTime.toISOString())

        if (internalConflicts && internalConflicts.length > 0) {
            console.warn("⚠️ Internal Database Conflict Detected")
            return { success: false, error: "The instructor is already booked at this time." }
        }

        // 4. Create Session & Deduct Credits (Transaction-like)
        // Supabase doesn't support multi-table transactions via client directly easily without RPC,
        // but we can do it sequentially. If insert fails, we don't deduct.

        const { data: session, error: insertError } = await supabase
            .from('driving_sessions')
            .insert([{
                student_id: user.id,
                instructor_id: data.instructorId,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: 'scheduled',
                source: 'student_portal',
                duration_minutes: data.duration * 60,
                plan_key: data.plan_key || null
            }])
            .select()
            .single()

        if (insertError) throw new Error(`Database Error: ${insertError.message}`)

        // 5. Deduct Credits
        const newSessions = (profile.driving_balance_sessions || 0) - 1
        const newHours = (profile.driving_balance_hours || 0) - data.duration

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                driving_balance_sessions: newSessions,
                driving_balance_hours: newHours,
                btw_cooldown_until: isBTW ? new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000).toISOString() : profile.btw_cooldown_until,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (updateError) {
            console.error("Failed to deduct credits!", updateError)
            // Critical error: Session created but credits not deducted.
            // In a real app, we'd want to rollback or alert admin.
        } else if (isBTW) {
            // 5b. Queue Email (Cooldown or Final Completion)
            const remainingSessions = newSessions
            let emailType = 'btw_cooldown_ready'
            let sendAt = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24h later

            // Final Session Check
            if (remainingSessions <= 0) {
                console.log("🎓 Final BTW session completed! Queuing completion email.")
                emailType = 'btw_completion_final'
                // Optional: Send final email 24h later too? Or immediately?
                // Keeping 24h later consistency or maybe 1 hour later? 
                // Let's stick to 24h after last lesson for "completion" feel.
            }

            const { error: queueError } = await supabase
                .from('email_queue')
                .upsert({
                    student_id: user.id,
                    email_type: emailType,
                    send_at: sendAt,
                    status: 'pending'
                }, {
                    onConflict: 'student_id, email_type, send_at'
                });

            if (queueError) {
                console.error(`❌ Failed to queue ${emailType} email:`, queueError);
            } else {
                console.log(`✅ ${emailType} email queued for:`, sendAt);
            }
        }

        // 5b. Lock Time Slot
        const { error: lockError } = await supabase
            .from('instructor_availability')
            .insert({
                instructor_id: data.instructorId,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: 'booked',
                booking_id: session.id
            })

        if (lockError) {
            console.error('❌ Failed to lock slot:', lockError)
        } else {
            console.log('🔒 Slot locked')
        }

        // 6. Sync to Admin's Google Calendar
        try {
            console.log("🚀 Attempting to sync to Google Calendar...")


            // Get the admin's profile ID (first account with Google Calendar connected)
            // Use service client to access tokens across users
            const { createAdminClient } = await import('@/lib/supabase/admin')
            const supabaseAdmin = createAdminClient()

            const { data: connectedAccount } = await supabaseAdmin
                .from('user_google_tokens')
                .select('profile_id')
                .limit(1)
                .single()

            if (!connectedAccount) {
                console.warn("⚠️ No Google Calendar connected. Skipping sync.")
            } else {
                const googleEvent = await createCalendarEvent(connectedAccount.profile_id, {
                    studentName: profile.full_name || "Student",
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    description: `Driving Lesson (Student Booked)\nStudent: ${profile.full_name}\nPhone: ${profile.phone || 'N/A'}\nEmail: ${profile.email}`,
                    location: "Selam Driving School"
                })

                // Save Google Event ID
                await supabase
                    .from('driving_sessions')
                    .update({ google_event_id: googleEvent.id })
                    .eq('id', session.id)

                console.log("✅ Google Calendar Sync Successful")
            }
        } catch (calendarError) {
            console.error("❌ Google Calendar Sync Failed:", calendarError)
            // Non-critical for the booking itself
        }

        revalidatePath('/dashboard')

        await logAuditAction('create_session', {
            instructorId: data.instructorId,
            date: data.date,
            time: data.time,
            duration: data.duration
        }, `Student Booked Driving Lesson`)

        return { success: true }

    } catch (error: any) {
        console.error("Book Student Lesson Error:", error)
        return { success: false, error: error.message }
    }
}
