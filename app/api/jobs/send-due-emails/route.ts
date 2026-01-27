import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTransactionalEmail, generateBtwCooldownReadyEmail, generateBtwFinalEmail } from '@/lib/brevo';
import { withCors, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
    return handleOptions();
}

/**
 * Job endpoint to send due emails from the email_queue table.
 * Recommended to trigger via cron (e.g., every 5-15 minutes).
 */
export async function GET(request: Request) {
    const supabase = createAdminClient();
    const authHeader = request.headers.get('authorization');

    // Optional: Basic security check (e.g., CRON_SECRET)
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    try {
        // 1. Fetch up to 50 pending emails where send_at <= now()
        const { data: queue, error: fetchError } = await supabase
            .from('email_queue')
            .select(`
                id,
                student_id,
                email_type,
                send_at,
                profiles (
                    email,
                    full_name
                )
            `)
            .eq('status', 'pending')
            .lte('send_at', new Date().toISOString())
            .limit(50);

        if (fetchError) throw fetchError;

        if (!queue || queue.length === 0) {
            return withCors(NextResponse.json({ message: 'No pending emails due' }));
        }

        const results = {
            total: queue.length,
            sent: 0,
            failed: 0,
            details: [] as any[]
        };

        // 2. Process each email
        for (const item of queue) {
            const profile = item.profiles as any;
            if (!profile?.email) {
                console.warn(`⚠️ No email for student ${item.student_id}, marking as failed`);
                await supabase.from('email_queue').update({ status: 'failed' }).eq('id', item.id);
                results.failed++;
                continue;
            }

            let emailData;
            if (item.email_type === 'btw_cooldown_ready') {
                emailData = generateBtwCooldownReadyEmail(profile.full_name || 'Student');
            } else if (item.email_type === 'btw_completion_final') {
                emailData = generateBtwFinalEmail(profile.full_name || 'Student');
            } else {
                console.warn(`⚠️ Unknown email type: ${item.email_type}`);
                results.failed++;
                continue;
            }

            const sendResult = await sendTransactionalEmail({
                to: [{ email: profile.email, name: profile.full_name }],
                subject: emailData.subject,
                htmlContent: emailData.htmlContent
            });

            if (sendResult.success) {
                await supabase
                    .from('email_queue')
                    .update({ status: 'sent' })
                    .eq('id', item.id);
                results.sent++;
            } else {
                console.error(`❌ Failed to send email ${item.id}:`, sendResult.error);
                await supabase
                    .from('email_queue')
                    .update({ status: 'failed' })
                    .eq('id', item.id);
                results.failed++;
            }
        }

        return withCors(NextResponse.json(results));

    } catch (error: any) {
        console.error('Email Job Error:', error);
        return withCors(NextResponse.json({ error: error.message }, { status: 500 }));
    }
}
