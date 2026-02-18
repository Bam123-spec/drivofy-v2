"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

type StudentViewType = "registered" | "lead"

function leadNameFromEnrollment(enrollment: any) {
    const first = enrollment?.first_name || ""
    const last = enrollment?.last_name || ""
    const byColumns = `${first} ${last}`.trim()
    const byCustomerDetails = enrollment?.customer_details?.name || ""
    return byColumns || byCustomerDetails || "Unknown Student"
}

function leadEmailFromEnrollment(enrollment: any) {
    return enrollment?.email || enrollment?.customer_details?.email || null
}

function leadPhoneFromEnrollment(enrollment: any) {
    return enrollment?.phone || enrollment?.customer_details?.phone || null
}

function mergeUniqueById<T extends { id: string }>(...lists: T[][]): T[] {
    const map = new Map<string, T>()
    for (const list of lists) {
        for (const item of list || []) {
            map.set(item.id, item)
        }
    }
    return Array.from(map.values())
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function createStudentFromOnboarding(input: {
    email: string
    fullName: string
    phone?: string
}): Promise<{ success: boolean, message: string, userId?: string }> {
    const email = String(input?.email || "").trim().toLowerCase()
    const fullName = String(input?.fullName || "").trim()
    const phone = String(input?.phone || "").trim()

    if (!email || !isValidEmail(email)) {
        return { success: false, message: "A valid email is required." }
    }
    if (!fullName) {
        return { success: false, message: "Full name is required." }
    }

    const onboardingUrl = process.env.SELAM_ONBOARDING_URL
    const onboardingKey = process.env.SELAM_ONBOARDING_KEY

    if (!onboardingUrl || !onboardingKey) {
        return { success: false, message: "Onboarding service is not configured." }
    }

    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        const supabaseAdmin = createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()

        const allowedRoles = new Set(["admin", "super_admin", "owner", "manager", "staff"])
        if (!profile?.role || !allowedRoles.has(profile.role)) {
            return { success: false, message: "Unauthorized" }
        }

        const response = await fetch(onboardingUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-key": onboardingKey,
            },
            body: JSON.stringify({
                email,
                fullName,
                phone: phone || undefined,
                source: "admin_portal",
            }),
            cache: "no-store",
        })

        const payload = await response.json().catch(() => ({} as any))
        if (!response.ok) {
            return { success: false, message: payload?.error || "Failed to create student." }
        }

        const userId = payload?.userId || payload?.user?.id || payload?.id || undefined
        return {
            success: true,
            message: "Student created. Magic link email sent.",
            userId,
        }
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to create student.",
        }
    }
}

export async function getAdminStudentDetails(entityId: string, type: StudentViewType = "registered") {
    const supabase = createAdminClient()

    let student: any = null
    let leadSource: any = null

    if (type === "lead") {
        const { data: leadEnrollment, error: leadError } = await supabase
            .from("enrollments")
            .select("*")
            .eq("id", entityId)
            .single()

        if (leadError || !leadEnrollment) {
            throw new Error("Lead enrollment not found")
        }

        leadSource = leadEnrollment
        const leadEmail = leadEmailFromEnrollment(leadEnrollment)

        if (leadEmail) {
            const { data: existingStudent } = await supabase
                .from("profiles")
                .select("*")
                .ilike("email", leadEmail)
                .eq("role", "student")
                .maybeSingle()
            student = existingStudent || null
        }

        if (!student) {
            student = {
                id: entityId,
                role: "lead",
                full_name: leadNameFromEnrollment(leadEnrollment),
                email: leadEmail,
                phone: leadPhoneFromEnrollment(leadEnrollment),
                created_at: leadEnrollment.enrolled_at,
                updated_at: leadEnrollment.updated_at || leadEnrollment.enrolled_at,
                avatar_url: null,
                ten_hour_sessions_total: 0,
                ten_hour_sessions_used: 0,
                driving_balance_sessions: 0,
                driving_balance_hours: 0,
            }
        }
    } else {
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", entityId)
            .eq("role", "student")
            .single()

        if (profileError || !profile) {
            throw new Error("Student not found")
        }

        student = profile
    }

    const studentId = student?.role === "student" ? student.id : null
    const studentEmail = student?.email || leadEmailFromEnrollment(leadSource)

    const enrollmentsByStudentPromise = studentId
        ? supabase
            .from("enrollments")
            .select(`
                *,
                classes (
                    id,
                    name,
                    start_date,
                    end_date,
                    status
                )
            `)
            .eq("student_id", studentId)
            .order("enrolled_at", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any)

    const enrollmentsByEmailPromise = studentEmail
        ? supabase
            .from("enrollments")
            .select(`
                *,
                classes (
                    id,
                    name,
                    start_date,
                    end_date,
                    status
                )
            `)
            .is("student_id", null)
            .ilike("email", studentEmail)
            .order("enrolled_at", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any)

    const drivingSessionsPromise = studentId
        ? supabase
            .from("driving_sessions")
            .select(`
                *,
                instructors (
                    id,
                    full_name
                )
            `)
            .eq("student_id", studentId)
            .order("start_time", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any)

    const attendancePromise = studentId
        ? supabase
            .from("attendance_records")
            .select(`
                *,
                class_days (
                    id,
                    date,
                    start_datetime,
                    classes (
                        id,
                        name
                    )
                )
            `)
            .eq("student_id", studentId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any)

    const btwAllocationsPromise = studentId
        ? supabase
            .from("student_btw_allocations")
            .select("*")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any)

    const [
        enrollmentsByStudentResult,
        enrollmentsByEmailResult,
        drivingSessionsResult,
        attendanceResult,
        btwAllocationsResult,
    ] = await Promise.all([
        enrollmentsByStudentPromise,
        enrollmentsByEmailPromise,
        drivingSessionsPromise,
        attendancePromise,
        btwAllocationsPromise,
    ])

    if (enrollmentsByStudentResult.error) throw enrollmentsByStudentResult.error
    if (enrollmentsByEmailResult.error) throw enrollmentsByEmailResult.error
    if (drivingSessionsResult.error) throw drivingSessionsResult.error
    if (attendanceResult.error) throw attendanceResult.error
    if (btwAllocationsResult.error) throw btwAllocationsResult.error

    const enrollments = mergeUniqueById(
        (enrollmentsByStudentResult.data || []) as any[],
        (enrollmentsByEmailResult.data || []) as any[]
    ).map((enrollment: any) => ({
        ...enrollment,
        email: leadEmailFromEnrollment(enrollment),
        phone: leadPhoneFromEnrollment(enrollment),
        full_name: leadNameFromEnrollment(enrollment),
    }))

    return {
        student,
        type,
        enrollments,
        drivingSessions: drivingSessionsResult.data || [],
        attendance: attendanceResult.data || [],
        btwAllocations: btwAllocationsResult.data || [],
    }
}
