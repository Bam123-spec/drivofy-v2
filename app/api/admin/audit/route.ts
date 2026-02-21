import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll() { },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ logs: [] }, { status: 200 })
        }

        let db: ReturnType<typeof createAdminClient> | ReturnType<typeof createServerClient>
        try {
            db = createAdminClient()
        } catch (error) {
            console.error("Audit API: admin client unavailable, using session client.", error)
            db = supabase
        }

        const searchParams = request.nextUrl.searchParams
        const dateRange = searchParams.get("dateRange") || "24h"
        const action = searchParams.get("action") || "all"
        const userId = searchParams.get("userId") || "all"

        let query = db
            .from("audit_logs")
            .select("*")
            .order("created_at", { ascending: false })

        if (dateRange !== "all") {
            const now = new Date()
            const startDate = new Date()
            if (dateRange === "24h") startDate.setHours(now.getHours() - 24)
            if (dateRange === "7d") startDate.setDate(now.getDate() - 7)
            if (dateRange === "30d") startDate.setDate(now.getDate() - 30)
            query = query.gte("created_at", startDate.toISOString())
        }

        if (userId !== "all") {
            query = query.eq("user_id", userId)
        }

        if (action !== "all") {
            query = query.eq("action", action)
        }

        const { data: rows, error } = await query
        if (error) {
            console.error("Audit API: failed querying audit_logs", error)
            return NextResponse.json({ logs: [] }, { status: 200 })
        }

        const logs = rows || []
        const userIds = Array.from(new Set(logs.map((log: any) => log.user_id).filter(Boolean)))

        let usersById = new Map<string, any>()
        if (userIds.length > 0) {
            const { data: users, error: usersError } = await db
                .from("profiles")
                .select("id, email, full_name, role")
                .in("id", userIds)

            if (!usersError) {
                usersById = new Map((users || []).map((entry: any) => [entry.id, entry]))
            } else {
                console.error("Audit API: failed loading user profiles", usersError)
            }
        }

        return NextResponse.json({
            logs: logs.map((log: any) => ({
                ...log,
                user: usersById.get(log.user_id) || null,
            })),
        })
    } catch (error) {
        console.error("Audit API: unexpected error", error)
        return NextResponse.json({ logs: [] }, { status: 200 })
    }
}
