import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ClassDetailsPageClient } from "../components/ClassDetailsPageClient"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClassDetailsPage({ params }: PageProps) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify Admin
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/dashboard")
    }

    // Parallel Fetch: Class + Instructors
    const [classRes, instructorsRes] = await Promise.all([
        supabase
            .from("classes")
            .select(`
                *,
                instructors (
                    full_name
                )
            `)
            .eq("id", id)
            .single(),
        supabase
            .from("instructors")
            .select("id, full_name")
            .order("full_name")
    ])

    if (classRes.error || !classRes.data) {
        return notFound()
    }

    return (
        <ClassDetailsPageClient
            classData={classRes.data}
            instructors={instructorsRes.data || []}
        />
    )
}
