import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

function splitName(fullName: string | null) {
    if (!fullName) return { firstName: null as string | null, lastName: null as string | null };
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: null as string | null, lastName: null as string | null };
    if (parts.length === 1) return { firstName: parts[0], lastName: null as string | null };
    return {
        firstName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1],
    };
}

async function syncStudentDataFromCheckoutSession(
    session: Stripe.Checkout.Session,
    supabaseAdmin: ReturnType<typeof createServerClient>,
    options?: { skipLeadSync?: boolean }
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

    let name =
        session.customer_details?.name ||
        (metadata.name as string | undefined) ||
        (metadata.full_name as string | undefined) ||
        (metadata.student_name as string | undefined) ||
        null;

    // Try to recover phone/email from Stripe customer if missing in checkout payload.
    if ((!phone || !email || !name) && typeof session.customer === 'string' && session.customer) {
        try {
            const customer = await stripe.customers.retrieve(session.customer);
            if (!('deleted' in customer && customer.deleted)) {
                if (!phone) phone = customer.phone || null;
                if (!email) email = customer.email || null;
                if (!name) name = customer.name || null;
            }
        } catch (error) {
            console.error('Failed to retrieve Stripe customer for phone sync:', error);
        }
    }

    const normalizedPhone = phone?.trim() || null;
    const normalizedEmail = email?.trim().toLowerCase() || null;
    const normalizedName = name?.trim() || null;
    const { firstName, lastName } = splitName(normalizedName);

    const possibleStudentIds = [
        metadata.studentId,
        metadata.student_id,
        metadata.profileId,
        metadata.profile_id,
        metadata.userId,
        metadata.user_id,
    ].filter(Boolean) as string[];

    let updated = false;

    // Prefer exact student/profile id if present in metadata.
    if (normalizedPhone) {
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
    }

    // Fallback to student email match if no ID metadata is available.
    if (!updated && normalizedPhone && normalizedEmail) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                phone: normalizedPhone,
                updated_at: new Date().toISOString(),
            })
            .ilike('email', normalizedEmail)
            .eq('role', 'student')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error updating student phone by email:', error);
        } else if (data && data.length > 0) {
            updated = true;
            console.log(`Student phone synced by email: ${normalizedEmail}`);
        }
    }

    if (!updated && normalizedPhone) {
        console.log('No matching student profile found for checkout phone sync.', {
            email: normalizedEmail,
            possibleStudentIds,
        });
    }

    // For external website purchases (non-org checkouts), upsert a lead enrollment row
    // so buyers appear under Students & Leads even before account creation.
    const shouldSyncLead = Boolean(normalizedEmail) && !options?.skipLeadSync && session.mode !== 'subscription';
    if (!shouldSyncLead) return;

    const now = new Date().toISOString();
    const sessionId = session.id || null;
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
    const leadPayload = {
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        phone: normalizedPhone,
        status: 'active',
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
        amount_paid: session.amount_total ?? null,
        customer_details: {
            source: 'stripe_checkout',
            name: normalizedName,
            email: normalizedEmail,
            phone: normalizedPhone,
            metadata,
        },
        updated_at: now,
    };

    // 1) Update exact record by Stripe session if it already exists.
    if (sessionId) {
        const { data: updatedBySession, error: updateSessionError } = await supabaseAdmin
            .from('enrollments')
            .update(leadPayload)
            .eq('stripe_session_id', sessionId)
            .is('student_id', null)
            .select('id')
            .limit(1);

        if (updateSessionError) {
            console.error('Error updating lead by stripe_session_id:', updateSessionError);
        } else if (updatedBySession && updatedBySession.length > 0) {
            console.log(`Lead synced by stripe_session_id: ${sessionId}`);
            return;
        }
    }

    // 2) Update the latest lead by email (if present), otherwise insert a fresh lead row.
    const { data: existingLead, error: findLeadError } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('email', normalizedEmail)
        .is('student_id', null)
        .order('enrolled_at', { ascending: false })
        .limit(1);

    if (findLeadError) {
        console.error('Error finding lead by email for sync:', findLeadError);
    }

    if (existingLead && existingLead.length > 0) {
        const { error: updateLeadError } = await supabaseAdmin
            .from('enrollments')
            .update({
                ...leadPayload,
                stripe_session_id: sessionId,
            })
            .eq('id', existingLead[0].id);

        if (updateLeadError) {
            console.error('Error updating lead by email:', updateLeadError);
        } else {
            console.log(`Lead synced by email: ${normalizedEmail}`);
        }
        return;
    }

    const { error: insertLeadError } = await supabaseAdmin
        .from('enrollments')
        .insert({
            ...leadPayload,
            stripe_session_id: sessionId,
            enrolled_at: now,
        });

    if (insertLeadError) {
        console.error('Error creating lead from checkout session:', insertLeadError);
    } else {
        console.log(`Lead created from checkout session: ${normalizedEmail}`);
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

            // Always attempt to sync student contact data from checkout details.
            await syncStudentDataFromCheckoutSession(session, supabaseAdmin, {
                skipLeadSync: Boolean(orgId),
            });
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
