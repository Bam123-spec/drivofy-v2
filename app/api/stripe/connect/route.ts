import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get('organization_id')

        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
        }

        // 1. Verify user authentication
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Verify organization ownership
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('id, owner_user_id')
            .eq('id', organizationId)
            .single()

        if (orgError || !org) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        if (org.owner_user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized access to organization' }, { status: 403 })
        }

        // 3. Check for Stripe environment variables
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
        const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID
        const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

        if (!STRIPE_SECRET_KEY || !STRIPE_CONNECT_CLIENT_ID) {
            console.error('Missing Stripe environment variables')
            return NextResponse.json({ error: 'System configuration error' }, { status: 500 })
        }

        // 4. Generate state token (signed or just random + data for now we use simple state)
        // In a production app, you might sign this with a secret key
        const stateData = {
            org: organizationId,
            nonce: crypto.randomBytes(16).toString('hex')
        }
        const state = Buffer.from(JSON.stringify(stateData)).toString('base64')

        // 5. Construct OAuth URL
        const redirectUri = `${BASE_URL}/api/stripe/connect/callback`

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: STRIPE_CONNECT_CLIENT_ID,
            scope: 'read_write',
            redirect_uri: redirectUri,
            state: state
        })

        const authorizeUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`

        return NextResponse.redirect(authorizeUrl)

    } catch (error) {
        console.error('Error in Stripe Connect init:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
