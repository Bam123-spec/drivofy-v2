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
            if (!session?.metadata?.orgId) {
                console.error('Org ID is missing from metadata');
                return new NextResponse('Org ID missing', { status: 400 });
            }

            const subscriptionId = session.subscription as string;
            console.log('Retrieving subscription:', subscriptionId);

            // Fetch subscription details to get status and period end
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            console.log('Subscription status:', sub.status);

            const { error } = await supabaseAdmin
                .from('organizations')
                .update({
                    stripe_subscription_id: subscriptionId,
                    stripe_customer_id: session.customer as string,
                    billing_status: sub.status,
                    current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
                })
                .eq('id', session.metadata.orgId);

            if (error) {
                console.error('Database update error:', error);
                throw error;
            }
            console.log('Database updated successfully for org:', session.metadata.orgId);
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
