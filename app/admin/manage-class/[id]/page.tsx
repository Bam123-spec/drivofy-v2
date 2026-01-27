import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ManageClassClient } from "@/app/admin/manage-class/components/ManageClassClient"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function DedicatedManageClassPage({ params }: PageProps) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabaseAux = createClient(cookieStore)

    // Verify Admin
    const {
        data: { user },
    } = await supabaseAux.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabaseAux
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/admin")
    }

    // Parallel Fetch: Class + Instructors
    const [classRes, instructorsRes] = await Promise.all([
        supabaseAux
            .from("classes")
            .select(`
                *,
                instructors (
                    full_name
                )
            `)
            .eq("id", id)
            .single(),
        supabaseAux
            .from("instructors")
            .select("id, full_name")
            .order("full_name")
    ])

    if (classRes.error || !classRes.data) {
        return notFound()
    }

    return (
        <ManageClassClient
            classData={classRes.data}
            instructors={instructorsRes.data || []}
        />
    )
}
