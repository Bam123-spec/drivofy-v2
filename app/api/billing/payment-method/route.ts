import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function GET() {
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
            .select('stripe_customer_id')
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (fetchError || !org || !org.stripe_customer_id) {
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
