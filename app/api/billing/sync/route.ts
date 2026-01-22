import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch organization
        const { data: org, error: fetchError } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (fetchError || !org || !org.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing record found' }, { status: 404 });
        }

        // Fetch latest from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: org.stripe_customer_id,
            limit: 1,
            status: 'active', // Only sync active ones
        });

        console.log('Sync: Found subscriptions:', subscriptions.data.length);

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ status: 'no_subscription' });
        }

        const sub = subscriptions.data[0] as any;
        console.log('Sync: Selected sub:', sub.id, 'Status:', sub.status, 'Raw Period End:', sub.current_period_end);

        let periodEnd: Date | null = null;
        try {
            if (sub.current_period_end) {
                // Stripe timestamps are in seconds
                const timestamp = Number(sub.current_period_end);
                if (!isNaN(timestamp)) {
                    periodEnd = new Date(timestamp * 1000);
                } else {
                    console.error('Sync: current_period_end is not a number:', sub.current_period_end);
                }
            }
        } catch (e) {
            console.error('Sync: Error parsing date:', e);
        }

        if (periodEnd && isNaN(periodEnd.getTime())) {
            console.error('Sync: Invalid period end date object created');
            periodEnd = null;
        }

        // If it's set to cancel at period end, we treat it as canceled immediately in our DB
        const isCanceling = sub.cancel_at_period_end === true || !!sub.cancel_at;
        const status = isCanceling ? 'canceled' : sub.status;

        console.log('Sync: Final status determined:', status, 'isCanceling:', isCanceling);

        // Update DB
        const { error: updateError } = await supabase
            .from('organizations')
            .update({
                stripe_subscription_id: sub.id,
                billing_status: status,
                current_period_end: periodEnd ? periodEnd.toISOString() : null,
            })
            .eq('id', org.id);

        if (updateError) throw updateError;

        return NextResponse.json({ status: sub.status });
    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
