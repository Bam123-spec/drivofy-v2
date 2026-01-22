'use client'

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks, startOfDay, endOfDay } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAdminSchedule } from "@/app/actions/schedule"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function AdminScheduleCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [data, setData] = useState<{
        drivingSessions: any[],
        classes: any[],
        googleBusy: any[]
    }>({
        drivingSessions: [],
        classes: [],
        googleBusy: []
    })
    const [loading, setLoading] = useState(true)

    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
    const endDate = addDays(startDate, 6)
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
    const hours = Array.from({ length: 15 }).map((_, i) => i + 7) // 7 AM to 10 PM

    useEffect(() => {
        fetchSchedule()
    }, [currentDate])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
            // Fetch for the whole week
            const res = await getAdminSchedule(
                startOfDay(startDate).toISOString(),
                endOfDay(endDate).toISOString()
            )
            setData(res)
        } catch (error: any) {
            toast.error("Failed to load schedule: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const getEventsForDay = (date: Date) => {
        const events: any[] = []

        // 1. Driving Sessions
        data.drivingSessions.forEach(s => {
            if (isSameDay(parseISO(s.start_time), date)) {
                events.push({
                    id: `driving-${s.id}`,
                    type: 'driving',
                    title: `Driving: ${s.profiles?.full_name}`,
                    subtitle: `Instr: ${s.instructors?.full_name}`,
                    start: parseISO(s.start_time),
                    end: parseISO(s.end_time),
                    status: s.status
                })
            }
        })

        // 2. Classes (Theory)
        data.classes.forEach(c => {
            // Simple check: is date within class range?
            const classStart = parseISO(c.start_date)
            const classEnd = parseISO(c.end_date)

            if (date >= startOfDay(classStart) && date <= endOfDay(classEnd)) {
                // Now check if it's a weekday (Theory often M-F)
                const dayOfWeek = date.getDay()
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    // Combine date with daily times
                    const [sh, sm] = (c.daily_start_time || "00:00:00").split(':').map(Number)
                    const [eh, em] = (c.daily_end_time || "00:00:00").split(':').map(Number)

                    const start = new Date(date)
                    start.setHours(sh, sm, 0)

                    const end = new Date(date)
                    end.setHours(eh, em, 0)

                    events.push({
                        id: `class-${c.id}-${date.toISOString()}`,
                        type: 'class',
                        title: `Class: ${c.name}`,
                        subtitle: `Instr: ${c.instructors?.full_name}`,
                        start,
                        end,
                        status: c.status
                    })
                }
            }
        })

        // 3. Google Calendar Busy
        data.googleBusy.forEach((b, idx) => {
            if (isSameDay(parseISO(b.start), date)) {
                events.push({
                    id: `google-${idx}-${date.toISOString()}`,
                    type: 'google',
                    title: 'Google: Busy',
                    start: parseISO(b.start),
                    end: parseISO(b.end),
                })
            }
        })

        return events
    }

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-30 gap-4">
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {format(startDate, "MMMM yyyy")}
                        </h2>
                        <p className="text-sm text-gray-500">Weekly operational overview</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white hover:shadow-sm" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 px-4 text-sm font-semibold hover:bg-white hover:shadow-sm" onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white hover:shadow-sm" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-blue-500 shadow-sm shadow-blue-200"></div>
                        <span className="text-xs font-medium text-gray-600">Driving</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-purple-500 shadow-sm shadow-purple-200"></div>
                        <span className="text-xs font-medium text-gray-600">Theory</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-amber-500 shadow-sm shadow-amber-200"></div>
                        <span className="text-xs font-medium text-gray-600">Google</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto relative scrollbar-hide">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-40 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="font-medium text-sm text-gray-700">Syncing schedule...</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-8 min-w-[1000px] h-full">
                    {/* Time Column */}
                    <div className="border-r border-gray-100 bg-gray-50/50 sticky left-0 z-20">
                        <div className="h-14 border-b border-gray-100 bg-gray-50/50 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Time
                        </div>
                        {hours.map(hour => (
                            <div key={hour} className="h-24 border-b border-gray-100 text-[11px] font-semibold text-gray-400 text-right pr-4 pt-4">
                                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    {weekDays.map((day, dayIndex) => {
                        const dayEvents = getEventsForDay(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div key={dayIndex} className={`border-r border-gray-100 relative ${isToday ? 'bg-blue-50/10' : ''}`}>
                                {/* Day Header */}
                                <div className={`h-14 border-b border-gray-100 flex flex-col items-center justify-center sticky top-0 z-10 bg-white/95 backdrop-blur-md ${isToday ? 'bg-blue-50/50' : ''}`}>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(day, "EEE")}</span>
                                    <span className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>{format(day, "d")}</span>
                                    {isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary ring-4 ring-primary/10"></div>}
                                </div>

                                {/* Slots */}
                                {hours.map(hour => (
                                    <div key={hour} className="h-24 border-b border-gray-50/60 transition-colors hover:bg-gray-50/40"></div>
                                ))}

                                {/* Events */}
                                {dayEvents.map((event, eventIdx) => {
                                    const start = event.start
                                    const end = event.end
                                    const startHr = start.getHours() + start.getMinutes() / 60
                                    const endHr = end.getHours() + end.getMinutes() / 60
                                    const duration = endHr - startHr

                                    const top = (startHr - 7) * 96 // 96px per hour (h-24)
                                    const height = duration * 96

                                    if (startHr < 7 || startHr >= 22) return null

                                    let bgClass = "bg-blue-500"
                                    let borderClass = "border-blue-600"
                                    let textClass = "text-white"

                                    if (event.type === 'class') {
                                        bgClass = "bg-purple-500"
                                        borderClass = "border-purple-600"
                                    } else if (event.type === 'google') {
                                        bgClass = "bg-amber-500"
                                        borderClass = "border-amber-600"
                                    }

                                    // Check for conflicts with Google
                                    const hasConflict = event.type !== 'google' && dayEvents.some(other =>
                                        other.type === 'google' &&
                                        ((start >= other.start && start < other.end) || (end > other.start && end <= other.end))
                                    )

                                    return (
                                        <div
                                            key={event.id}
                                            className={`absolute left-1 right-1 rounded-xl px-3 py-2 text-[11px] font-medium border shadow-sm overflow-hidden transition-all hover:z-20 hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between
                                                ${bgClass} ${borderClass} ${textClass}
                                            `}
                                            style={{ top: `${top + 56 + 2}px`, height: `${height - 4}px` }}
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-bold leading-tight flex items-center justify-between gap-1">
                                                    <span className="truncate">{event.title}</span>
                                                    {hasConflict && <AlertTriangle className="h-3 w-3 text-white animate-pulse shrink-0" />}
                                                </div>
                                                {event.subtitle && <div className="truncate opacity-90 text-[10px] font-normal">{event.subtitle}</div>}
                                            </div>
                                            <div className="text-[10px] font-bold opacity-80 mt-auto">
                                                {format(start, "h:mm")} - {format(end, "h:mm a")}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
