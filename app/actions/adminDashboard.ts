'use server'

import { cookies } from 'next/headers'
import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    try {
        const now = new Date()
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

        // Helper to calculate trend
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0
            return Math.round(((current - previous) / previous) * 100)
        }

        // 1. Instructors Count & Trend
        const { count: currentInstructors } = await supabase
            .from('instructors')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        const { count: prevInstructors } = await supabase
            .from('instructors')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lt('created_at', startOfThisMonth)

        const instructorTrend = calculateTrend(currentInstructors || 0, prevInstructors || 0)

        // 2. Active Classes Count & Trend
        const { count: currentClasses } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        const { count: prevClasses } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lt('created_at', startOfThisMonth)

        const classTrend = calculateTrend(currentClasses || 0, prevClasses || 0)

        // 3. Today's Sessions
        const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString()
        const endOfToday = new Date(now.setHours(23, 59, 59, 999)).toISOString()

        const { data: sessions, count: sessionCount } = await supabase
            .from('driving_sessions')
            .select(`
                id,
                start_time,
                end_time,
                status,
                student:student_id(full_name),
                instructor:instructor_id(full_name)
            `, { count: 'exact' })
            .gte('start_time', startOfToday)
            .lte('start_time', endOfToday)
            .order('start_time', { ascending: true })
            .limit(5)

        // 4. Total Students & Trend
        const { count: currentStudents } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')

        const { count: prevStudents } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')
            .lt('created_at', startOfThisMonth)

        const studentTrend = calculateTrend(currentStudents || 0, prevStudents || 0)

        // 5. Total Revenue & Trend (Paid enrollments * class price)
        const { data: revenueData } = await supabase
            .from('enrollments')
            .select(`
                enrolled_at,
                payment_status,
                class:class_id(price)
            `)
            .eq('payment_status', 'paid')

        let currentRevenue = 0
        let lastMonthRevenue = 0

        revenueData?.forEach(e => {
            const price = Number((e.class as any)?.price) || 0
            const enrolledAt = new Date(e.enrolled_at)
            if (enrolledAt >= new Date(startOfThisMonth)) {
                currentRevenue += price
            } else if (enrolledAt >= new Date(startOfLastMonth) && enrolledAt <= new Date(endOfLastMonth)) {
                lastMonthRevenue += price
            }
        })

        const totalRevenue = revenueData?.reduce((acc, e) => acc + (Number((e.class as any)?.price) || 0), 0) || 0
        const revenueTrend = calculateTrend(currentRevenue, lastMonthRevenue)

        // 6. Recent Activity (Enrollments)
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select(`
                id,
                enrolled_at,
                status,
                student:student_id(full_name),
                class:class_id(name)
            `)
            .order('enrolled_at', { ascending: false })
            .limit(10)

        // 7. Growth Data (Last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        sixMonthsAgo.setDate(1)

        const { data: growthRaw } = await supabase
            .from('enrollments')
            .select('enrolled_at')
            .gte('enrolled_at', sixMonthsAgo.toISOString())

        const months: { [key: string]: number } = {}
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = `${monthNames[d.getMonth()]}`
            months[key] = 0
        }

        growthRaw?.forEach(e => {
            const d = new Date(e.enrolled_at)
            const key = `${monthNames[d.getMonth()]}`
            if (months[key] !== undefined) months[key]++
        })

        const growthData = Object.keys(months).map(key => ({
            name: key,
            students: months[key]
        }))

        // 8. Distribution
        const { data: allStatuses } = await supabase
            .from('enrollments')
            .select('status')

        const statusCounts: { [key: string]: number } = {}
        allStatuses?.forEach(e => {
            const s = e.status || 'active'
            statusCounts[s] = (statusCounts[s] || 0) + 1
        })

        const distributionData = Object.keys(statusCounts).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: statusCounts[key]
        }))

        return {
            stats: {
                instructors: { value: currentInstructors || 0, trend: instructorTrend },
                activeClasses: { value: currentClasses || 0, trend: classTrend },
                todaySessions: { value: sessionCount || 0, trend: 0 },
                totalStudents: { value: currentStudents || 0, trend: studentTrend },
                revenue: { value: totalRevenue, trend: revenueTrend }
            },
            todaysSessions: sessions || [],
            recentActivity: enrollments || [],
            growthData,
            distributionData
        }

    } catch (error) {
        console.error("Dashboard Server Action Error:", error)
        return null
    }
}
