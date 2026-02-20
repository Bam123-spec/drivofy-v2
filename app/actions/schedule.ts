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
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

    const allowedRoles = new Set(['admin', 'super_admin', 'owner', 'manager', 'staff'])
    if (!profile?.role || !allowedRoles.has(profile.role)) throw new Error("Unauthorized")

    // 2. Fetch Driving Sessions
    const { data: drivingSessions, error: drivingError } = await supabase
        .from('driving_sessions')
        .select(`
            *,
            profiles (full_name),
            instructors (full_name)
        `)
        // include sessions that overlap this time window (not only fully contained)
        .lte('start_time', timeMax)
        .gte('end_time', timeMin)

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

    // 4. Fetch class days within week so schedule mirrors real class sessions,
    // including weekend classes and non-default patterns.
    const classIds = (classes || []).map((c: any) => c.id).filter(Boolean)
    const { data: classDays, error: classDaysError } = classIds.length > 0
        ? await supabase
            .from('class_days')
            .select('id, class_id, start_datetime, end_datetime')
            .in('class_id', classIds)
            // include rows overlapping this week
            .lte('start_datetime', timeMax)
            .gte('end_datetime', timeMin)
        : { data: [], error: null as any }

    if (classDaysError) throw classDaysError

    // 5. Fetch Google Calendar Events for connected profiles in the same organization.
    const orgProfilesResult = profile.organization_id
        ? await supabase
            .from('profiles')
            .select('id')
            .eq('organization_id', profile.organization_id)
        : { data: [{ id: user.id }], error: null as any }
    if (orgProfilesResult.error) throw orgProfilesResult.error

    const profileIds = (orgProfilesResult.data || []).map((p: any) => p.id).filter(Boolean)
    const { data: tokens, error: tokensError } = profileIds.length > 0
        ? await supabase
            .from('user_google_tokens')
            .select('profile_id, email')
            .in('profile_id', profileIds)
        : { data: [], error: null as any }
    if (tokensError) throw tokensError

    let googleEvents: any[] = []

    // Add current user to potential tokens if not already there (to ensure admin sync)
    const tokenMap = new Map<string, { profile_id: string, email: string }>()
    for (const token of tokens || []) {
        if (!token?.profile_id) continue
        tokenMap.set(token.profile_id, token)
    }
    if (user.id && !tokenMap.has(user.id)) {
        tokenMap.set(user.id, { profile_id: user.id, email: user.email || 'Admin' })
    }
    const allTokens = Array.from(tokenMap.values())

    if (allTokens.length > 0) {
        console.log(`🔍 Unified Sync: Fetching for ${allTokens.length} accounts`)

        // Fetch events for each connected account in parallel
        const eventPromises = allTokens.map(async (token) => {
            try {
                const accessToken = await getGoogleAccessToken(token.profile_id)
                if (!accessToken) {
                    console.log(`⏳ No token record for ${token.email}`)
                    return []
                }

                const response = await fetch(
                    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        cache: 'no-store'
                    })

                if (response.ok) {
                    const data = await response.json()
                    console.log(`✅ Fetched ${data.items?.length || 0} events for ${token.email}`)
                    // Map items and include instructor hint if possible
                    return (data.items || []).map((item: any) => ({
                        id: `${token.profile_id}-${item.id}`,
                        title: `${item.summary || 'Busy'} (${token.email?.split('@')[0]})`,
                        start: item.start.dateTime || item.start.date,
                        end: item.end.dateTime || item.end.date,
                        type: 'google',
                        instructorEmail: token.email
                    }))
                } else {
                    const err = await response.json()
                    console.error(`❌ GCal API Error for ${token.email}:`, err)
                }
            } catch (e) {
                console.error(`💥 Exception fetching Google events for ${token.email}:`, e)
            }
            return []
        })

        const results = await Promise.all(eventPromises)
        googleEvents = results.flat()
        console.log(`✨ Total Google events found: ${googleEvents.length}`)
    }

    return {
        drivingSessions,
        classes,
        classDays: classDays || [],
        googleEvents
    }
}
