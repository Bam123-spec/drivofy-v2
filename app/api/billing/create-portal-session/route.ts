import { NextResponse } from 'next/server';
// Force rebuild
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        // 1. Authenticate User
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Stripe Customer ID
        // TODO: Replace this mock lookup with a real DB query to your profiles or subscriptions table
        // Example: const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
        // const stripeCustomerId = profile?.stripe_customer_id;

        // For now, we'll try to find a customer by email, or use a mock/env ID if available
        let stripeCustomerId: string | undefined;

        // Option A: Look up by email (useful for MVP if email is consistent)
        if (user.email) {
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });
            if (customers.data.length > 0) {
                stripeCustomerId = customers.data[0].id;
            }
        }

        // Option B: Fallback to a hardcoded ID for testing if no customer found by email
        // This is just to ensure the portal works for the demo user if they don't have a real Stripe customer yet
        if (!stripeCustomerId) {
            // You might want to return an error here in production if no customer is found
            // return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
            console.warn("No Stripe customer found for user. Ensure user has a customer ID.");
            return NextResponse.json({ error: 'No Stripe customer record found for this user.' }, { status: 400 });
        }

        // 3. Create Portal Session
        const returnUrl = process.env.NEXT_PUBLIC_APP_URL + '/admin/payments';

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (error: any) {
        console.error('Error creating billing portal session:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
