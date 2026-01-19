'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function enrollStudent(classId: string, studentId: string, paymentStatus: 'paid' | 'pending' = 'pending') {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

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

export async function getEnrollment(enrollmentId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      *,
      class:classes(*)
    `)
        .eq('id', enrollmentId)
        .single()

    if (error) {
        console.error('Error fetching enrollment:', error)
        return null
    }

    return data
}

export async function getUserEnrollments(userId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      *,
      class:classes(*)
    `)
        .eq('student_id', userId)
        .order('enrolled_at', { ascending: false })

    if (error) {
        console.error('Error fetching enrollments:', error)
        return []
    }

    return data
}
