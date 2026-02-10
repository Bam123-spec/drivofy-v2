import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

async function syncStudentPhoneFromCheckoutSession(
    session: Stripe.Checkout.Session,
    supabaseAdmin: ReturnType<typeof createServerClient>
) {
    const metadata = session.metadata || {};

    let phone =
        session.customer_details?.phone ||
        (metadata.phone as string | undefined) ||
        (metadata.customer_phone as string | undefined) ||
        null;

    let email =
        session.customer_details?.email ||
        session.customer_email ||
        (metadata.email as string | undefined) ||
        (metadata.student_email as string | undefined) ||
        null;

    // Try to recover phone/email from Stripe customer if missing in checkout payload.
    if ((!phone || !email) && typeof session.customer === 'string' && session.customer) {
        try {
            const customer = await stripe.customers.retrieve(session.customer);
            if (!('deleted' in customer && customer.deleted)) {
                if (!phone) phone = customer.phone || null;
                if (!email) email = customer.email || null;
            }
        } catch (error) {
            console.error('Failed to retrieve Stripe customer for phone sync:', error);
        }
    }

    if (!phone) {
        console.log('No phone found on checkout session; skipping student phone sync.');
        return;
    }

    const possibleStudentIds = [
        metadata.studentId,
        metadata.student_id,
        metadata.profileId,
        metadata.profile_id,
        metadata.userId,
        metadata.user_id,
    ].filter(Boolean) as string[];

    const normalizedPhone = phone.trim();
    let updated = false;

    // Prefer exact student/profile id if present in metadata.
    for (const studentId of possibleStudentIds) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                phone: normalizedPhone,
                updated_at: new Date().toISOString(),
            })
            .eq('id', studentId)
            .eq('role', 'student')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error updating student phone by ID:', error);
            continue;
        }

        if (data && data.length > 0) {
            updated = true;
            console.log(`Student phone synced by ID: ${studentId}`);
            break;
        }
    }

    // Fallback to student email match if no ID metadata is available.
    if (!updated && email) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                phone: normalizedPhone,
                updated_at: new Date().toISOString(),
            })
            .ilike('email', email)
            .eq('role', 'student')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error updating student phone by email:', error);
        } else if (data && data.length > 0) {
            updated = true;
            console.log(`Student phone synced by email: ${email}`);
        }
    }

    if (!updated) {
        console.log('No matching student profile found for checkout phone sync.', {
            email,
            possibleStudentIds,
        });
    }
}

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

            if (orgId) {
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
            } else {
                console.log('No orgId found for checkout session; skipping org billing update.');
            }

            // Always attempt to sync student phone from checkout details when present.
            await syncStudentPhoneFromCheckoutSession(session, supabaseAdmin);
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
