"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { logAuditAction } from "./audit"

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
            // 2. Registered Student - Handle dependencies that don't cascade
            // Clear ten_hour_package_sessions first as it has NO ACTION delete rule
            await supabase
                .from('ten_hour_package_sessions')
                .delete()
                .eq('student_id', studentId)

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
