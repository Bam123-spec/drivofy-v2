'use client'

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSchedule } from "@/app/actions/instructor"
import { SessionDrawer } from "./SessionDrawer"
import { toast } from "sonner"

export function WeeklyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<any | null>(null)

    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday start
    const endDate = addDays(startDate, 6)
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
    const hours = Array.from({ length: 13 }).map((_, i) => i + 8) // 8 AM to 8 PM

    useEffect(() => {
        fetchSchedule()
    }, [currentDate])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
            const { sessions } = await getSchedule(startDate.toISOString(), endDate.toISOString())
            setSessions(sessions)
        } catch (error) {
            toast.error("Failed to load schedule")
        } finally {
            setLoading(false)
        }
    }

    const getSessionsForDay = (date: Date) => {
        return sessions.filter(s => isSameDay(parseISO(s.start_time), date))
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div> Scheduled</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div> Completed</div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto relative">
                <div className="grid grid-cols-8 min-w-[800px] h-full">
                    {/* Time Column */}
                    <div className="border-r border-border bg-muted/30 sticky left-0 z-10">
                        <div className="h-12 border-b border-border bg-muted/30 sticky top-0 z-20"></div> {/* Header spacer */}
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-border text-xs text-muted-foreground text-right pr-2 pt-2">
                                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, dayIndex) => {
                        const daySessions = getSessionsForDay(day)
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
                                    <div key={hour} className="h-20 border-b border-border"></div>
                                ))}

                                {/* Sessions Overlay */}
                                {daySessions.map(session => {
                                    const start = parseISO(session.start_time)
                                    const end = parseISO(session.end_time)
                                    const startHour = start.getHours() + start.getMinutes() / 60
                                    const endHour = end.getHours() + end.getMinutes() / 60
                                    const duration = endHour - startHour

                                    // Calculate position relative to 8 AM start
                                    const topOffset = (startHour - 8) * 80 // 80px per hour
                                    const height = duration * 80

                                    if (startHour < 8 || startHour >= 21) return null // Out of view

                                    return (
                                        <div
                                            key={session.id}
                                            className={`absolute left-1 right-1 rounded-lg px-2 py-1.5 text-xs cursor-pointer border shadow-sm overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md hover:z-10
                                                ${session.status === 'scheduled' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                                    session.status === 'completed' ? 'bg-green-100 border-green-200 text-green-800' :
                                                        'bg-red-100 border-red-200 text-red-800'}
                                            `}
                                            style={{ top: `${topOffset + 48}px`, height: `${height}px` }} // +48 for header
                                            onClick={() => setSelectedSession(session)}
                                        >
                                            <div className="font-bold truncate">{session.profiles?.full_name}</div>
                                            <div className="truncate opacity-75">{format(start, "h:mm a")} - {format(end, "h:mm a")}</div>
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
