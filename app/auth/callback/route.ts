import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const nextParam = searchParams.get('next') ?? '/dashboard'
    const next = nextParam.startsWith('/') ? nextParam : '/dashboard'

    if (code) {
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
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Create redirect response
            const redirectResponse = NextResponse.redirect(`${origin}${next}`)

            // Ensure all auth cookies are set on the response
            // The cookieStore.set() calls above set cookies on the request,
            // but we also need them on the response for the redirect to work
            const allCookies = cookieStore.getAll()
            allCookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, {
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                })
            })

            return redirectResponse
        }

        const errorMessage = encodeURIComponent(error.message || 'Your sign-in link is invalid or expired.')
        const loginHref = encodeURIComponent('https://portifol.com/student/login')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=expired&message=${errorMessage}&login=${loginHref}`)
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=invalid&login=${encodeURIComponent('https://portifol.com/student/login')}`)
}
