import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        console.error("Debug: SUPABASE_SERVICE_ROLE_KEY is missing")
        console.error("Debug: Available keys:", Object.keys(process.env).filter(k => k.startsWith('SUPABASE') || k.startsWith('NEXT')))
        console.error("Debug: Key value type:", typeof process.env.SUPABASE_SERVICE_ROLE_KEY)
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing")
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
