'use client'

import { useState } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DrivingSessionCalendarProps {
    sessions: any[]
    onSelectSession: (session: any) => void
}

export function DrivingSessionCalendar({ sessions, onSelectSession }: DrivingSessionCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday start

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

    const hours = Array.from({ length: 13 }).map((_, i) => i + 8) // 8 AM to 8 PM

    const getSessionsForDay = (date: Date) => {
        return sessions.filter(s => isSameDay(parseISO(s.start_time), date))
    }

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden flex flex-col h-[700px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {format(startDate, "MMMM yyyy")}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Schedule</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
                            <ChevronLeft className="h-4 w-4 text-slate-500" />
                        </Button>
                        <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                        <Button variant="ghost" className="h-8 px-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                        <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-50 transition-colors" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto scrollbar-hide">
                <div className="grid grid-cols-8 min-w-[900px]">
                    {/* Time Column */}
                    <div className="border-r border-slate-50 bg-slate-50/20">
                        <div className="h-16 border-b border-slate-50"></div> {/* Header spacer */}
                        {hours.map(hour => (
                            <div key={hour} className="h-24 border-b border-slate-50 text-[10px] font-black text-slate-400 text-right pr-4 pt-4 uppercase tracking-tighter">
                                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, dayIndex) => {
                        const daySessions = getSessionsForDay(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div key={dayIndex} className={`border-r border-slate-50 relative group/day ${isToday ? 'bg-blue-50/10' : ''}`}>
                                {/* Day Header */}
                                <div className={`h-16 border-b border-slate-50 flex flex-col items-center justify-center transition-colors ${isToday ? 'bg-primary/5' : 'bg-white'}`}>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(day, "EEE")}</span>
                                    <div className={`mt-1 h-7 w-7 rounded-lg flex items-center justify-center text-sm font-black transition-all ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-slate-900'}`}>
                                        {format(day, "d")}
                                    </div>
                                </div>

                                {/* Time Slots Background */}
                                {hours.map(hour => (
                                    <div key={hour} className="h-24 border-b border-slate-50/50 group-hover/day:bg-slate-50/30 transition-colors"></div>
                                ))}

                                {/* Sessions Overlay */}
                                {daySessions.map(session => {
                                    const start = parseISO(session.start_time)
                                    const end = parseISO(session.end_time)
                                    const startHour = start.getHours() + start.getMinutes() / 60
                                    const endHour = end.getHours() + end.getMinutes() / 60
                                    const duration = endHour - startHour

                                    // Calculate position relative to 8 AM start
                                    const topOffset = (startHour - 8) * 96 // 96px per hour
                                    const height = duration * 96

                                    if (startHour < 8 || startHour >= 21) return null // Out of view

                                    const getStatusColor = (status: string) => {
                                        switch (status) {
                                            case 'completed': return 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                            case 'cancelled':
                                            case 'no_show': return 'bg-rose-50 border-rose-100 text-rose-700'
                                            default: return 'bg-blue-50 border-blue-100 text-blue-700 shadow-blue-100/50'
                                        }
                                    }

                                    return (
                                        <div
                                            key={session.id}
                                            className={`absolute left-1 right-1 rounded-xl p-2.5 text-[11px] cursor-pointer border shadow-sm overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md hover:z-10 group/session font-bold
                                                ${getStatusColor(session.status)}
                                            `}
                                            style={{ top: `${topOffset + 64 + 4}px`, height: `${height - 8}px` }} // +64 for header, -8 for gaps
                                            onClick={() => onSelectSession(session)}
                                        >
                                            <div className="flex flex-col h-full justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="truncate text-xs font-black tracking-tight flex items-center gap-1">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${session.status === 'scheduled' ? 'bg-primary animate-pulse' : 'bg-current opacity-40'}`} />
                                                        {session.profiles?.full_name}
                                                    </div>
                                                    <div className="truncate opacity-70 flex items-center gap-1 font-bold">
                                                        <User className="h-3 w-3" />
                                                        {session.instructors?.full_name}
                                                    </div>
                                                </div>
                                                <div className="mt-1 pt-1 border-t border-current/10 flex items-center justify-between opacity-60 text-[9px] font-black uppercase tracking-tighter">
                                                    <span>{format(start, "h:mm a")}</span>
                                                    <span>{duration}h</span>
                                                </div>
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
