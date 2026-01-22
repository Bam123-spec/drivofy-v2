'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logAuditAction } from "@/app/actions/audit"

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

    const { error } = await supabase
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

    if (error) {
        console.error('Error creating class:', error)
        return { error: error.message }
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
