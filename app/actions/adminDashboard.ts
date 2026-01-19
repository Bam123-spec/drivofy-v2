'use server'

import { cookies } from 'next/headers'
import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    try {
        // 1. Instructors Count
        const { count: instructorCount, error: instructorError } = await supabase
            .from('instructors')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        if (instructorError) console.error("Error fetching instructors:", instructorError)

        // 2. Active Classes Count
        const { count: classCount, error: classError } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        if (classError) console.error("Error fetching classes:", classError)

        // 3. Today's Sessions
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

        const { data: sessions, count: sessionCount, error: sessionError } = await supabase
            .from('driving_sessions')
            .select(`
                id,
                start_time,
                end_time,
                status,
                student:student_id(full_name),
                instructor:instructor_id(full_name)
            `, { count: 'exact' })
            .gte('start_time', startOfDay)
            .lte('start_time', endOfDay)
            .order('start_time', { ascending: true })
            .limit(5)

        if (sessionError) console.error("Error fetching sessions:", sessionError)

        // 4. Total Students (Count profiles with role 'student')
        const { count: studentCount, error: studentError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')

        if (studentError) console.error("Error fetching students:", studentError)

        // 5. Recent Activity (Enrollments)
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('enrollments')
            .select(`
                id,
                enrollment_date,
                status,
                student:student_id(full_name),
                class:class_id(name)
            `)
            .order('enrollment_date', { ascending: false })
            .limit(10)

        if (enrollmentError) console.error("Error fetching enrollments:", enrollmentError)

        // 6. Growth Data (Last 6 months enrollments)
        // We fetch all enrollments for the last 6 months to aggregate in JS
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const { data: growthRaw, error: growthError } = await supabase
            .from('enrollments')
            .select('enrollment_date')
            .gte('enrollment_date', sixMonthsAgo.toISOString())

        if (growthError) console.error("Error fetching growth data:", growthError)

        // Process Growth Data
        const months: { [key: string]: number } = {}
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = `${monthNames[d.getMonth()]}`
            months[key] = 0
        }

        growthRaw?.forEach(e => {
            const d = new Date(e.enrollment_date)
            const key = `${monthNames[d.getMonth()]}`
            if (months[key] !== undefined) {
                months[key]++
            }
        })

        const growthData = Object.keys(months).map(key => ({
            name: key,
            students: months[key]
        }))

        // 7. Student Status Distribution
        // We can use the enrollments fetched above or a separate aggregate query
        // For simplicity, let's use the recent enrollments query if we fetched enough, 
        // but better to do a separate aggregate if we want total distribution.
        // Let's fetch status counts directly if possible, or just fetch all enrollment statuses.
        const { data: allStatuses, error: statusError } = await supabase
            .from('enrollments')
            .select('status')

        if (statusError) console.error("Error fetching statuses:", statusError)

        const statusCounts: { [key: string]: number } = {}
        allStatuses?.forEach(e => {
            const s = e.status || 'active'
            statusCounts[s] = (statusCounts[s] || 0) + 1
        })

        const distributionData = Object.keys(statusCounts).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: statusCounts[key]
        }))

        // Debug: Get current user and role
        const { data: { user } } = await supabase.auth.getUser()
        let userRole = 'unknown'
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            userRole = profile?.role || 'unknown'
        }

        return {
            stats: {
                instructors: instructorCount || 0,
                activeClasses: classCount || 0,
                todaySessions: sessionCount || 0,
                totalStudents: studentCount || 0
            },
            todaysSessions: sessions || [],
            recentActivity: enrollments || [],
            growthData,
            distributionData,
            debug: {
                userId: user?.id,
                role: userRole,
                instructorError,
                studentError
            }
        }

    } catch (error) {
        console.error("Dashboard Server Action Error:", error)
        return null
    }
}
