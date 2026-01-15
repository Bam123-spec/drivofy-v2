"use client"

import { useState } from "react"
import { addDays, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns"
import { Calendar as CalendarIcon, Users } from "lucide-react"
import { DateRange } from "react-day-picker"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { AttendanceSessionRow } from "./components/AttendanceSessionRow"

type Class = {
    id: string
    name: string
    start_date: string
    end_date: string
}

interface AttendancePageClientProps {
    classes: Class[]
    initialClassId?: string | null
}

export default function AttendancePageClient({ classes, initialClassId }: AttendancePageClientProps) {
    const [selectedClassId, setSelectedClassId] = useState<string | undefined>(initialClassId || undefined)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
        to: endOfWeek(new Date(), { weekStartsOn: 1 }), // Sunday
    })
    const [expandedDate, setExpandedDate] = useState<string | null>(null)

    // Generate list of dates within range, excluding weekends
    // Also filter by class start/end date if a class is selected
    const dates = dateRange?.from && dateRange?.to
        ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).filter(date => {
            const day = date.getDay()
            const isWeekend = day === 0 || day === 6

            if (isWeekend) return false

            if (selectedClassId) {
                const selectedClass = classes.find(c => c.id === selectedClassId)
                if (selectedClass) {
                    const classStart = new Date(selectedClass.start_date)
                    const classEnd = new Date(selectedClass.end_date)
                    // Reset times for comparison
                    date.setHours(0, 0, 0, 0)
                    classStart.setHours(0, 0, 0, 0)
                    classEnd.setHours(0, 0, 0, 0)

                    // Only show dates that are within the class schedule AND the selected range
                    return date >= classStart && date <= classEnd
                }
            }
            return true
        })
        : []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance</h1>
                    <p className="text-gray-500 mt-1">Track daily student presence.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />

                    <Select
                        value={selectedClassId || ""}
                        onValueChange={(val) => setSelectedClassId(val)}
                    >
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {!selectedClassId ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No class selected</h3>
                        <p className="text-gray-500 mt-1">Please select a class to view and mark attendance.</p>
                    </div>
                ) : dates.length > 0 ? (
                    dates.map((date) => {
                        const dateStr = date.toISOString()
                        return (
                            <AttendanceSessionRow
                                key={dateStr}
                                classId={selectedClassId}
                                date={date}
                                isOpen={expandedDate === dateStr}
                                onToggle={() => setExpandedDate(expandedDate === dateStr ? null : dateStr)}
                            />
                        )
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
                        <p className="text-gray-500 mt-1">
                            No active class sessions found for the selected date range.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
