import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { sendTransactionalEmail, generateInvitationEmail } from '@/lib/brevo'

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, role, full_name, phone, license_number, type } = body

        // Validate inputs
        if (!email || !role || !full_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }
        if (!isValidEmail(String(email))) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() }
                }
            }
        )

        // 1. Get inviter's profile and organization_id
        const { data: { user: inviter } } = await supabase.auth.getUser()
        if (!inviter) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: inviterProfile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', inviter.id)
            .single()

        const supabaseAdmin = createAdminClient()
        const liveUrl = 'https://portifol.com'

        console.log(`[API] Inviting user: ${email} as ${role}`)

        // Students use Supabase Magic Link email flow.
        if (role === 'student') {
            const existingEmail = String(email || '').trim().toLowerCase()

            const publicSupabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                        detectSessionInUrl: false,
                    },
                }
            )

            const { data: magicLinkData, error: magicLinkError } = await publicSupabase.auth.signInWithOtp({
                email: existingEmail,
                options: {
                    // Student onboarding should always land on the Selam reset-password page.
                    emailRedirectTo: 'https://selamdrivingschool.com/update-password',
                    shouldCreateUser: true,
                    data: {
                        full_name: full_name,
                        phone: phone,
                        role: role,
                        organization_id: inviterProfile?.organization_id
                    }
                }
            })

            if (magicLinkError) {
                console.error('Student Magic Link Error:', magicLinkError)
                return NextResponse.json(
                    { error: magicLinkError.message },
                    { status: 500 }
                )
            }

            await supabaseAdmin.from('audit_logs').insert({
                action: 'create_student',
                details: {
                    email,
                    role,
                    name: full_name,
                    source: 'supabase_magic_link'
                },
                target_resource: `Student: ${full_name}`,
                ip_address: 'api_route',
            })

            return NextResponse.json({
                success: true,
                message: 'Student added. Magic link email sent.',
                user: magicLinkData?.user || null
            })
        }

        // 2. Generate Invitation Link
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: `${liveUrl}/auth/callback?next=/update-password`,
                data: {
                    full_name: full_name,
                    phone: phone,
                    role: role,
                    organization_id: inviterProfile?.organization_id
                }
            }
        })

        if (inviteError) {
            console.error('Invite Link Error:', inviteError)
            return NextResponse.json(
                { error: inviteError.message },
                { status: 500 }
            )
        }

        // 3. Send Branded Email via Brevo
        const { subject, htmlContent } = generateInvitationEmail(full_name, inviteData.properties.action_link, role)
        const emailRes = await sendTransactionalEmail({
            to: [{ email, name: full_name }],
            subject,
            htmlContent
        })

        if (!emailRes.success) {
            console.error('Brevo Email Error:', emailRes.error)
            // We continue even if email fails, but log it
        }

        const userId = inviteData.user.id

        // 4. If Instructor, add to 'instructors' table
        if (role === 'instructor') {
            const { error: instructorError } = await supabaseAdmin
                .from('instructors')
                .insert([
                    {
                        profile_id: userId,
                        full_name: full_name,
                        email: email,
                        phone: phone,
                        license_number: license_number,
                        status: 'active',
                        type: type || 'both'
                    }
                ])

            if (instructorError) {
                console.error('Instructor Insert Error:', instructorError)
                return NextResponse.json(
                    { error: 'Failed to create instructor record: ' + instructorError.message },
                    { status: 500 }
                )
            }
            console.log('[API] Instructor record created')
        }

        // 4. Log Audit Action
        // We can't import logAuditAction here easily because it's a server action file (usually not for edge routes or mixed usage).
        // And this is an API route.
        // We'll just insert directly since we have admin client.
        await supabaseAdmin.from('audit_logs').insert({
            action: role === 'instructor' ? 'create_instructor' : 'create_student',
            details: {
                email,
                role,
                name: full_name
            },
            target_resource: `${role === 'instructor' ? 'Instructor' : 'Student'}: ${full_name}`,
            ip_address: 'api_route',
        })

        return NextResponse.json({ success: true, user: inviteData.user })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
