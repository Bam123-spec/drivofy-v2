import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe is not configured (Missing STRIPE_SECRET_KEY)' }, { status: 503 });
        }

        const priceId = process.env.STRIPE_PRICE_ID || 'price_1Sr2BhD0SlycNJKi6Czvb2tk'; // Fallback for dev

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch or create organization
        let { data: org, error: fetchError } = await supabase
            .from('organizations')
            .select('id, stripe_customer_id')
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching organization:', fetchError);
            throw new Error(`Database error: ${fetchError.message}`);
        }

        if (!org) {
            console.log('No organization found, creating one for user:', user.id);
            const { data: newOrg, error: insertError } = await supabase
                .from('organizations')
                .insert({ owner_user_id: user.id })
                .select()
                .maybeSingle();

            if (insertError) {
                console.error('Error creating organization:', insertError);
                throw new Error(`Failed to create organization: ${insertError.message}`);
            }
            if (!newOrg) throw new Error('Failed to create organization (no data returned)');
            org = newOrg;
        }

        // Create Stripe Customer if needed
        let customerId = org.stripe_customer_id;

        if (!customerId) {
            console.log('Creating Stripe customer for user:', user.email);
            try {
                const customer = await stripe.customers.create({
                    email: user.email || undefined,
                    metadata: {
                        userId: user.id,
                        orgId: org.id
                    }
                });
                customerId = customer.id;

                // Update DB with user client
                const { error: updateError } = await supabase
                    .from('organizations')
                    .update({ stripe_customer_id: customerId })
                    .eq('id', org.id);

                if (updateError) {
                    console.error('Error updating organization with stripe_customer_id:', updateError);
                }
            } catch (stripeErr: any) {
                console.error('Stripe Customer Creation Error:', stripeErr);
                throw new Error(`Stripe error: ${stripeErr.message}`);
            }
        }

        // Robust URL construction
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) {
            const url = new URL(req.url);
            baseUrl = `${url.protocol}//${url.host}`;
        }
        if (baseUrl && !baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }

        console.log('Creating Stripe checkout session for customer:', customerId);
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: `${baseUrl}/billing?success=1`,
            cancel_url: `${baseUrl}/billing?canceled=1`,
            metadata: {
                orgId: org.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('CRITICAL ERROR in checkout session:', error);
        return NextResponse.json(
            {
                error: error.message || 'Internal Server Error',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
