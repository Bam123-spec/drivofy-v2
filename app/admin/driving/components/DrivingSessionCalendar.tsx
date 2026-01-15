'use client'

import { useState } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                    {format(startDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-8 min-w-[800px]">
                    {/* Time Column */}
                    <div className="border-r border-gray-100">
                        <div className="h-10 border-b border-gray-100 bg-gray-50"></div> {/* Header spacer */}
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-gray-100 text-xs text-gray-400 text-right pr-2 pt-2">
                                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, dayIndex) => {
                        const daySessions = getSessionsForDay(day)
                        return (
                            <div key={dayIndex} className="border-r border-gray-100 relative">
                                {/* Day Header */}
                                <div className={`h-10 border-b border-gray-100 flex flex-col items-center justify-center ${isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                    <span className="text-xs font-medium text-gray-500">{format(day, "EEE")}</span>
                                    <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{format(day, "d")}</span>
                                </div>

                                {/* Time Slots Background */}
                                {hours.map(hour => (
                                    <div key={hour} className="h-20 border-b border-gray-100"></div>
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
                                            className={`absolute left-1 right-1 rounded px-2 py-1 text-xs cursor-pointer border shadow-sm overflow-hidden
                                                ${session.status === 'scheduled' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                                    session.status === 'completed' ? 'bg-green-100 border-green-200 text-green-800' :
                                                        'bg-red-100 border-red-200 text-red-800'}
                                            `}
                                            style={{ top: `${topOffset + 40}px`, height: `${height}px` }} // +40 for header
                                            onClick={() => onSelectSession(session)}
                                        >
                                            <div className="font-semibold truncate">{session.profiles?.full_name}</div>
                                            <div className="truncate opacity-75">{session.instructors?.full_name}</div>
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
