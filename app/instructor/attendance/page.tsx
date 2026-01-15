"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle2,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

export default function InstructorAttendancePage() {
    const [classDays, setClassDays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        fetchClassDays()
    }, [currentDate])

    const fetchClassDays = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get instructor ID
            const { data: instructor } = await supabase
                .from('instructors')
                .select('id')
                .eq('profile_id', user.id)
                .single()

            if (!instructor) return

            const start = startOfWeek(currentDate).toISOString()
            const end = endOfWeek(currentDate).toISOString()

            const { data, error } = await supabase
                .from('class_days')
                .select(`
                    *,
                    classes (
                        name,
                        instructor_id
                    ),
                    attendance_records (count)
                `)
                .eq('classes.instructor_id', instructor.id) // This filtering happens client-side if not careful with inner joins, but RLS handles security.
                // To filter efficiently, we rely on RLS or exact query structure.
                // Supabase join filtering:
                .gte('date', start)
                .lte('date', end)
                .order('date', { ascending: true })

            if (error) throw error

            // Filter out days that don't belong to this instructor (if RLS didn't catch them or if join returned nulls)
            const myDays = data?.filter((day: any) => day.classes?.instructor_id === instructor.id) || []
            setClassDays(myDays)

        } catch (error) {
            console.error("Error fetching attendance:", error)
            toast.error("Failed to load attendance schedule")
        } finally {
            setLoading(false)
        }
    }

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7))
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance</h1>
                    <p className="text-gray-500 mt-1">Track daily student presence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 px-2 font-medium min-w-[180px] justify-center text-sm">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            {format(startOfWeek(currentDate), "MMM d")} - {format(endOfWeek(currentDate), "MMM d, yyyy")}
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : classDays.length > 0 ? (
                        classDays.map((day) => (
                            <Link
                                key={day.id}
                                href={`/instructor/attendance/${day.id}`}
                                className="block hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-4 sm:px-6 flex items-center gap-4 sm:gap-6">
                                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg shrink-0 ${isSameDay(new Date(day.date), new Date())
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        <span className="text-xs font-bold uppercase">{format(new Date(day.date), "MMM")}</span>
                                        <span className="text-xl font-bold">{format(new Date(day.date), "d")}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                {day.classes?.name}
                                            </h3>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {format(new Date(day.start_datetime), "h:mm a")} - {format(new Date(day.end_datetime), "h:mm a")}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>2 Hours</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-medium text-gray-900">
                                                {day.attendance_records?.[0]?.count || 0} Marked
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Attendance
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                <CalendarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No classes scheduled</h3>
                            <p className="mt-1">You have no class sessions scheduled for this week.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
