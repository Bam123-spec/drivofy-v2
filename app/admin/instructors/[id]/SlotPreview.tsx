"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { parse, format, addMinutes, isBefore, isAfter } from "date-fns"

interface SlotPreviewProps {
    startTime: string
    endTime: string
    slotIntervalMinutes: number
    packageDurationMinutes?: number
    breakStart?: string
    breakEnd?: string
}

interface TimeSlot {
    start: Date
    end: Date
    label: string
}

interface ValidationIssue {
    type: 'warning' | 'error'
    message: string
}

export function SlotPreview({
    startTime,
    endTime,
    slotIntervalMinutes,
    packageDurationMinutes = 120, // Default 2-hour package
    breakStart,
    breakEnd
}: SlotPreviewProps) {
    const { slots, issues } = useMemo(() => {
        const validationIssues: ValidationIssue[] = []
        const generatedSlots: TimeSlot[] = []

        try {
            // Parse times with flexible format
            const reference = new Date()
            const parseT = (t: string) => {
                if (!t) return null
                try {
                    return parse(t.toUpperCase().trim(), "h:mm a", reference)
                } catch {
                    return null
                }
            }

            const start = parseT(startTime)
            const end = parseT(endTime)
            const bStart = breakStart ? parseT(breakStart) : null
            const bEnd = breakEnd ? parseT(breakEnd) : null

            // Validation: basic time parsing
            if (!start || isNaN(start.getTime())) {
                validationIssues.push({ type: 'error', message: 'Invalid start time format' })
                return { slots: generatedSlots, issues: validationIssues }
            }

            if (!end || isNaN(end.getTime())) {
                validationIssues.push({ type: 'error', message: 'Invalid end time format' })
                return { slots: generatedSlots, issues: validationIssues }
            }

            if (!isAfter(end, start)) {
                validationIssues.push({ type: 'error', message: 'End time must be after start time' })
                return { slots: generatedSlots, issues: validationIssues }
            }

            // Validate break times if provided
            if ((bStart && !bEnd) || (!bStart && bEnd)) {
                validationIssues.push({ type: 'warning', message: 'Break window requires both start and end times' })
            }

            if (bStart && bEnd) {
                if (!isAfter(bEnd, bStart)) {
                    validationIssues.push({ type: 'warning', message: 'Break end must be after break start' })
                }
                if (isBefore(bStart, start) || isAfter(bEnd, end)) {
                    validationIssues.push({ type: 'warning', message: 'Break must be within working hours' })
                }
            }

            // Calculate total available minutes
            const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

            // Generate slots using slot interval
            let currentTime = start
            while (isBefore(currentTime, end)) {
                const slotEnd = addMinutes(currentTime, packageDurationMinutes)

                // Check if slot goes beyond end time
                if (isAfter(slotEnd, end)) {
                    // Partial slot - add warning
                    const remainingMinutes = (end.getTime() - currentTime.getTime()) / (1000 * 60)
                    validationIssues.push({
                        type: 'warning',
                        message: `Partial slot of ${Math.round(remainingMinutes)} minutes at the end (requires ${packageDurationMinutes} minutes)`
                    })
                    break
                }

                // Check if slot overlaps with break
                let overlapsBreak = false
                if (bStart && bEnd) {
                    // Slot overlaps break if: slot starts before break ends AND slot ends after break starts
                    if (isBefore(currentTime, bEnd) && isAfter(slotEnd, bStart)) {
                        overlapsBreak = true
                    }
                }

                if (!overlapsBreak) {
                    generatedSlots.push({
                        start: currentTime,
                        end: slotEnd,
                        label: `${format(currentTime, 'h:mm a')} – ${format(slotEnd, 'h:mm a')}`
                    })
                }

                // Move to next slot using interval
                currentTime = addMinutes(currentTime, slotIntervalMinutes)
            }

            // Check for inefficient configurations
            if (packageDurationMinutes < slotIntervalMinutes) {
                validationIssues.push({
                    type: 'warning',
                    message: 'Slot interval is larger than package duration - this will create gaps'
                })
            }

            if (packageDurationMinutes > slotIntervalMinutes && packageDurationMinutes % slotIntervalMinutes !== 0) {
                validationIssues.push({
                    type: 'warning',
                    message: 'Package duration is not a multiple of slot interval - may cause scheduling issues'
                })
            }

        } catch (error) {
            validationIssues.push({ type: 'error', message: 'Error calculating slots' })
        }

        return { slots: generatedSlots, issues: validationIssues }
    }, [startTime, endTime, slotIntervalMinutes, packageDurationMinutes, breakStart, breakEnd])

    return (
        <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Slot Preview
                        </CardTitle>
                        <CardDescription>
                            Generated time slots based on current configuration
                        </CardDescription>
                    </div>
                    {slots.length > 0 && (
                        <Badge variant="secondary" className="px-3 py-1 text-sm font-bold bg-purple-50 text-purple-700 border-purple-200">
                            {slots.length} Slots
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Configuration Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-bold text-slate-900">{packageDurationMinutes} min</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interval</p>
                        <p className="text-sm font-bold text-slate-900">{slotIntervalMinutes} min</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hours</p>
                        <p className="text-sm font-bold text-slate-900">{startTime} - {endTime}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Break</p>
                        <p className="text-sm font-bold text-slate-900">
                            {breakStart && breakEnd ? `${breakStart} - ${breakEnd}` : 'None'}
                        </p>
                    </div>
                </div>

                {/* Validation Issues */}
                {issues.length > 0 && (
                    <div className="space-y-2">
                        {issues.map((issue, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 p-3 rounded-xl border ${issue.type === 'error'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-amber-50 border-amber-200'
                                    }`}
                            >
                                <AlertTriangle
                                    className={`h-5 w-5 shrink-0 ${issue.type === 'error' ? 'text-red-600' : 'text-amber-600'
                                        }`}
                                />
                                <p
                                    className={`text-sm font-medium ${issue.type === 'error' ? 'text-red-800' : 'text-amber-800'
                                        }`}
                                >
                                    {issue.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Slot Display */}
                {slots.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <p className="text-sm font-bold text-slate-600">Generated Slots</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {slots.map((slot, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl group hover:shadow-md hover:scale-105 transition-all cursor-default"
                                >
                                    <p className="text-sm font-bold text-purple-700 group-hover:text-blue-700 transition-colors">
                                        {slot.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !issues.some(i => i.type === 'error') && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Clock className="h-12 w-12 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-500">No slots generated</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Adjust your configuration to see available time slots
                            </p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    )
}
