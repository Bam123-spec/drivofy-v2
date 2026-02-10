import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function normalizeHost(rawHost: string) {
    return rawHost.split(':')[0].toLowerCase()
}

function extractSubdomain(host: string) {
    const roots = ['drivofy.com', 'portifol.com', 'localhost']

    for (const root of roots) {
        const suffix = `.${root}`
        if (host.endsWith(suffix)) {
            const candidate = host.slice(0, -suffix.length)
            if (candidate && candidate !== 'www') return candidate
        }
    }

    return null
}

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected Routes Logic
    const path = request.nextUrl.pathname

    // Skip auth check for Stripe webhook
    if (path === '/api/stripe/webhook') {
        return response
    }

    // Helper to get role from DB
    const getRole = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        return data?.role
    }

    // 1. Admin Routes
    if (path.startsWith('/admin')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))

        const role = await getRole(user.id)
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 2. Instructor Routes
    if (path.startsWith('/instructor')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))

        const role = await getRole(user.id)
        if (role !== 'instructor' && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 3. Block Students entirely (except login/signup/public)
    // If a student tries to access any protected route, redirect them.
    // Actually, if they log in, we should probably catch them at login page, 
    // but if they somehow get a session, middleware should block them.
    if (user && !path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/')) {
        const role = await getRole(user.id)
        if (role === 'student') {
            // Students are not allowed in Drivofy
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 4. Subdomain Routing
    const host = normalizeHost(request.headers.get('host') || '')
    const subdomain = extractSubdomain(host)

    // Subdomain behavior:
    // - Root (/) shows a clean login page (no marketing bars)
    // - Auth pages also resolve to the same clean login page
    // - Main domain keeps normal home page
    if (subdomain) {
        const shouldShowSubdomainLogin =
            path === '/' ||
            path === '/login' ||
            path === '/signup' ||
            path === '/forgot-password'

        if (shouldShowSubdomainLogin) {
            const url = request.nextUrl.clone()
            url.pathname = `/site/${subdomain}`
            url.search = ''
            return NextResponse.rewrite(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
