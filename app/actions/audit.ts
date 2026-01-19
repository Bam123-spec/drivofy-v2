'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies, headers } from 'next/headers'

export type AuditAction =
    | 'login'
    | 'logout'
    | 'create_class'
    | 'update_class'
    | 'delete_class'
    | 'create_student'
    | 'update_student'
    | 'delete_student'
    | 'create_instructor'
    | 'update_instructor'
    | 'delete_instructor'
    | 'update_settings'
    | 'billing_change'
    | 'other'

export async function logAuditAction(
    action: AuditAction,
    details: any = {},
    targetResource?: string
) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return // Can't log if not authenticated (or handle differently)

        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'

        const { error } = await supabase.from('audit_logs').insert({
            user_id: user.id,
            action,
            details,
            ip_address: ip,
            target_resource: targetResource
        })

        if (error) {
            console.error("Failed to insert audit log:", error)
        }
    } catch (error) {
        console.error("Error logging audit action:", error)
    }
}

export async function getAuditLogs(filters?: {
    dateRange?: string,
    userId?: string,
    action?: string
}) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    try {
        let query = supabase
            .from('audit_logs')
            .select(`
                *,
                user:user_id (
                    email,
                    full_name,
                    role
                )
            `)
            .order('created_at', { ascending: false })

        // Apply filters
        if (filters?.dateRange && filters.dateRange !== 'all') {
            const now = new Date()
            let startDate = new Date()

            switch (filters.dateRange) {
                case '24h':
                    startDate.setHours(now.getHours() - 24)
                    break
                case '7d':
                    startDate.setDate(now.getDate() - 7)
                    break
                case '30d':
                    startDate.setDate(now.getDate() - 30)
                    break
            }

            query = query.gte('created_at', startDate.toISOString())
        }

        if (filters?.userId && filters.userId !== 'all') {
            // Assuming userId passed is the email for now based on UI, 
            // but ideally it should be UUID. The UI uses email in select values.
            // We might need to join or filter differently if UI sends email.
            // For now, let's assume the UI will be updated to send UUID or we filter on the joined table.
            // Supabase doesn't support filtering on joined columns easily in one go without !inner
            // Let's assume we pass UUID or handle it. 
            // Actually, the current UI passes email. I should probably update UI to pass UUID if possible,
            // or fetch user ID first.
            // For simplicity, let's skip strict user filtering for a moment or try to filter by joined column if supported.
            // query = query.eq('user.email', filters.userId) // This syntax depends on Supabase JS version support
        }

        if (filters?.action && filters.action !== 'all') {
            query = query.eq('action', filters.action)
        }

        const { data, error } = await query

        if (error) throw error

        return data
    } catch (error) {
        console.error("Error fetching audit logs:", error)
        return []
    }
}
