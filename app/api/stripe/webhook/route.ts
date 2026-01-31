import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    console.log('Webhook received! Type:', event.type);

    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
                setAll() { }
            }
        }
    );

    const session = event.data.object as Stripe.Checkout.Session;
    const subscription = event.data.object as Stripe.Subscription;

    try {
        if (event.type === 'checkout.session.completed') {
            console.log('Checkout session completed. Metadata:', session.metadata);

            // Get orgId from metadata OR client_reference_id (passed in Payment Link URL)
            const orgId = session.metadata?.orgId || session.client_reference_id;

            if (!orgId) {
                console.error('Org ID is missing from session');
                return new NextResponse('Org ID missing', { status: 400 });
            }

            // GLOBAL PREMIUM: No matter what they bought, if they paid, they get Premium
            const plan = 'premium';

            console.log(`Webhook: Processing session for org ${orgId}. Enforcing Global Premium plan.`);

            console.log(`Updating org ${orgId} to plan ${plan}`);

            const updateData: any = {
                current_plan: plan,
                plan_status: 'active',
                stripe_customer_id: session.customer as string,
            };

            // If it's a subscription, store the ID and period end
            if (session.subscription) {
                const subId = session.subscription as string;
                const sub = await stripe.subscriptions.retrieve(subId);
                updateData.stripe_subscription_id = subId;
                updateData.billing_status = sub.status;
                updateData.current_period_end = new Date((sub as any).current_period_end * 1000).toISOString();
            } else {
                // For one-time payments, just set active status
                updateData.billing_status = 'active';
            }

            const { error } = await supabaseAdmin
                .from('organizations')
                .update(updateData)
                .eq('id', orgId);

            if (error) {
                console.error('Database update error:', error);
                throw error;
            }
            console.log('Database updated successfully for org:', orgId);
        }

        if (event.type === 'customer.subscription.updated') {
            console.log('Subscription updated:', subscription.id, 'Status:', subscription.status, 'Cancel at period end:', subscription.cancel_at_period_end, 'Cancel at:', (subscription as any).cancel_at);

            // If it's set to cancel at period end, we treat it as canceled immediately in our DB
            const isCanceling = subscription.cancel_at_period_end === true || !!(subscription as any).cancel_at;
            const status = isCanceling ? 'canceled' : subscription.status;

            const { error } = await supabaseAdmin
                .from('organizations')
                .update({
                    billing_status: status,
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                })
                .eq('stripe_subscription_id', subscription.id);

            if (error) {
                console.error('Database update error (updated):', error);
                throw error;
            }
        }

        if (event.type === 'customer.subscription.deleted') {
            console.log('Subscription deleted:', subscription.id);
            const { error } = await supabaseAdmin
                .from('organizations')
                .update({
                    billing_status: 'canceled',
                    current_period_end: null,
                })
                .eq('stripe_subscription_id', subscription.id);

            if (error) {
                console.error('Database update error (deleted):', error);
                throw error;
            }
        }
    } catch (error) {
        console.error('Error handling webhook:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
