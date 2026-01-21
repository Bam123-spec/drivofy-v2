import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
    const hostname = request.headers.get('host') || ''
    const currentHost = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
        ? hostname.replace(`.drivofy.com`, '') // Replace with your actual domain
        : hostname.replace(`.localhost:3000`, '')

    // If it's a subdomain (not www, not localhost, not the main domain)
    // if (currentHost !== 'drivofy.com' && currentHost !== 'www' && currentHost !== 'localhost:3000') {
    //     // Rewrite to /site/[subdomain]
    //     // We need to make sure we don't rewrite if it's already an API route or static file (handled by matcher config mostly)
    //     // Also need to handle if the user is visiting the root of the subdomain

    //     // If path is just /, rewrite to /site/[subdomain]
    //     // If path is /about, rewrite to /site/[subdomain]/about

    //     // const url = request.nextUrl.clone()
    //     // url.pathname = `/site/${currentHost}${path}`
    //     // return NextResponse.rewrite(url)
    // }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
