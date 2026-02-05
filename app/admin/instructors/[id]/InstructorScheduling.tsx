"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Save, Clock, Calendar, AlertCircle, Package } from "lucide-react"
import { parse, isAfter, isBefore } from "date-fns"
import { SlotPreview } from "./SlotPreview"

const DAYS = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
]

export function InstructorScheduling({ instructor, onUpdate }: { instructor: any, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false)
    const [assignedServices, setAssignedServices] = useState<any[]>([])
    const [packageDuration, setPackageDuration] = useState<number>(120) // Default 2 hours
    const [formData, setFormData] = useState({
        working_days: instructor.working_days || [1, 2, 3, 4, 5],
        start_time: instructor.start_time || "7:00 AM",
        end_time: instructor.end_time || "7:00 PM",
        break_start: instructor.break_start || "",
        break_end: instructor.break_end || "",
        slot_minutes: instructor.slot_minutes || 60,
        min_notice_hours: instructor.min_notice_hours || 12,
        is_active: instructor.is_active ?? true
    })

    // Fetch all service packages associated with this instructor
    useEffect(() => {
        const fetchAssignedServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('service_package_instructors')
                    .select(`
                        service_package:service_packages(*)
                    `)
                    .eq('instructor_id', instructor.id)

                if (!error && data) {
                    const services = data.map((d: any) => d.service_package).filter(Boolean)
                    setAssignedServices(services)

                    // Set package duration from the first service if available
                    if (services.length > 0) {
                        setPackageDuration(services[0].duration_minutes)
                    }
                }
            } catch (e) {
                console.error('Error fetching assigned services:', e)
            }
        }
        fetchAssignedServices()
    }, [instructor.id])

    const handleDayToggle = (day: number) => {
        setFormData(prev => ({
            ...prev,
            working_days: prev.working_days.includes(day)
                ? prev.working_days.filter((d: number) => d !== day)
                : [...prev.working_days, day].sort()
        }))
    }

    const validateTimes = () => {
        const reference = new Date()
        // Flexible parsing for h:mm a
        const parseT = (t: string) => {
            try {
                return parse(t.toUpperCase(), "h:mm a", reference)
            } catch {
                return null
            }
        }

        const start = parseT(formData.start_time)
        const end = parseT(formData.end_time)

        if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
            toast.error("Invalid working hours format. Use 'h:mm AM/PM'")
            return false
        }

        if (!isAfter(end, start)) {
            toast.error("End time must be after start time")
            return false
        }

        if (formData.break_start || formData.break_end) {
            const bStart = parseT(formData.break_start)
            const bEnd = parseT(formData.break_end)

            if (!bStart || isNaN(bStart.getTime()) || !bEnd || isNaN(bEnd.getTime())) {
                toast.error("Invalid break hours format. Use 'h:mm AM/PM'")
                return false
            }

            if (!isAfter(bEnd, bStart)) {
                toast.error("Break end must be after break start")
                return false
            }

            if (isBefore(bStart, start) || isAfter(bEnd, end)) {
                toast.error("Break must be within working hours")
                return false
            }
        }
        return true
    }

    const handleSave = async () => {
        if (!validateTimes()) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('instructors')
                .update({
                    working_days: formData.working_days,
                    start_time: formData.start_time.toUpperCase(),
                    end_time: formData.end_time.toUpperCase(),
                    break_start: formData.break_start ? formData.break_start.toUpperCase() : null,
                    break_end: formData.break_end ? formData.break_end.toUpperCase() : null,
                    slot_minutes: Number(formData.slot_minutes),
                    min_notice_hours: Number(formData.min_notice_hours),
                    is_active: formData.is_active
                })
                .eq('id', instructor.id)

            if (error) throw error
            toast.success("Scheduling rules updated successfully")
            onUpdate()
        } catch (error: any) {
            console.error("Save error:", error)
            toast.error(error.message || "Failed to save scheduling rules")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Availability Rules
                            </CardTitle>
                            <CardDescription>Configure when this instructor is available for bookings.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                            <Label htmlFor="active-toggle" className="text-xs font-bold uppercase tracking-wider text-slate-500">Active</Label>
                            <Switch
                                id="active-toggle"
                                checked={formData.is_active}
                                onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* Working Days */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Working Days</Label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day) => (
                                <div
                                    key={day.value}
                                    onClick={() => handleDayToggle(day.value)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer select-none ${formData.working_days.includes(day.value)
                                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                        }`}
                                >
                                    <Checkbox
                                        checked={formData.working_days.includes(day.value)}
                                        className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <span className="font-bold text-sm tracking-tight">{day.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Working Hours */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Working Hours</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600">Start Time</Label>
                                    <Input
                                        placeholder="9:00 AM"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600">End Time</Label>
                                    <Input
                                        placeholder="6:00 PM"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Break Window */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Break Window (Optional)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600">Break Start</Label>
                                    <Input
                                        placeholder="1:00 PM"
                                        value={formData.break_start}
                                        onChange={(e) => setFormData({ ...formData, break_start: e.target.value })}
                                        className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600">Break End</Label>
                                    <Input
                                        placeholder="2:00 PM"
                                        value={formData.break_end}
                                        onChange={(e) => setFormData({ ...formData, break_end: e.target.value })}
                                        className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                        {/* Slot Config */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Slot Interval</Label>
                            <Select
                                value={formData.slot_minutes.toString()}
                                onValueChange={(val) => setFormData({ ...formData, slot_minutes: parseInt(val) })}
                            >
                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="60" className="font-medium p-3">60 Minutes (1 Hour)</SelectItem>
                                    <SelectItem value="120" className="font-medium p-3">120 Minutes (2 Hours)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notice Config */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Min Notice (Hours)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.min_notice_hours}
                                onChange={(e) => setFormData({ ...formData, min_notice_hours: parseInt(e.target.value) || 0 })}
                                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500 font-bold"
                            />
                        </div>
                    </div>

                    {/* Assigned Services & Packages */}
                    <div className="pt-8 border-t border-slate-50 space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-widest text-slate-400">Teaching Services</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Individual Services */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    INDIVIDUAL SERVICES
                                </h4>
                                <div className="space-y-2">
                                    {assignedServices.filter(s => s.category !== 'package').length > 0 ? (
                                        assignedServices.filter(s => s.category !== 'package').map(svc => (
                                            <div key={svc.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <span className="text-sm font-semibold text-slate-700">{svc.display_name}</span>
                                                <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100">{svc.duration_minutes}m</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No individual services assigned</p>
                                    )}
                                </div>
                            </div>

                            {/* Multi-session Packages */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-orange-500 flex items-center gap-2">
                                    <Package className="h-3 w-3" />
                                    MULTI-SESSION PACKAGES
                                </h4>
                                <div className="space-y-2">
                                    {assignedServices.filter(s => s.category === 'package').length > 0 ? (
                                        assignedServices.filter(s => s.category === 'package').map(svc => (
                                            <div key={svc.id} className="flex items-center justify-between p-3 bg-orange-50/30 border border-orange-100 rounded-xl shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{svc.display_name}</span>
                                                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">{svc.credits_granted} session package</span>
                                                </div>
                                                <Badge className="bg-orange-500 text-white border-0">{svc.duration_minutes}m</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No packages assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tip/Info */}
                    <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Times should be in 12-hour format (e.g., 9:00 AM). Changes here will be applied to the next available slots generated for students.
                        </p>
                    </div>

                    {/* Slot Preview Panel */}
                    <SlotPreview
                        startTime={formData.start_time}
                        endTime={formData.end_time}
                        slotIntervalMinutes={formData.slot_minutes}
                        packageDurationMinutes={packageDuration}
                        breakStart={formData.break_start}
                        breakEnd={formData.break_end}
                    />
                </CardContent>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-600/20 w-full sm:w-auto transition-all"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Scheduling Rules
                    </Button>
                </div>
            </Card>
        </div>
    )
}
