'use client'

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSchedule } from "@/app/actions/instructor"
import { SessionDrawer } from "./SessionDrawer"
import { toast } from "sonner"
import { Suspense } from "react"
import { GoogleCalendarConnect } from "@/app/instructor/profile/components/GoogleCalendarConnect"

export function WeeklyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [data, setData] = useState<{
        sessions: any[],
        googleEvents: any[]
    }>({
        sessions: [],
        googleEvents: []
    })
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<any | null>(null)

    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday start
    const endDate = addDays(startDate, 6)
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
    const hours = Array.from({ length: 19 }).map((_, i) => i + 5) // 5 AM to 11 PM
    const SLOT_HEIGHT = 56 // pixels per hour

    useEffect(() => {
        fetchSchedule()
    }, [currentDate])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
            const res = await getSchedule(startDate.toISOString(), endDate.toISOString())
            setData(res)
        } catch (error) {
            toast.error("Failed to load schedule")
        } finally {
            setLoading(false)
        }
    }

    const getEventsForDay = (date: Date) => {
        const events: any[] = []

        // 1. Drivofy Sessions
        data.sessions.forEach(s => {
            if (isSameDay(parseISO(s.start_time), date)) {
                events.push({
                    id: s.id,
                    type: s.type,
                    title: s.title,
                    start: parseISO(s.start_time),
                    end: parseISO(s.end_time),
                    status: s.status,
                    meta: s
                })
            }
        })

        // 2. Google Calendar Events
        data.googleEvents.forEach(g => {
            const start = parseISO(g.start_time)
            if (isSameDay(start, date)) {
                events.push({
                    id: g.id,
                    type: 'google',
                    title: g.title,
                    start: parseISO(g.start_time),
                    end: parseISO(g.end_time),
                    isGoogle: true
                })
            }
        })

        return events
    }

    return (
        <div className="flex flex-col min-h-[800px] bg-card rounded-xl border border-border shadow-sm overflow-visible mb-10 transition-all duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground">
                        {format(startDate, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> Driving</div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-green-700 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-green-600"></div> Completed</div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shadow-sm"><div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div> Google</div>
                    </div>

                    <div className="h-6 w-[1px] bg-border hidden md:block" />

                    <Suspense fallback={<div className="h-8 w-32 animate-pulse bg-muted rounded-lg" />}>
                        <GoogleCalendarConnect variant="compact" />
                    </Suspense>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto relative">
                <div className="grid grid-cols-8 min-w-[800px] h-full">
                    {/* Time Column */}
                    <div className="border-r border-border bg-muted/30 sticky left-0 z-10">
                        <div className="h-12 border-b border-border bg-muted/30 sticky top-0 z-20"></div> {/* Header spacer */}
                        {hours.map(hour => (
                            <div key={hour} className="h-14 border-b border-border text-[10px] font-bold text-muted-foreground text-right pr-3 pt-2 italic">
                                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, dayIndex) => {
                        const isTodayCol = isSameDay(day, new Date())

                        return (
                            <div key={dayIndex} className={`border-r border-border relative ${isTodayCol ? 'bg-blue-50/30' : ''}`}>
                                {/* Day Header */}
                                <div className={`h-12 border-b border-border flex flex-col items-center justify-center sticky top-0 z-10 bg-card ${isTodayCol ? 'bg-blue-50' : ''}`}>
                                    <span className="text-xs font-medium text-muted-foreground uppercase">{format(day, "EEE")}</span>
                                    <span className={`text-sm font-bold ${isTodayCol ? 'text-blue-600' : 'text-foreground'}`}>{format(day, "d")}</span>
                                </div>

                                {/* Time Slots Background */}
                                {hours.map(hour => (
                                    <div key={hour} className="h-14 border-b border-border/50"></div>
                                ))}

                                {/* Events Overlay */}
                                {getEventsForDay(day).map(event => {
                                    const start = event.start
                                    const end = event.end
                                    const startHour = start.getHours() + start.getMinutes() / 60
                                    const endHour = end.getHours() + end.getMinutes() / 60
                                    const duration = endHour - startHour

                                    const topOffset = (startHour - 5) * SLOT_HEIGHT
                                    const height = duration * SLOT_HEIGHT

                                    if (startHour < 5 || startHour >= 24) return null

                                    let bgClass = "bg-blue-600 shadow-blue-200 border-blue-700 text-white"
                                    if (event.status === 'completed') bgClass = "bg-green-600 shadow-green-200 border-green-700 text-white"
                                    if (event.status === 'cancelled') bgClass = "bg-red-100 border-red-200 text-red-800"
                                    if (event.type === 'google') bgClass = "bg-slate-900 shadow-slate-200 border-black text-white opacity-90"

                                    return (
                                        <div
                                            key={event.id}
                                            className={`absolute left-1 right-1 rounded-xl px-2 py-2 text-[11px] font-bold border-2 shadow-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:z-20 flex flex-col justify-between
                                                ${bgClass}
                                            `}
                                            style={{ top: `${topOffset + 48 + 2}px`, height: `${height - 2}px` }}
                                            onClick={() => !event.isGoogle && setSelectedSession(event.meta)}
                                        >
                                            <div className="leading-tight truncate pr-1">
                                                {event.title}
                                            </div>
                                            {duration > 0.5 && (
                                                <div className="text-[9px] opacity-70 font-black tracking-widest uppercase truncate mt-auto">
                                                    {format(start, "h:mm")} - {format(end, "h:mm a")}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>

            <SessionDrawer
                session={selectedSession}
                open={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                onUpdate={fetchSchedule}
            />
        </div>
    )
}
