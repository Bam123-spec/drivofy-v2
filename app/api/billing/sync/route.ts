import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY)' }, { status: 503 });
        }

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
        const supabaseAdmin = createAdminClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch user profile to get organization_id
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .maybeSingle();

        // Resolve organization from profile first, then ownership fallback.
        let org: any = null;
        if (profile?.organization_id) {
            const { data: linkedOrg, error: linkedOrgError } = await supabaseAdmin
                .from('organizations')
                .select('*')
                .eq('id', profile.organization_id)
                .maybeSingle();

            if (linkedOrgError) {
                return NextResponse.json({ error: linkedOrgError.message }, { status: 500 });
            }
            org = linkedOrg;
        }

        const metadataOrgId = user.user_metadata?.organization_id as string | undefined;
        if (!org && metadataOrgId) {
            const { data: metaOrg, error: metaOrgError } = await supabaseAdmin
                .from('organizations')
                .select('*')
                .eq('id', metadataOrgId)
                .maybeSingle();

            if (metaOrgError) {
                return NextResponse.json({ error: metaOrgError.message }, { status: 500 });
            }

            org = metaOrg;

            if (org && profile?.organization_id !== org.id) {
                await supabaseAdmin
                    .from('profiles')
                    .update({ organization_id: org.id })
                    .eq('id', user.id);
            }
        }

        if (!org) {
            const { data: ownedOrg, error: ownedOrgError } = await supabaseAdmin
                .from('organizations')
                .select('*')
                .eq('owner_user_id', user.id)
                .maybeSingle();

            if (ownedOrgError) {
                return NextResponse.json({ error: ownedOrgError.message }, { status: 500 });
            }

            org = ownedOrg;

            if (org && !profile?.organization_id) {
                await supabaseAdmin
                    .from('profiles')
                    .update({ organization_id: org.id })
                    .eq('id', user.id);
            }
        }

        if (!org || !org.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing record found' }, { status: 404 });
        }

        // Fetch a reasonable window of recent subscriptions, then choose the first active/trialing/past_due.
        const subscriptions = await stripe.subscriptions.list({
            customer: org.stripe_customer_id,
            limit: 20,
            status: 'all', // Check all to get the most relevant one
        });

        // Get the first active or trialing subscription
        const sub = subscriptions.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status)) as any;

        if (!sub) {
            // No active subscription found, reset to core.
            const { error: resetError } = await supabaseAdmin
                .from('organizations')
                .update({
                    current_plan: 'core',
                    billing_status: 'inactive',
                    plan_status: 'inactive',
                    stripe_subscription_id: null,
                    current_period_end: null,
                })
                .eq('id', org.id);
            if (resetError) {
                return NextResponse.json({ error: resetError.message }, { status: 500 });
            }
            return NextResponse.json({ status: 'no_subscription' });
        }

        console.log('Sync: Selected sub:', sub.id, 'Status:', sub.status);

        // GLOBAL PREMIUM: If they have any active/trialing sub, they get Premium
        const plan = 'premium';

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
        const { error: updateError } = await supabaseAdmin
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
