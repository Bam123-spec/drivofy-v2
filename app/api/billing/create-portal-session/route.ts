import { NextResponse } from 'next/server';
export const runtime = 'edge';
// Force rebuild
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
        }

        // 1. Authenticate User
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Stripe Customer ID
        let stripeCustomerId: string | undefined;

        // Option A: Look up from Database (Organizations table)
        const { data: org } = await supabase
            .from('organizations')
            .select('stripe_customer_id')
            .eq('owner_user_id', user.id)
            .single();

        if (org?.stripe_customer_id) {
            stripeCustomerId = org.stripe_customer_id;
        }

        // Option B: Look up by email using fetch (Fallback)
        if (!stripeCustomerId && user.email) {
            try {
                const customersResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                const customersData = await customersResponse.json();

                if (customersData.data && customersData.data.length > 0) {
                    stripeCustomerId = customersData.data[0].id;

                    // Optional: Backfill DB if found
                    if (org && !org.stripe_customer_id) {
                        await supabase.from('organizations').update({ stripe_customer_id: stripeCustomerId }).eq('owner_user_id', user.id);
                    }
                }
            } catch (err) {
                console.error("Error fetching Stripe customer:", err);
            }
        }

        // Option B: Fallback
        if (!stripeCustomerId) {
            console.warn("No Stripe customer found for user. Ensure user has a customer ID.");
            return NextResponse.json({ error: 'No Stripe customer record found for this user.' }, { status: 400 });
        }

        // 3. Create Portal Session using fetch
        const returnUrl = process.env.NEXT_PUBLIC_APP_URL + '/admin/payments';

        const body = new URLSearchParams();
        body.append('customer', stripeCustomerId);
        body.append('return_url', returnUrl);

        const sessionResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        const portalSession = await sessionResponse.json();

        if (portalSession.error) {
            throw new Error(portalSession.error.message);
        }

        return NextResponse.json({ url: portalSession.url });

    } catch (error: any) {
        console.error('Error creating billing portal session:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
