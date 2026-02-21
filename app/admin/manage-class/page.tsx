"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Calendar,
    Users,
    ChevronRight,
    Clock,
    Search,
    BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function ManageClassPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUpcomingClasses()
    }, [])

    const formatTimeOnly = (value: string) => {
        const match = String(value || "").match(/^(\d{1,2}):(\d{2})/)
        if (!match) return value

        const date = new Date()
        date.setHours(Number(match[1]), Number(match[2]), 0, 0)
        return format(date, "h:mm a")
    }

    const getDisplayTime = (cls: any) => {
        if (cls.time_slot) return cls.time_slot
        if (cls.daily_start_time && cls.daily_end_time) {
            return `${formatTimeOnly(cls.daily_start_time)} - ${formatTimeOnly(cls.daily_end_time)}`
        }
        if (cls.firstClassStartDatetime) {
            return format(new Date(cls.firstClassStartDatetime), "h:mm a")
        }
        return "No time specified"
    }

    const formatClassDate = (value?: string | null) => {
        if (!value) return "N/A"
        const raw = String(value)
        const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
            ? new Date(`${raw}T00:00:00`)
            : new Date(raw)
        if (Number.isNaN(parsed.getTime())) return raw
        return format(parsed, "MMMM d, yyyy")
    }

    const fetchUpcomingClasses = async () => {
        try {
            setLoading(true)
            const today = format(new Date(), "yyyy-MM-dd")
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)

            // Fetch active DE classes (not archived, not ended).
            const { data, error } = await supabase
                .from('classes')
                .select(`
                    *,
                    instructors (full_name)
                `)
                .eq('class_type', 'DE')
                .eq('is_archived', false)
                .or(`end_date.gte.${today},end_date.is.null`)
                .order('start_date', { ascending: true })
                .limit(50)

            if (error) throw error

            const activeClasses = (data || []).filter((cls: any) => {
                if (!cls.end_date) return true
                const parsedEnd = new Date(String(cls.end_date))
                if (Number.isNaN(parsedEnd.getTime())) return true

                if (/^\d{4}-\d{2}-\d{2}$/.test(String(cls.end_date))) {
                    parsedEnd.setHours(23, 59, 59, 999)
                }

                return parsedEnd >= todayStart
            })

            const baseClasses = activeClasses
                .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .slice(0, 6)
            const classIds = baseClasses.map((cls: any) => cls.id)

            if (classIds.length === 0) {
                setClasses([])
                return
            }

            const [classDaysRes, enrollmentsRes] = await Promise.all([
                supabase
                    .from('class_days')
                    .select('class_id, date, start_datetime')
                    .in('class_id', classIds)
                    .order('date', { ascending: true })
                    .order('start_datetime', { ascending: true }),
                supabase
                    .from('enrollments')
                    .select('class_id')
                    .in('class_id', classIds)
            ])

            if (classDaysRes.error) throw classDaysRes.error
            if (enrollmentsRes.error) throw enrollmentsRes.error

            const firstClassStartByClassId = new Map<string, string>()
            for (const day of classDaysRes.data || []) {
                if (!day.class_id || !day.start_datetime) continue
                if (!firstClassStartByClassId.has(day.class_id)) {
                    firstClassStartByClassId.set(day.class_id, day.start_datetime)
                }
            }

            const studentCountByClassId = new Map<string, number>()
            for (const enrollment of enrollmentsRes.data || []) {
                if (!enrollment.class_id) continue
                const prev = studentCountByClassId.get(enrollment.class_id) || 0
                studentCountByClassId.set(enrollment.class_id, prev + 1)
            }

            const hydratedClasses = baseClasses.map((cls: any) => ({
                ...cls,
                firstClassStartDatetime: firstClassStartByClassId.get(cls.id) || null,
                enrolledStudentCount: studentCountByClassId.get(cls.id) || 0
            }))

            setClasses(hydratedClasses)
        } catch (error) {
            console.error("Error fetching classes:", error)
            toast.error("Failed to load upcoming classes")
        } finally {
            setLoading(false)
        }
    }

    const handleManageClass = (cls: any) => {
        router.push(`/admin/manage-class/${cls.id}`)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Premium Feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div className="space-y-1">
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest mb-2">
                        Class Management
                    </Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Manage <span className="text-blue-600">Classes</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage students, track progress, and award certifications for upcoming DE courses.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 gap-2">
                        <Search className="h-4 w-4" />
                        Quick Search
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-[280px] rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => (
                        <Card
                            key={cls.id}
                            className="group relative h-full border-0 bg-white shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 rounded-[2rem] overflow-hidden cursor-pointer flex flex-col"
                            onClick={() => handleManageClass(cls)}
                        >
                            {/* Accent Background Glow */}
                            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

                            <CardContent className="relative p-8 flex flex-col h-full z-10">
                                {/* Top Badging */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                                        <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                                        Upcoming
                                    </Badge>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                                        {cls.name}
                                    </h3>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
                                            <Calendar className="h-4 w-4 text-slate-300" />
                                            <span>Starts {formatClassDate(cls.start_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
                                            <Clock className="h-4 w-4 text-slate-300" />
                                            <span>{getDisplayTime(cls)}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
                                            <Users className="h-4 w-4 text-slate-300" />
                                            <span className="truncate">
                                                {cls.enrolledStudentCount} student{cls.enrolledStudentCount === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Active Roster</span>
                                    </div>

                                    <div className="flex items-center gap-1 font-bold text-blue-600 text-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        Manage
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <BookOpen className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Upcoming Classes</h3>
                        <p className="text-slate-500 font-medium">There are currently no Driver's Ed classes scheduled in the near future.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 h-12">
                            Create New Class
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
