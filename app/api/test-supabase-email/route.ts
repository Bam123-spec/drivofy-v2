import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * Test Supabase Email Configuration
 * Visit: /api/test-supabase-email?email=your@email.com
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient()
        const liveUrl = 'https://portifol.com'

        console.log('[TEST] Testing inviteUserByEmail for:', email)

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${liveUrl}/auth/callback?next=/update-password`,
            data: {
                full_name: 'Test User',
                role: 'test'
            }
        })

        if (error) {
            console.error('[TEST] Error:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            }, { status: 500 })
        }

        console.log('[TEST] Success:', data)
        return NextResponse.json({
            success: true,
            message: 'Email sent successfully via Supabase',
            userId: data.user.id
        })

    } catch (error: any) {
        console.error('[TEST] Unexpected error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
