import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use service role to write tokens securely regardless of current session state in this route
// (though ideally we'd use the cookie-based client to verify the user first)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return NextResponse.redirect(new URL('/instructor/profile?error=google_auth_failed', request.url))
    }

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    try {
        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            }),
        })

        const tokens = await tokenResponse.json()

        if (!tokenResponse.ok) {
            console.error("Token exchange failed:", tokens)
            throw new Error("Failed to exchange token")
        }

        // 2. Get User Info (Email)
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        })
        const userData = await userResponse.json()

        // 3. Identify the Instructor
        // We need to know WHICH instructor is connecting.
        // Since this is a server-side route, we should check the Supabase session cookies.
        // For simplicity in this prompt context, I'll use the cookie-based client to get the auth user.

        // However, `createRouteHandlerClient` is better for this. 
        // But I don't have `@supabase/auth-helpers-nextjs` installed maybe? 
        // I'll assume standard `createServerClient` pattern or just use the cookie if available.
        // Let's try to get the user from the cookie using `supabase-js` is hard without the helper.
        // I will assume the user is logged in and I can get the session from the request cookies if I had the helper.

        // ALTERNATIVE: Pass the user ID in the `state` param during auth.
        // But for now, let's try to get the user from the session using the standard Next.js pattern if possible.
        // Since I can't easily import the helper without knowing if it's installed, I'll use a trick:
        // I'll assume the user is logged in on the client, and we are redirecting back.
        // Wait, I can't get the user ID easily here without the auth helper.

        // Let's use the `state` parameter to pass the instructor ID? No, that's insecure if not signed.
        // Best practice: Use `createServerClient` from `@supabase/ssr`.

        // I will use `@supabase/ssr` as it was mentioned in the previous context ("Dependencies: @supabase/ssr").

        const cookieStore = await cookies()

        const supabase = createServerClient(
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

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
        }

        // Get Instructor ID
        const { data: instructor } = await supabaseAdmin
            .from('instructors')
            .select('id')
            .eq('profile_id', user.id)
            .single()

        if (!instructor) {
            return NextResponse.redirect(new URL('/instructor/profile?error=not_instructor', request.url))
        }

        // 4. Store Tokens
        const expiryDate = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

        const { error: upsertError } = await supabaseAdmin
            .from('instructor_google_tokens')
            .upsert({
                instructor_id: instructor.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token, // Note: Might be undefined on re-auth if prompt wasn't 'consent'
                expiry_timestamp: expiryDate,
                email: userData.email,
                updated_at: new Date().toISOString()
            }, { onConflict: 'instructor_id' })

        if (upsertError) throw upsertError

        return NextResponse.redirect(new URL('/instructor/profile?success=google_connected', request.url))

    } catch (error) {
        console.error("Callback error:", error)
        return NextResponse.redirect(new URL('/instructor/profile?error=callback_failed', request.url))
    }
}
