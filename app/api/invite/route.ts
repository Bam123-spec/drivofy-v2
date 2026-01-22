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

        // 3. Send Invite Email via Brevo
        try {
            const { sendTransactionalEmail } = await import('@/lib/brevo');
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://selamdriving.drivofy.com';

            await sendTransactionalEmail({
                to: [{ email, name: full_name }],
                subject: `Welcome to Drivofy - Your ${role} Account is Ready`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                        <h1 style="color: #1e293b; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Welcome to Drivofy!</h1>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                            Hi ${full_name}, your account as a <strong>${role}</strong> has been created.
                        </p>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                            You can now log in to the portal using your email: <strong>${email}</strong>. 
                            Since this is your first time, you'll need to set your password.
                        </p>
                        <a href="${baseUrl}/forgot-password" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                            Set Your Password
                        </a>
                        <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; pt: 16px;">
                            If you have any questions, just reply to this email.
                        </p>
                    </div>
                `
            });
            console.log('[API] Invite email sent successfully');
        } catch (emailError) {
            console.error('[API] Failed to send invite email:', emailError);
            // We don't return error here because the user was already created successfully
        }

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

        return NextResponse.json({ success: true, user: authData.user })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
