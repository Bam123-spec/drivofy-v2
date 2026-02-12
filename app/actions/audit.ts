'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies, headers } from 'next/headers'
import { createAdminClient } from "@/lib/supabase/admin"

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
    | 'create_session'
    | 'update_session'
    | 'delete_session'
    | 'other'

export async function logAuditAction(
    action: AuditAction,
    details: any = {},
    targetResource?: string
) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const supabaseAdmin = createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return // Can't log if not authenticated (or handle differently)

        const headersList = await headers()
        const forwardedFor = headersList.get('x-forwarded-for')
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

        const { error } = await supabaseAdmin.from('audit_logs').insert({
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
    const supabaseAdmin = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        let query = supabaseAdmin
            .from('audit_logs')
            .select('*')
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
            query = query.eq('user_id', filters.userId)
        }

        if (filters?.action && filters.action !== 'all') {
            query = query.eq('action', filters.action)
        }

        const { data, error } = await query

        if (error) {
            if (String(error.message || '').includes("Could not find the table 'public.audit_logs'")) {
                throw new Error("Audit log storage is not set up in this database yet.")
            }
            throw error
        }

        const logs = data || []
        const userIds = Array.from(new Set(logs.map((log: any) => log.user_id).filter(Boolean)))

        let usersById = new Map<string, any>()
        if (userIds.length > 0) {
            const { data: users, error: usersError } = await supabaseAdmin
                .from('profiles')
                .select('id, email, full_name, role')
                .in('id', userIds)

            if (usersError) throw usersError
            usersById = new Map((users || []).map((entry: any) => [entry.id, entry]))
        }

        return logs.map((log: any) => ({
            ...log,
            user: usersById.get(log.user_id) || null
        }))
    } catch (error) {
        console.error("Error fetching audit logs:", error)
        throw error
    }
}
