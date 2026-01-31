'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function disconnectStripeAccount(orgId: string) {
    if (!orgId) return { error: "Organization ID is required" }

    try {
        const { error } = await supabase
            .from('organizations')
            .update({
                stripe_account_id: null,
                stripe_status: 'disconnected',
                billing_status: 'inactive'
            })
            .eq('id', orgId)

        if (error) throw error

        revalidatePath('/admin/settings/payments')
        return { success: true }
    } catch (error) {
        console.error('Error disconnecting Stripe account:', error)
        return { error: "Failed to disconnect Stripe account" }
    }
}
