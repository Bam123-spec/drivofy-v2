'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from "@/app/actions/audit"
import { sendTransactionalEmail, generateGradePassingEmail, generateGradeFailingEmail } from "@/lib/brevo"
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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
            grade,
            status,
            enrolled_at,
            btw_credits_granted,
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
        grade: e.grade,
        ...e.student,
        status: e.status,
        enrolledAt: e.enrolled_at,
        btw_credits_granted: e.btw_credits_granted
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

export async function adminUpdateStudentGrade(enrollmentId: string, grade: string) {
    console.log("adminUpdateStudentGrade called", { enrollmentId, grade })

    try {
        const cookieStore = await cookies()

        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { } },
                },
            }
        )

        // 1. Verify Admin
        const { data: { user } } = await supabaseAuth.auth.getUser()
        if (!user) {
            console.warn("adminUpdateStudentGrade: No user found")
            return { success: false, error: "Unauthorized" }
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            console.warn("adminUpdateStudentGrade: User is not admin", { userId: user.id, role: profile?.role })
            return { success: false, error: "Unauthorized: Admin only" }
        }

        // 2. Fetch enrollment logic
        const { data: enrollment, error: fetchError } = await supabase
            .from('enrollments')
            .select(`
                id,
                class_id,
                student_id,
                btw_credits_granted,
                course:classes(name),
                student:profiles(email, full_name)
            `)
            .eq('id', enrollmentId)
            .single()

        if (fetchError || !enrollment) {
            console.error("adminUpdateStudentGrade: Enrollment not found", fetchError)
            return { success: false, error: "Enrollment not found" }
        }

        // 3. Update Grade
        const { error: updateError } = await supabase
            .from('enrollments')
            .update({
                grade,
                updated_at: new Date().toISOString()
            })
            .eq('id', enrollmentId)

        if (updateError) {
            console.error("adminUpdateStudentGrade: Update failed", updateError)
            return { success: false, error: `Failed to update grade: ${updateError.message}` }
        }

        const numericGrade = parseFloat(grade)
        const isPassing = !isNaN(numericGrade) && numericGrade >= 80

        // 4. Status Update (Explicit rule)
        if (isPassing) {
            const { error: statusError } = await supabase
                .from('enrollments')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', enrollmentId)

            if (statusError) {
                console.error("adminUpdateStudentGrade: Status update failed", statusError)
            }
        } else {
            // Revert status to active if grade is now failing
            const { error: revertError } = await supabase
                .from('enrollments')
                .update({
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', enrollmentId)

            if (revertError) {
                console.error("adminUpdateStudentGrade: Status revert failed", revertError)
            }
        }

        // 5. Credits & Emails
        const student = Array.isArray(enrollment.student) ? enrollment.student[0] : enrollment.student
        const courseObj = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course
        const courseName = courseObj?.name

        if (isPassing) {
            // Grant credits IDEMPOTENTLY
            if (!enrollment.btw_credits_granted) {
                const { data: studentProfile } = await supabase
                    .from('profiles')
                    .select('driving_balance_hours, driving_balance_sessions')
                    .eq('id', enrollment.student_id)
                    .single()

                if (studentProfile) {
                    const newHours = (studentProfile.driving_balance_hours || 0) + 6
                    const newSessions = (studentProfile.driving_balance_sessions || 0) + 3

                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({
                            driving_balance_hours: newHours,
                            driving_balance_sessions: newSessions,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', enrollment.student_id)

                    if (!profileError) {
                        await supabase
                            .from('enrollments')
                            .update({ btw_credits_granted: true })
                            .eq('id', enrollmentId)

                        console.log(`✅ Granted 6h/3s BTW credits to student ${enrollment.student_id} (Admin)`)
                    }
                }
            }

            // Email: Passed
            if (student?.email) {
                try {
                    const emailData = generateGradePassingEmail(student.full_name, courseName || 'Driver\'s Ed', grade)
                    await sendTransactionalEmail({
                        to: [{ email: student.email, name: student.full_name }],
                        subject: emailData.subject,
                        htmlContent: emailData.htmlContent
                    })
                } catch (emailError) {
                    console.error("Failed to send passing email", emailError)
                }
            }
        } else {
            // Email: Retake
            if (student?.email) {
                try {
                    const emailData = generateGradeFailingEmail(student.full_name, courseName || 'Driver\'s Ed', grade)
                    await sendTransactionalEmail({
                        to: [{ email: student.email, name: student.full_name }],
                        subject: emailData.subject,
                        htmlContent: emailData.htmlContent
                    })
                } catch (emailError) {
                    console.error("Failed to send failing email", emailError)
                }
            }
        }

        await logAuditAction('update_student', {
            enrollmentId,
            grade,
            passed: isPassing,
            adminId: user.id
        }, `Admin Updated Grade: ${grade}`)

        revalidatePath('/admin/classes')
        revalidatePath('/admin/manage-class')
        return { success: true }
    } catch (error: any) {
        console.error("adminUpdateStudentGrade CRITICAL ERROR:", error)
        return { success: false, error: error.message || "An unexpected error occurred" }
    }
}
