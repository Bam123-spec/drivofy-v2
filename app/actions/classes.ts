'use server'

import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logAuditAction } from "@/app/actions/audit"
import { sendTransactionalEmail } from "@/lib/brevo"

import { cookies } from "next/headers"

export type ClassType = 'DE' | 'RSEP' | 'DIP'

export interface CreateClassData {
    name: string
    class_type: ClassType
    classification?: string // Morning, Evening, Weekend
    start_date: string
    end_date: string
    daily_start_time: string
    daily_end_time: string
    capacity: number
    instructor_id?: string
    price?: number // Optional, if we store price in DB or handle it elsewhere
}

export async function getClasses(type?: ClassType, classification?: string, categoryId?: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    let query = supabase
        .from('classes')
        .select(`
      *,
      instructor:instructors(full_name),
      enrollments(count)
    `)
        .order('start_date', { ascending: true })

    if (type) {
        query = query.eq('class_type', type)
    }

    if (classification) {
        query = query.eq('classification', classification)
    }

    if (categoryId) {
        query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching classes:', error)
        return []
    }

    return data
}

export async function createClass(data: CreateClassData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 1. Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Ideally check for admin role here, but for now we assume the UI protects it or RLS handles it
    // (RLS policy "Admins manage classes" should enforce this)

    // 2. Insert class
    const { data: newClass, error } = await supabase
        .from('classes')
        .insert([{
            name: data.name,
            class_type: data.class_type,
            classification: data.classification || null,
            start_date: data.start_date,
            end_date: data.end_date,
            daily_start_time: data.daily_start_time,
            daily_end_time: data.daily_end_time,
            capacity: data.capacity,
            instructor_id: data.instructor_id || null,
            status: 'upcoming'
        }])
        .select(`
            *,
            instructor:instructors(
                full_name,
                profile:profiles(email)
            )
        `)
        .single()

    if (error) {
        console.error('Error creating class:', error)
        return { error: error.message }
    }

    // 3. Send Email Notification to Instructor
    if (newClass.instructor_id && newClass.instructor?.profile?.email) {
        try {
            await sendTransactionalEmail({
                to: [{
                    email: newClass.instructor.profile.email,
                    name: newClass.instructor.full_name
                }],
                subject: `New Class Assignment: ${newClass.name}`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #1e293b; margin-bottom: 16px;">Class Assignment Notification</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                            Hi ${newClass.instructor.full_name}, you have been assigned to lead a new class.
                        </p>
                        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Class Name</p>
                            <p style="margin: 4px 0 12px 0; color: #1e293b; font-weight: bold;">${newClass.name}</p>
                            
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Schedule</p>
                            <p style="margin: 4px 0 12px 0; color: #1e293b; font-weight: bold;">
                                ${format(new Date(newClass.start_date), 'MMM do')} - ${format(new Date(newClass.end_date), 'MMM do, yyyy')}
                            </p>
                            
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Daily Time</p>
                            <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: bold;">${newClass.daily_start_time} - ${newClass.daily_end_time}</p>
                        </div>
                        <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                            View more details in the <a href="https://selamdriving.drivofy.com/instructor/classes" style="color: #2563eb; text-decoration: none;">Instructor Portal</a>.
                        </p>
                    </div>
                `
            });
            console.log('✅ Instructor class notification sent')
        } catch (e) {
            console.error('Failed to send class assignment email', e)
        }
    }

    // Log Audit Action
    await logAuditAction('create_class', {
        className: data.name,
        classType: data.class_type,
        startDate: data.start_date
    }, `Class: ${data.name}`)

    revalidatePath('/admin/classes')
    return { success: true }
}

export async function getClassById(id: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('classes')
        .select(`
      *,
      instructor:instructors(full_name),
      enrollments(
        *,
        student:profiles(full_name, email, phone)
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching class:', error)
        return null
    }

    return data
}
