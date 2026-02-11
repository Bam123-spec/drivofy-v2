import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function GET() {
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Resolve organization consistently across all admin users.
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .maybeSingle();

        let org: { id: string; stripe_customer_id: string | null } | null = null;

        if (profile?.organization_id) {
            const { data: linkedOrg } = await supabase
                .from('organizations')
                .select('id, stripe_customer_id')
                .eq('id', profile.organization_id)
                .maybeSingle();
            org = linkedOrg;
        }

        const metadataOrgId = user.user_metadata?.organization_id as string | undefined;
        if (!org && metadataOrgId) {
            const { data: metaOrg } = await supabase
                .from('organizations')
                .select('id, stripe_customer_id')
                .eq('id', metadataOrgId)
                .maybeSingle();
            org = metaOrg;

            if (org && profile?.organization_id !== org.id) {
                await supabase
                    .from('profiles')
                    .update({ organization_id: org.id })
                    .eq('id', user.id);
            }
        }

        if (!org) {
            const { data: ownedOrg } = await supabase
                .from('organizations')
                .select('id, stripe_customer_id')
                .eq('owner_user_id', user.id)
                .maybeSingle();
            org = ownedOrg;

            if (org && !profile?.organization_id) {
                await supabase
                    .from('profiles')
                    .update({ organization_id: org.id })
                    .eq('id', user.id);
            }
        }

        if (!org || !org.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing record found' }, { status: 404 });
        }

        // Fetch customer from Stripe to get default payment method
        const customer = await stripe.customers.retrieve(org.stripe_customer_id) as any;

        const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

        if (!defaultPaymentMethodId) {
            return NextResponse.json({ paymentMethod: null });
        }

        const paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentMethodId);

        return NextResponse.json({
            paymentMethod: {
                brand: paymentMethod.card?.brand,
                last4: paymentMethod.card?.last4,
                expMonth: paymentMethod.card?.exp_month,
                expYear: paymentMethod.card?.exp_year,
                name: paymentMethod.billing_details?.name,
            }
        });
    } catch (error: any) {
        console.error('Payment method fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
