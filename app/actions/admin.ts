'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from "@/app/actions/audit"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function searchStudents(query: string) {
    if (!query || query.length < 2) return []

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'student')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

    if (error) {
        console.error('Error searching students:', error)
        return []
    }

    return data
}

export async function enrollStudent(classId: string, studentId: string) {
    console.log("Attempting to enroll:", { classId, studentId })

    if (!classId || !studentId) {
        console.error("Missing classId or studentId")
        return { error: "Invalid class or student ID" }
    }

    // Check if already enrolled
    const { data: existing, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .single()

    if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing enrollment:", checkError)
        return { error: "Failed to check existing enrollment" }
    }

    if (existing) {
        console.log("Student already enrolled:", existing)
        return { error: "Student is already enrolled in this class." }
    }

    // Try to get course_id from class, or default to classId if not found/error
    let courseIdToUse = classId
    try {
        // 1. Try to get course_id from the class itself
        const { data: classData } = await supabase
            .from('classes')
            .select('course_id')
            .eq('id', classId)
            .single()

        if (classData?.course_id) {
            courseIdToUse = classData.course_id
        } else {
            // 2. If class has no course_id, try to get ANY course_id from courses table
            // This is a fallback for legacy/inconsistent schemas
            const { data: anyCourse } = await supabase
                .from('courses')
                .select('id')
                .limit(1)
                .single()

            if (anyCourse?.id) {
                console.log("Using fallback course_id from courses table:", anyCourse.id)
                courseIdToUse = anyCourse.id
            }
        }
    } catch (e) {
        console.log("Error resolving course_id:", e)
    }

    const { error } = await supabase
        .from('enrollments')
        .insert({
            class_id: classId,
            student_id: studentId,
            user_id: studentId,
            course_id: courseIdToUse,
            status: 'active',
            enrolled_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error enrolling student:', error)
        return { error: "Failed to enroll student: " + error.message }
    }

    // Log Audit Action
    await logAuditAction('create_student', {
        studentId: studentId,
        classId: classId,
        courseId: courseIdToUse
    }, `Student Enrolled in Class: ${classId}`)

    console.log("Enrollment successful")
    revalidatePath('/admin/classes')
    return { success: true }
}

export async function getEnrolledStudents(classId: string) {
    const { data, error } = await supabase
        .from('enrollments')
        .select(`
            id,
            status,
            enrolled_at,
            student:profiles!student_id (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('class_id', classId)
        .neq('status', 'dropped')
        .order('enrolled_at', { ascending: false })

    if (error) {
        console.error('Error fetching enrolled students:', error)
        return []
    }

    return data.map((e: any) => ({
        enrollmentId: e.id,
        ...e.student,
        status: e.status,
        enrolledAt: e.enrolled_at
    }))
}

export async function removeStudentFromClass(enrollmentId: string) {
    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

    if (error) {
        console.error('Error removing student:', error)
        return { error: "Failed to remove student." }
    }

    // Log Audit Action
    await logAuditAction('delete_student', {
        enrollmentId: enrollmentId
    }, `Student Removed from Class (Enrollment ID: ${enrollmentId})`)

    revalidatePath('/admin/classes')
    return { success: true }
}
