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

        // 1. Create User (with email confirmed)
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

        console.log('[API] User created successfully, user ID:', authData.user.id)

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

        // 3. Generate password setup link
        const liveUrl = 'https://selamdriving.drivofy.com';
        let setupLink = `${liveUrl}/update-password`;

        try {
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: email,
                options: {
                    redirectTo: `${liveUrl}/update-password`
                }
            });

            if (!linkError && linkData?.properties?.action_link) {
                setupLink = linkData.properties.action_link;
                console.log('[API] Recovery link generated');
            }
        } catch (e) {
            console.error('[API] Error generating link:', e);
        }

        // 4. Send email via Brevo (more reliable than Supabase email)
        try {
            const { sendTransactionalEmail } = await import('@/lib/brevo');

            await sendTransactionalEmail({
                to: [{ email, name: full_name }],
                subject: `Welcome to Drivofy - Your ${role} Account`,
                htmlContent: `
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background-color:#1e293b;font-family:Arial,sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e293b;padding:40px 20px;">
                            <tr><td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;">
                                    <tr><td style="background:linear-gradient(135deg,#0ea5e9 0%,#8b5cf6 100%);padding:40px;text-align:center;">
                                        <h1 style="color:#fff;margin:0;font-size:24px;">Welcome to Drivofy! 🎉</h1>
                                    </td></tr>
                                    <tr><td style="padding:40px;">
                                        <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.6;">Hi ${full_name},</p>
                                        <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.6;">You've been invited to join Drivofy as a <strong>${role}</strong>. We're excited to have you on board!</p>
                                        <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">Click the button below to set your password and activate your account:</p>
                                        <table cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(135deg,#0ea5e9,#8b5cf6);padding:14px 40px;border-radius:8px;">
                                            <a href="${setupLink}" style="color:#fff;text-decoration:none;font-weight:700;font-size:14px;text-transform:uppercase;">ACTIVATE ACCOUNT</a>
                                        </td></tr></table>
                                    </td></tr>
                                    <tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                                        <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Drivofy</p>
                                    </td></tr>
                                </table>
                            </td></tr>
                        </table>
                    </body>
                    </html>
                `
            });
            console.log('[API] Invitation email sent via Brevo');
        } catch (emailError) {
            console.error('[API] Failed to send email:', emailError);
            // Don't fail the whole request if email fails
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
