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
            if (!session?.metadata?.orgId) {
                console.error('Org ID is missing from metadata');
                return new NextResponse('Org ID missing', { status: 400 });
            }

            const subscriptionId = session.subscription as string;

            // Fetch subscription details to get status and period end
            const sub = await stripe.subscriptions.retrieve(subscriptionId);

            const { error } = await supabaseAdmin
                .from('organizations')
                .update({
                    stripe_subscription_id: subscriptionId,
                    stripe_customer_id: session.customer as string,
                    billing_status: sub.status,
                    current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
                })
                .eq('id', session.metadata.orgId);

            if (error) throw error;
        }

        if (event.type === 'customer.subscription.updated') {
            const { error } = await supabaseAdmin
                .from('organizations')
                .update({
                    billing_status: subscription.status,
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                })
                .eq('stripe_subscription_id', subscription.id);

            if (error) throw error;
        }

        if (event.type === 'customer.subscription.deleted') {
            const { error } = await supabaseAdmin
                .from('organizations')
                .update({
                    billing_status: 'canceled',
                    current_period_end: null,
                })
                .eq('stripe_subscription_id', subscription.id);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Error handling webhook:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
