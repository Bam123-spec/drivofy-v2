"use server"

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getGoogleAccessToken } from '@/lib/googleCalendar'

async function getSupabaseAdmin() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )
}

export async function getAdminSchedule(timeMin: string, timeMax: string) {
    const supabase = await getSupabaseAdmin()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error("Unauthorized")

    // 2. Fetch Driving Sessions
    const { data: drivingSessions, error: drivingError } = await supabase
        .from('driving_sessions')
        .select(`
            *,
            profiles (full_name),
            instructors (full_name)
        `)
        .gte('start_time', timeMin)
        .lte('end_time', timeMax)

    if (drivingError) throw drivingError

    // 3. Fetch Classes (Theory)
    // Note: Classes usually have start_date/end_date in YYYY-MM-DD.
    // We filter roughly by date range.
    const startDate = timeMin.split('T')[0]
    const endDate = timeMax.split('T')[0]

    const { data: classes, error: classError } = await supabase
        .from('classes')
        .select(`
            *,
            instructors (full_name)
        `)
        .gte('end_date', startDate)
        .lte('start_date', endDate)

    if (classError) throw classError

    // 4. Fetch Google Calendar Busy Times (if connected)
    let googleBusy: any[] = []
    try {
        const accessToken = await getGoogleAccessToken(user.id)
        if (accessToken) {
            const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timeMin,
                    timeMax,
                    items: [{ id: 'primary' }],
                }),
            })

            if (response.ok) {
                const data = await response.json()
                googleBusy = data.calendars.primary.busy || []
            }
        }
    } catch (e) {
        console.error("Error fetching Google busy times:", e)
    }

    return {
        drivingSessions,
        classes,
        googleBusy
    }
}
