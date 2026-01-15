import { NextResponse } from 'next/server'
export const runtime = 'edge';

export async function GET() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
        return NextResponse.json({ error: "Missing Google Config" }, { status: 500 })
    }

    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email' // To get the email address
    ].join(' ')

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline', // Crucial for getting refresh_token
        prompt: 'consent', // Force consent to ensure we get refresh_token
    })

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
