'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function enrollStudent(classId: string, studentId: string, paymentStatus: 'paid' | 'pending' = 'pending') {
    const supabase = await createClient()

    // 1. Check if already enrolled
    const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .single()

    if (existing) {
        return { error: "Already enrolled in this class" }
    }

    // 2. Create enrollment
    const { error } = await supabase
        .from('enrollments')
        .insert([{
            class_id: classId,
            student_id: studentId,
            status: 'active',
            payment_status: paymentStatus,
            enrolled_at: new Date().toISOString()
        }])

    if (error) {
        console.error('Error enrolling student:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/services`)
    return { success: true }
}

export async function getUserEnrollments(studentId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      *,
      class:classes(*)
    `)
        .eq('student_id', studentId)
        .order('enrolled_at', { ascending: false })

    if (error) {
        console.error('Error fetching enrollments:', error)
        return []
    }

    return data
}
