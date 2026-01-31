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

        // Fetch latest from Stripe including items to determine plan
        const subscriptions = await stripe.subscriptions.list({
            customer: org.stripe_customer_id,
            limit: 1,
            status: 'all', // Check all to get the most relevant one
        });

        // Get the first active or trialing subscription
        const sub = subscriptions.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status)) as any;

        if (!sub) {
            // No active subscription found, reset to core if it was active
            await supabase
                .from('organizations')
                .update({
                    billing_status: 'inactive',
                    plan_status: 'inactive'
                })
                .eq('id', org.id);
            return NextResponse.json({ status: 'no_subscription' });
        }

        console.log('Sync: Selected sub:', sub.id, 'Status:', sub.status);

        // Determine plan from items
        let plan = 'core';
        const item = sub.items?.data?.[0];
        if (item?.plan?.amount) {
            const amount = item.plan.amount;
            if (amount === 8900) plan = 'premium';
            else if (amount === 5900) plan = 'standard';
            else if (amount === 3400) plan = 'core';
        }

        let periodEnd: Date | null = null;
        try {
            if (sub.current_period_end) {
                periodEnd = new Date(sub.current_period_end * 1000);
            }
        } catch (e) {
            console.error('Sync: Error parsing date:', e);
        }

        // If it's set to cancel at period end, we treat it as canceled in terms of status
        const isCanceling = sub.cancel_at_period_end === true || !!sub.cancel_at;
        const billingStatus = isCanceling ? 'canceled' : sub.status;

        console.log('Sync: Updating org to plan:', plan, 'status:', billingStatus);

        // Update DB
        const { error: updateError } = await supabase
            .from('organizations')
            .update({
                stripe_subscription_id: sub.id,
                current_plan: plan,
                plan_status: (sub.status === 'active' || sub.status === 'trialing') ? 'active' : 'inactive',
                billing_status: billingStatus,
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
