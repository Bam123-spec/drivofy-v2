import { supabase } from "@/lib/supabaseClient" // Note: This is client-side client. We need a server-side client or use this one carefully.
// Actually, for API routes and server actions, we should use createClient from @supabase/supabase-js or @supabase/ssr
// But to keep it simple and consistent with the project structure, I'll check if there's a server client.
// The prompt says "Use Supabase (Postgres + RLS)".
// I will use a direct supabase-js client for the utility functions that run on the server.

import { createClient } from '@supabase/supabase-js'

// Initialize a server-side Supabase client for admin tasks (like updating tokens)
// OR use the service role key if available, but better to use the user's session if possible.
// However, for background tasks (refreshing tokens), we might need service role.
// Let's assume we use the standard client but we need to handle RLS.
// Actually, `getGoogleAccessToken` might be called by a user action, so RLS works.
// But `refresh_token` updates might need privileges.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // We need this for background token updates if RLS blocks us

// Create a service client for token operations that might happen in background
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

/**
 * Retrieves a valid Google Access Token for the instructor.
 * Automatically refreshes if expired.
 */
export async function getGoogleAccessToken(instructorId: string): Promise<string | null> {
    // 1. Get token from DB
    const { data: tokenRecord, error } = await supabaseAdmin
        .from('instructor_google_tokens')
        .select('*')
        .eq('instructor_id', instructorId)
        .single()

    if (error || !tokenRecord) {
        console.error("❌ Error fetching Google token:", error)
        return null
    }

    // 2. Check expiry (add 5 minute buffer)
    const expiry = new Date(tokenRecord.expiry_timestamp).getTime()
    const now = Date.now()
    const minutesLeft = (expiry - now) / 1000 / 60

    console.log(`🔍 Token Check: Expires in ${minutesLeft.toFixed(1)} mins`)

    if (expiry > now + 5 * 60 * 1000) {
        console.log("✅ Token is valid")
        return tokenRecord.access_token
    }

    // 3. Refresh Token
    console.log("🔄 Refreshing Google Access Token...")
    try {
        if (!tokenRecord.refresh_token) {
            console.error("❌ No refresh token available")
            return null
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: tokenRecord.refresh_token,
                grant_type: 'refresh_token',
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("❌ Failed to refresh token:", data)
            // If refresh fails (e.g. revoked), we might want to delete the record or mark as disconnected
            return null
        }

        const newAccessToken = data.access_token
        const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString()

        // 4. Update DB
        await supabaseAdmin
            .from('instructor_google_tokens')
            .update({
                access_token: newAccessToken,
                expiry_timestamp: newExpiry,
                updated_at: new Date().toISOString()
            })
            .eq('id', tokenRecord.id)

        console.log("✅ Token refreshed successfully")
        return newAccessToken
    } catch (err) {
        console.error("❌ Exception refreshing token:", err)
        return null
    }
}

/**
 * Creates a calendar event in the instructor's primary calendar.
 */
export async function createCalendarEvent(instructorId: string, eventData: {
    studentName: string,
    startTime: string, // ISO string
    endTime: string,   // ISO string
    description?: string,
    location?: string
}) {
    console.log("📅 Creating Calendar Event for:", instructorId)
    const accessToken = await getGoogleAccessToken(instructorId)
    if (!accessToken) {
        console.error("❌ No access token found for instructor:", instructorId)
        throw new Error("Could not get access token")
    }

    const event = {
        summary: `Driving Lesson - ${eventData.studentName}`,
        location: eventData.location || "Driving School",
        description: eventData.description || "Driving lesson booked via Drivofy.",
        start: {
            dateTime: eventData.startTime,
            timeZone: 'UTC', // Or instructor's timezone
        },
        end: {
            dateTime: eventData.endTime,
            timeZone: 'UTC',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 },
            ],
        },
    }

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    })

    if (!response.ok) {
        const error = await response.json()
        console.error("❌ Google Calendar API Error:", error)
        throw new Error(`Google Calendar API Error: ${JSON.stringify(error)}`)
    }

    const result = await response.json()
    console.log("✅ Event created successfully:", result.htmlLink)
    return result
}

/**
 * Fetches busy times from the instructor's calendar.
 */
export async function getInstructorBusyTimes(instructorId: string, timeMin: string, timeMax: string) {
    const accessToken = await getGoogleAccessToken(instructorId)
    if (!accessToken) return [] // Or throw error

    const body = {
        timeMin,
        timeMax,
        items: [{ id: 'primary' }],
    }

    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        console.error("Error fetching freeBusy:", await response.json())
        return []
    }

    const data = await response.json()
    return data.calendars.primary.busy || []
}
