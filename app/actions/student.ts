"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { logAuditAction } from "./audit"

async function safeDeleteByColumn(
    supabase: ReturnType<typeof createAdminClient>,
    table: string,
    column: string,
    value: string
) {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq(column, value)

    // Ignore missing-table errors so this works across schema variants.
    if (error && !String(error.message || "").includes("schema cache")) {
        throw new Error(`[${table}.${column}] ${error.message}`)
    }
}

async function safeUpdateAuditLogsForDeletedStudent(
    supabase: ReturnType<typeof createAdminClient>,
    studentId: string
) {
    const { error } = await supabase
        .from("audit_logs")
        .update({
            entity_id: null
        })
        .eq("entity_type", "student")
        .eq("entity_id", studentId)

    if (error && !String(error.message || "").includes("schema cache")) {
        throw new Error(`[audit_logs.entity_id] ${error.message}`)
    }
}

export async function updateStudent(studentId: string, data: { full_name: string; email: string; phone: string }) {
    const supabase = createAdminClient()

    try {
        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.full_name,
                email: data.email,
                // phone is stored in profiles if the schema allows, otherwise just metadata
            })
            .eq('id', studentId)

        if (profileError) throw profileError

        // 2. Update Auth Metadata
        const { error: authError } = await supabase.auth.admin.updateUserById(studentId, {
            email: data.email,
            user_metadata: {
                full_name: data.full_name,
                phone: data.phone
            }
        })

        if (authError) throw authError

        // 3. Log Audit
        await logAuditAction(
            'update_student',
            data,
            `Student: ${data.full_name}`
        )

        revalidatePath('/admin/students')
        return { success: true }
    } catch (error: any) {
        console.error("Error updating student:", error)
        return { error: error.message }
    }
}

export async function deleteStudent(studentId: string, type: 'registered' | 'lead') {
    const supabase = createAdminClient()

    try {
        if (type === 'lead') {
            // 1. Delete from enrollments table (Leads)
            const { error: enrollError } = await supabase
                .from('enrollments')
                .delete()
                .eq('id', studentId)

            if (enrollError) throw enrollError
        } else {
            // 2. Registered Student - remove dependency rows first to avoid FK blockers.
            const cleanupTargets: Array<[string, string]> = [
                ['ten_hour_package_sessions', 'student_id'],
                ['student_btw_allocations', 'student_id'],
                ['driving_sessions', 'student_id'],
                ['attendance_records', 'student_id'],
                ['attendance', 'student_id'],
                ['student_notes', 'student_id'],
                ['email_notifications', 'student_id'],
                ['email_notifications_queue', 'student_id'],
                ['enrollments', 'student_id'],
                ['enrollments', 'user_id'],
            ]

            for (const [table, column] of cleanupTargets) {
                await safeDeleteByColumn(supabase, table, column, studentId)
            }

            // If audit logs enforce FK to profiles/auth users, null out entity_id refs first.
            await safeUpdateAuditLogsForDeletedStudent(supabase, studentId)

            // 3. Delete User (this cascades to profiles and most other tables)
            const { error: authError } = await supabase.auth.admin.deleteUser(studentId)
            if (authError) throw authError
        }

        // 4. Log Audit
        await logAuditAction(
            'delete_student',
            { studentId, type },
            `Terminated ${type}: ${studentId}`
        )

        revalidatePath('/admin/students')
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting student:", error)
        return { error: error.message }
    }
}
