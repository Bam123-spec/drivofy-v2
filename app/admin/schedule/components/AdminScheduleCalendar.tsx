'use client'

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks, startOfDay, endOfDay } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAdminSchedule } from "@/app/actions/schedule"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AdminScheduleCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [data, setData] = useState<{
        drivingSessions: any[],
        classes: any[],
        classDays: any[],
        googleEvents: any[]
    }>({
        drivingSessions: [],
        classes: [],
        classDays: [],
        googleEvents: []
    })
    const [loading, setLoading] = useState(true)

    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
    const endDate = addDays(startDate, 6)
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
    const hours = Array.from({ length: 19 }).map((_, i) => i + 5) // 5 AM to 11 PM

    useEffect(() => {
        fetchSchedule()
    }, [currentDate])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
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
        const classById = new Map((data.classes || []).map((c: any) => [c.id, c]))
        const classesWithDays = new Set((data.classDays || []).map((d: any) => d.class_id))

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

        // 2. Classes (Theory) - prefer real class_days schedule.
        data.classDays.forEach((day: any) => {
            if (!day?.start_datetime || !day?.end_datetime) return
            const start = parseISO(day.start_datetime)
            const end = parseISO(day.end_datetime)
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
            if (!isSameDay(start, date)) return

            const cls = classById.get(day.class_id)
            events.push({
                id: `class-day-${day.id}`,
                type: 'class',
                title: `Class: ${cls?.name || "Theory Session"}`,
                subtitle: `Instr: ${cls?.instructors?.full_name || "Unassigned"}`,
                start,
                end,
                status: cls?.status
            })
        })

        // Fallback for legacy rows that do not have class_days.
        data.classes.forEach(c => {
            if (classesWithDays.has(c.id)) return
            const classStart = parseISO(c.start_date)
            const classEnd = parseISO(c.end_date)

            if (date >= startOfDay(classStart) && date <= endOfDay(classEnd)) {
                const dayOfWeek = date.getDay()
                const classification = String(c.classification || "").toLowerCase()
                const isWeekendClass = classification.includes("weekend")
                const dayMatches = isWeekendClass
                    ? dayOfWeek === 0 || dayOfWeek === 6
                    : dayOfWeek >= 1 && dayOfWeek <= 5
                if (dayMatches && c.daily_start_time && c.daily_end_time) {
                    const [sh, sm] = String(c.daily_start_time).split(':').map(Number)
                    const [eh, em] = String(c.daily_end_time).split(':').map(Number)
                    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return

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

        // 3. Google Calendar Events
        data.googleEvents.forEach((b) => {
            const rawStart = String(b.start || "")
            if (!rawStart) return
            const startDay = parseISO(rawStart)
            if (Number.isNaN(startDay.getTime())) return

            if (isSameDay(startDay, date)) {
                const isAllDay = !rawStart.includes("T")
                const start = isAllDay ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 0, 0) : parseISO(rawStart)
                const parsedEnd = b.end ? parseISO(String(b.end)) : null
                const end = isAllDay
                    ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0)
                    : parsedEnd && !Number.isNaN(parsedEnd.getTime())
                        ? parsedEnd
                        : new Date(start.getTime() + 60 * 60 * 1000)

                events.push({
                    id: b.id,
                    type: 'google',
                    title: isAllDay ? `All Day: ${b.title || 'Busy'}` : b.title || 'Unknown Event',
                    start,
                    end,
                    isGoogle: true
                })
            }
        })

        return events
    }

    return (
        <div className="flex flex-col min-h-[1000px] bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden animate-in fade-in duration-700 mb-10">
            {/* Calendar Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-50 bg-white/80 backdrop-blur-xl gap-6">
                <div className="flex items-center gap-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight min-w-[200px]">
                        {format(startDate, "MMMM yyyy")}
                    </h2>

                    <div className="hidden md:flex items-center gap-4 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100/50">
                        {[
                            { label: 'Driving', color: 'bg-blue-500 shadow-blue-200' },
                            { label: 'Theory', color: 'bg-purple-500 shadow-purple-200' },
                            { label: 'Google', color: 'bg-slate-900 shadow-gray-200' }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-lg`}></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white hover:text-blue-600 hover:shadow-md rounded-xl transition-all" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 px-8 text-sm font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:shadow-md rounded-xl transition-all text-gray-900" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white hover:text-blue-600 hover:shadow-md rounded-xl transition-all" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 relative bg-gray-50/30 overflow-x-auto overflow-y-hidden custom-scrollbar">
                {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4 animate-in zoom-in-95 duration-300">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="font-bold text-gray-900">Syncing Intelligence...</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-8 min-w-[1240px] h-full">
                    {/* Time Scale Column */}
                    <div className="border-r border-gray-100 bg-white/50 sticky left-0 z-30 backdrop-blur-md shrink-0">
                        <div className="h-24 border-b border-gray-100 flex items-center justify-center text-[9px] font-black text-gray-400 font-mono uppercase tracking-[0.2em] sticky top-0 bg-white/90 backdrop-blur-xl z-20">
                            Time
                        </div>
                        {hours.map(hour => (
                            <div key={hour} className="h-14 border-b border-gray-50/50 text-[10px] font-bold text-gray-400 text-right pr-4 pt-4">
                                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map((day, dayIndex) => {
                        const dayEvents = getEventsForDay(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div key={dayIndex} className={`border-r border-gray-100 relative shrink-0 min-w-[150px] ${isToday ? 'bg-blue-50/5' : ''}`}>
                                {/* Day Header */}
                                <div className={`h-24 border-b border-gray-100 flex flex-col items-center justify-center sticky top-0 z-20 bg-white/95 backdrop-blur-xl group/header transition-colors ${isToday ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 font-mono">{format(day, "EEE")}</span>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-3xl font-black tracking-tighter transition-all ${isToday ? 'text-blue-600' : 'text-gray-900 group-hover/header:text-blue-600'}`}>
                                            {format(day, "d")}
                                        </span>
                                        {isToday && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)] animate-pulse ring-4 ring-blue-600/10 mb-1"></div>
                                        )}
                                    </div>
                                    {isToday && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 shadow-[0_-2px_8px_rgba(37,99,235,0.3)]"></div>}
                                </div>

                                {/* Slot BG */}
                                {hours.map(hour => (
                                    <div key={hour} className="h-14 border-b border-gray-50/40 transition-colors hover:bg-white/50"></div>
                                ))}

                                {/* Interactive Events Overlay */}
                                {dayEvents.map((event) => {
                                    const start = event.start
                                    const end = event.end
                                    const startHr = start.getHours() + start.getMinutes() / 60
                                    const endHr = end.getHours() + end.getMinutes() / 60
                                    const duration = endHr - startHr

                                    const top = (startHr - 5) * 56 // 56px per hour (h-14)
                                    const height = duration * 56

                                    if (startHr < 5 || startHr >= 24) return null

                                    let bgClass = "bg-blue-600 shadow-blue-200"
                                    let borderClass = "border-blue-700"
                                    let textClass = "text-white"

                                    if (event.type === 'class') {
                                        bgClass = "bg-purple-600 shadow-purple-200"
                                        borderClass = "border-purple-700"
                                    } else if (event.type === 'google') {
                                        bgClass = "bg-slate-900 shadow-slate-200"
                                        borderClass = "border-black"
                                    }

                                    // Conflict Detection Logic
                                    const hasConflict = event.type !== 'google' && dayEvents.some(other =>
                                        other.type === 'google' &&
                                        ((start >= other.start && start < other.end) || (end > other.start && end <= other.end) || (start <= other.start && end >= other.end))
                                    )

                                    return (
                                        <div
                                            key={event.id}
                                            className={`absolute left-1 right-1 rounded-2xl px-4 py-3 text-[11px] font-bold border-2 shadow-xl overflow-hidden transition-all hover:z-50 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between group cursor-default
                                                ${bgClass} ${borderClass} ${textClass}
                                                ${event.type === 'google' ? 'opacity-90 grayscale-[0.2] hover:grayscale-0' : ''}
                                            `}
                                            style={{ top: `${top + 96 + 2}px`, height: `${height - 2}px` }}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="leading-tight line-clamp-2">{event.title}</span>
                                                    {hasConflict && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="bg-red-500 p-1.5 rounded-lg animate-pulse ring-4 ring-red-500/20">
                                                                        <AlertTriangle className="h-3 w-3 text-white" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-slate-900 text-white border-0 rounded-xl p-3 shadow-2xl">
                                                                    <p className="font-bold flex items-center gap-2">
                                                                        <ShieldAlert className="h-4 w-4 text-red-400" />
                                                                        Schedule Conflict Detected
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-400 mt-1">This slot overlaps with an external Google Calendar event.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {event.type === 'google' && (
                                                        <div className="bg-white/10 p-1 rounded-md opacity-50 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                {event.subtitle && <div className="text-[9px] font-medium text-white/70 tracking-wide uppercase">{event.subtitle}</div>}
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="px-2 py-1 rounded-lg bg-black/20 backdrop-blur-md text-[9px] font-black tracking-widest uppercase">
                                                    {format(start, "h:mm")} - {format(end, "h:mm a")}
                                                </div>
                                                {event.status && (
                                                    <div className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                                        {event.status}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Design Accent */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div >
    )
}

function ShieldAlert(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    )
}
