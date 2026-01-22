import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'


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

        const supabaseAdmin = createAdminClient()

        console.log(`[API] Creating user: ${email} as ${role}`)

        // 1. Create User (skip invite email)
        // We use createUser with email_confirm: true to auto-confirm them.
        // We set a temporary password or leave it. If we don't set a password, they can't login with password until they reset it.
        // Since the user wants to manage comms via Brevo, they probably will send a "Set Password" link or similar.
        // Or we can set a random password.
        // Let's set email_confirm: true.
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
                full_name: full_name,
                phone: phone,
                role: role
            }
        })

        if (authError) {
            console.error('Auth Create Error:', authError)
            return NextResponse.json(
                { error: authError.message },
                { status: 500 }
            )
        }

        console.log('[API] Auth create successful, user ID:', authData.user.id)

        const userId = authData.user.id

        // 2. Ensure Profile Exists
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                full_name: full_name,
                role: role,
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Profile Upsert Error:', profileError)
            return NextResponse.json(
                { error: 'Failed to create user profile: ' + profileError.message },
                { status: 500 }
            )
        }

        console.log('[API] Profile upsert successful')

        // 3. If Instructor, add to 'instructors' table
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

        return NextResponse.json({ success: true, user: authData.user })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
