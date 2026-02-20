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

    const positionDayEvents = (events: any[]) => {
        const sorted = [...events].sort((a, b) => {
            const startDiff = a.start.getTime() - b.start.getTime()
            if (startDiff !== 0) return startDiff
            return b.end.getTime() - a.end.getTime()
        })

        const active: Array<{ endMs: number, lane: number }> = []
        const placed: any[] = []

        for (const event of sorted) {
            const startMs = event.start.getTime()
            const endMs = event.end.getTime()

            for (let i = active.length - 1; i >= 0; i--) {
                if (active[i].endMs <= startMs) active.splice(i, 1)
            }

            const usedLanes = new Set(active.map((a) => a.lane))
            let lane = 0
            while (usedLanes.has(lane)) lane++

            active.push({ endMs, lane })
            placed.push({ ...event, lane, startMs, endMs })
        }

        return placed.map((event) => {
            const overlaps = placed.filter((other) =>
                other.id !== event.id &&
                other.startMs < event.endMs &&
                event.startMs < other.endMs
            )
            const group = [event, ...overlaps]
            const columns = Math.max(...group.map((e) => e.lane)) + 1
            return { ...event, columns }
        })
    }

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden flex flex-col h-[760px] mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-50 bg-slate-50/30 gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {format(startDate, "MMMM yyyy")}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Schedule</p>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    {[
                        { label: 'Driving', color: 'bg-blue-500' },
                        { label: 'Theory', color: 'bg-purple-500' },
                        { label: 'Google', color: 'bg-slate-900' }
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4 text-slate-500" />
                    </Button>
                    <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                    <Button variant="ghost" className="h-8 px-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                    <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative overflow-auto scrollbar-hide bg-white">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                        <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="font-bold text-slate-900">Loading schedule...</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-8 min-w-[980px]">
                    <div className="border-r border-slate-100 bg-slate-50/20 sticky left-0 z-30">
                        <div className="h-16 border-b border-slate-100 sticky top-0 z-20 bg-white"></div>
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-slate-50 text-[10px] font-black text-slate-400 text-right pr-3 pt-3 uppercase tracking-wider">
                                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {weekDays.map((day, dayIndex) => {
                        const dayEvents = positionDayEvents(getEventsForDay(day))
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div key={dayIndex} className={`border-r border-slate-100 relative min-w-[135px] ${isToday ? 'bg-blue-50/10' : 'bg-white'}`}>
                                <div className={`h-16 border-b border-slate-100 flex flex-col items-center justify-center sticky top-0 z-20 ${isToday ? 'bg-primary/5' : 'bg-white'}`}>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(day, "EEE")}</span>
                                    <div className={`mt-1 h-7 w-7 rounded-lg flex items-center justify-center text-sm font-black ${isToday ? 'bg-primary text-white' : 'text-slate-900'}`}>
                                        {format(day, "d")}
                                    </div>
                                </div>

                                {hours.map(hour => (
                                    <div key={hour} className="h-20 border-b border-slate-50"></div>
                                ))}

                                {dayEvents.map((event) => {
                                    const start = event.start as Date
                                    const end = event.end as Date
                                    const startHr = start.getHours() + start.getMinutes() / 60
                                    const endHr = end.getHours() + end.getMinutes() / 60
                                    const clampedStartHr = Math.max(5, startHr)
                                    const clampedEndHr = Math.min(24, endHr)
                                    if (clampedEndHr <= clampedStartHr) return null

                                    const top = (clampedStartHr - 5) * 80
                                    const height = Math.max((clampedEndHr - clampedStartHr) * 80 - 4, 30)

                                    let bgClass = "bg-blue-50 border-blue-100 text-blue-700"
                                    if (event.type === 'class') bgClass = "bg-purple-50 border-purple-100 text-purple-700"
                                    if (event.type === 'google') bgClass = "bg-slate-100 border-slate-200 text-slate-700"

                                    const hasConflict = event.type !== 'google' && dayEvents.some(other =>
                                        other.type === 'google' &&
                                        ((start >= other.start && start < other.end) || (end > other.start && end <= other.end) || (start <= other.start && end >= other.end))
                                    )

                                    return (
                                        <div
                                            key={event.id}
                                            className={`absolute left-1 right-1 rounded-xl p-2 text-[11px] border shadow-sm overflow-hidden flex flex-col justify-between font-bold ${bgClass}`}
                                            style={{
                                                top: `${top + 64 + 4}px`,
                                                height: `${height}px`,
                                                left: `calc(${(100 / event.columns) * event.lane}% + 4px)`,
                                                width: `calc(${100 / event.columns}% - 8px)`,
                                                zIndex: 10 + event.lane
                                            }}
                                        >
                                            <div className="space-y-0.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="leading-tight line-clamp-2">{event.title}</span>
                                                    {hasConflict && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="bg-rose-500 p-1 rounded-md">
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
                                                        <div className="p-1 rounded-md bg-slate-200/70">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                {event.subtitle && <div className="text-[9px] font-medium uppercase tracking-wide opacity-80">{event.subtitle}</div>}
                                            </div>

                                            <div className="mt-1 pt-1 border-t border-current/10 flex items-center justify-between text-[9px] font-black uppercase tracking-wider opacity-75">
                                                <span>{format(start, "h:mm a")} - {format(end, "h:mm a")}</span>
                                                {event.status && <span>{event.status}</span>}
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
