"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Calendar as CalendarIcon,
    Clock,
    Users,
    Repeat
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { addWeeks, eachDayOfInterval, format, addDays, isWeekend, getDay } from "date-fns"

interface CreateClassDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CreateClassDialog({ open, onOpenChange, onSuccess }: CreateClassDialogProps) {
    const [loading, setLoading] = useState(false)
    const [instructors, setInstructors] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])

    // New UI States
    const [createMode, setCreateMode] = useState<"single" | "seed">("single")

    const [formData, setFormData] = useState({
        name: "",
        class_type: "DE",
        category_id: "",
        instructor_id: "",
        series_key: "", // New field
        start_date: "",
        end_date: "",
        daily_start_time: "14:00",
        daily_end_time: "16:00",
        selected_days: [1, 2, 3, 4, 5], // Default to Mon-Fri
        recurrence_enabled: false,
        recurrence_interval_value: 1,
        recurrence_interval_unit: "weeks" as "days" | "weeks",
        recurrence_count: 1,
        seed_count: 26, // Default for seed mode (editable)
        // Package fields
        include_package: false,
        package_hours: 6,
        package_sessions: 3,
        package_session_duration: 120 // minutes
    })

    // Computed: Is this DE?
    const isDE = formData.class_type === "DE"

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    // Auto-calculate End Date for DE
    useEffect(() => {
        if (isDE && formData.start_date) {
            // DE is 2 weeks (Weekdays) or 5 weeks (Weekends).
            const start = new Date(formData.start_date + "T00:00:00")
            if (!isNaN(start.getTime())) {
                const isWeekendSeries = formData.series_key === "de_weekend_5wk"
                // Weekday: 13 days from start (2 weeks)
                // Weekend: 29 days from start being Sat (Sat->Sun 5 weeks later is ~29-30 days. 4 weeks + 1 day? 5 weekends = 29 days inclusive)
                const daysToAdd = isWeekendSeries ? 29 : 13
                const end = addDays(start, daysToAdd)
                setFormData(prev => ({ ...prev, end_date: format(end, 'yyyy-MM-dd') }))
            }
        }
    }, [isDE, formData.start_date, formData.series_key])

    const fetchData = async () => {
        const [instRes, catRes] = await Promise.all([
            supabase.from('instructors').select('id, full_name').eq('status', 'active').order('full_name'),
            supabase.from('class_categories').select('id, name').order('created_at')
        ])

        if (instRes.data) setInstructors(instRes.data)
        if (catRes.data) setCategories(catRes.data)
    }

    const calculateDailyDuration = () => {
        if (!formData.daily_start_time || !formData.daily_end_time) return ""
        try {
            const [sh, sm] = formData.daily_start_time.split(":").map(Number)
            const [eh, em] = formData.daily_end_time.split(":").map(Number)
            const date = new Date()
            const start = new Date(date.setHours(sh, sm, 0))
            const end = new Date(date.setHours(eh, em, 0))
            const diffMs = end.getTime() - start.getTime()
            if (diffMs <= 0) return "Invalid time"
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            return `${diffHours}h ${diffMins}m`
        } catch (e) {
            return ""
        }
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            toast.error("Class name is required")
            return
        }
        if (!formData.start_date) {
            toast.error("Start date is required")
            return
        }
        if (formData.selected_days.length === 0) {
            toast.error("Please select at least one class day")
            return
        }
        if (isDE && createMode === "seed" && !formData.series_key) {
            toast.error("Series / Template is required for seeding")
            return
        }

        const finalEndDate = formData.end_date || formData.start_date

        if (new Date(formData.start_date) > new Date(finalEndDate)) {
            toast.error("End date must be after start date")
            return
        }

        try {
            setLoading(true)

            // Base Data
            const baseData = {
                class_type: formData.class_type,
                category_id: formData.category_id || null,
                instructor_id: formData.instructor_id || null,
                daily_start_time: formData.daily_start_time,
                daily_end_time: formData.daily_end_time,
                status: 'active',
                series_key: isDE ? (formData.series_key || null) : null, // Only store for DE
                // Package fields
                package_hours: formData.include_package ? formData.package_hours : 0,
                package_sessions: formData.include_package ? formData.package_sessions : 0,
                package_session_duration: formData.include_package ? formData.package_session_duration : 120
            }

            const classesToCreate = []

            if (isDE && createMode === "seed") {
                // SEED MODE: Create N cohorts 2 weeks apart
                // Use local date parsing safely
                const parseLocalDate = (dateStr: string) => {
                    const [year, month, day] = dateStr.split('-').map(Number)
                    return new Date(year, month - 1, day)
                }

                const startDate = parseLocalDate(formData.start_date)
                const count = Math.max(1, formData.seed_count)

                const isWeekendSeries = formData.series_key === "de_weekend_5wk"
                // Weekday: Interval 14 days, Duration 13 days
                // Weekend: Interval 35 days (5 weeks), Duration 29 days
                const interval = isWeekendSeries ? 35 : 14
                const duration = isWeekendSeries ? 29 : 13

                for (let i = 0; i < count; i++) {
                    const currentStart = addDays(startDate, i * interval)
                    const currentEnd = addDays(currentStart, duration)

                    // For seeded names, maybe append date or keep same? 
                    // Usually "Driver's Ed (Morning)" is the series. 
                    // Let's use the Form Name + Date for uniqueness in UI if desired, 
                    // or just keep the name same and rely on dates.
                    // Let's append formatted date to differ them: "Name - Jan 27"
                    const nameSuffix = format(currentStart, 'MMM d')
                    const className = `${formData.name} - ${nameSuffix}`

                    classesToCreate.push({
                        ...baseData,
                        name: className,
                        start_date: format(currentStart, 'yyyy-MM-dd'),
                        end_date: format(currentEnd, 'yyyy-MM-dd'),
                        status: i === 0 ? 'active' : 'upcoming' // Only first one active? Or all? User wanted "seed future". Upcoming seems safer for future. First one active.
                    })
                }

            } else {
                // SINGLE MODE (Legacy behavior maintained for RSEP/DIP and Single DE)
                // Recurrence logic for RSEP/DIP if enabled
                classesToCreate.push({
                    ...baseData,
                    name: formData.name,
                    start_date: formData.start_date,
                    end_date: finalEndDate,
                    status: 'active'
                })

                // If legacy recurrence (Repeat this class) is on
                if (formData.recurrence_enabled && formData.recurrence_count > 1) {
                    const parseLocalDate = (dateStr: string) => {
                        const [year, month, day] = dateStr.split('-').map(Number)
                        return new Date(year, month - 1, day)
                    }
                    const startDate = parseLocalDate(formData.start_date)
                    const endDate = parseLocalDate(finalEndDate)
                    const interval = formData.recurrence_interval_value || 1
                    const unit = formData.recurrence_interval_unit

                    for (let i = 1; i < formData.recurrence_count; i++) {
                        let daysToAdd = unit === 'weeks' ? i * interval * 7 : i * interval
                        const newStart = addDays(startDate, daysToAdd)
                        const newEnd = addDays(endDate, daysToAdd)

                        classesToCreate.push({
                            ...baseData,
                            name: formData.name, // Keep same name for simple repeats
                            start_date: format(newStart, 'yyyy-MM-dd'),
                            end_date: format(newEnd, 'yyyy-MM-dd'),
                            status: 'upcoming'
                        })
                    }
                }
            }

            let createdCount = 0
            let skippedCount = 0

            // INSERT LOOP
            for (const cls of classesToCreate) {
                // Idempotency Check:
                // If we have a series_key, check if it exists
                if (cls.series_key) {
                    const { data: existing } = await supabase
                        .from('classes')
                        .select('id')
                        .eq('series_key', cls.series_key)
                        .eq('start_date', cls.start_date)
                        .maybeSingle()

                    if (existing) {
                        skippedCount++
                        continue
                    }
                }

                const { data: classData, error: classError } = await supabase
                    .from('classes')
                    .insert([cls])
                    .select()
                    .single()

                if (classError) {
                    // Unique constraint violation might happen if race condition
                    if (classError.code === '23505') { // Unique violation
                        skippedCount++
                        continue
                    }
                    console.error("Insert error:", classError)
                    throw classError
                }

                // Generate Class Days
                const daysToInsert: any[] = []
                const parseLocalDate = (dateStr: string) => {
                    const [year, month, day] = dateStr.split('-').map(Number)
                    return new Date(year, month - 1, day)
                }

                const start = parseLocalDate(cls.start_date)
                const end = parseLocalDate(cls.end_date)
                const days = eachDayOfInterval({ start, end })

                days.forEach(day => {
                    const dayOfWeek = getDay(day)
                    if (!formData.selected_days.includes(dayOfWeek)) return

                    const startDateTime = new Date(day)
                    const [startHour, startMinute] = cls.daily_start_time.split(':')
                    startDateTime.setHours(parseInt(startHour), parseInt(startMinute))

                    const endDateTime = new Date(day)
                    const [endHour, endMinute] = cls.daily_end_time.split(':')
                    endDateTime.setHours(parseInt(endHour), parseInt(endMinute))

                    daysToInsert.push({
                        class_id: classData.id,
                        date: format(day, 'yyyy-MM-dd'),
                        start_datetime: startDateTime.toISOString(),
                        end_datetime: endDateTime.toISOString(),
                        status: 'scheduled'
                    })
                })

                if (daysToInsert.length > 0) {
                    const { error: daysError } = await supabase
                        .from('class_days')
                        .insert(daysToInsert)
                    if (daysError) throw daysError
                }
                createdCount++
            }

            if (createdCount > 0) {
                toast.success(`${createdCount} class(es) created successfully. (${skippedCount} skipped)`)
            } else if (skippedCount > 0) {
                toast.info("No new classes created (all duplicates skipped).")
            }

            onSuccess()
            onOpenChange(false)
            // Reset to defaults
            setFormData({
                name: "",
                class_type: "DE",
                category_id: "",
                instructor_id: "",
                series_key: "",
                start_date: "",
                end_date: "",
                daily_start_time: "14:00",
                daily_end_time: "16:00",
                selected_days: [1, 2, 3, 4, 5],
                recurrence_enabled: false,
                recurrence_interval_value: 1,
                recurrence_interval_unit: "weeks",
                recurrence_count: 1,
                seed_count: 26,
                include_package: false,
                package_hours: 6,
                package_sessions: 3,
                package_session_duration: 120
            })
            setCreateMode("single")

        } catch (error: any) {
            console.error("Error creating class:", JSON.stringify(error, null, 2))
            toast.error(error?.message || "Failed to create class")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="admin-light sm:max-w-[600px] bg-white text-gray-900 border-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Create New Class</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Set up a new theory course run.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Section 1: Top Controls (Mode & Series) */}
                    {isDE && (
                        <div className="p-4 bg-purple-50 rounded-lg space-y-4 border border-purple-100 mb-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-purple-900 font-semibold">Create Mode</Label>
                                <div className="flex items-center space-x-2 bg-white rounded-md p-1 border">
                                    <button
                                        onClick={() => setCreateMode("single")}
                                        className={`px-3 py-1 text-sm rounded-sm transition-colors ${createMode === "single" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                        Single Cohort
                                    </button>
                                    <button
                                        onClick={() => setCreateMode("seed")}
                                        className={`px-3 py-1 text-sm rounded-sm transition-colors ${createMode === "seed" ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                        Seed Cohorts
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-purple-900">
                                    Series / Template <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.series_key}
                                    onValueChange={(val) => setFormData({ ...formData, series_key: val })}
                                >
                                    <SelectTrigger className="bg-white border-purple-200">
                                        <SelectValue placeholder="Select a series template..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="de_morning_2wk">Driver's Ed (Morning) – 2 week</SelectItem>
                                        <SelectItem value="de_evening_2wk">Driver's Ed (Evening) – 2 week</SelectItem>
                                        <SelectItem value="de_weekend_5wk">Driver's Ed (Weekend) – 5 week</SelectItem>
                                    </SelectContent>
                                </Select>
                                {createMode === "seed" && (
                                    <p className="text-xs text-purple-600">
                                        This key ensures we don't create duplicate cohorts for the same date.
                                    </p>
                                )}
                            </div>

                            {/* Seed Count Input */}
                            {createMode === "seed" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                    <Label className="text-purple-900">Cohorts to Seed</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={52}
                                            className="bg-white border-purple-200 w-24"
                                            value={formData.seed_count}
                                            onChange={(e) => setFormData({ ...formData, seed_count: parseInt(e.target.value) || 26 })}
                                        />
                                        <span className="text-sm text-purple-600">
                                            cohorts (approx {formData.seed_count * 2} weeks)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label>Class Name (Base)</Label>
                            <Input
                                placeholder={createMode === "seed" ? "e.g. Morning Session" : "e.g. Evening Theory Session (Nov)"}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {createMode === "seed" && <p className="text-xs text-gray-500">Dates will be appended automatically (e.g. "Morning Session - Jan 27").</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Class Group (Row)</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(val) => setFormData({ ...formData, category_id: val === "none" ? "" : val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a group (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Class Type</Label>
                            <Select
                                value={formData.class_type}
                                onValueChange={(val) => setFormData({ ...formData, class_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DE">Driver's Ed (DE)</SelectItem>
                                    <SelectItem value="RSEP">RSEP (3-Hour)</SelectItem>
                                    <SelectItem value="DIP">DIP (Improvement)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Instructor</Label>
                            <Select
                                value={formData.instructor_id}
                                onValueChange={(val) => setFormData({ ...formData, instructor_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned font-bold">Unassigned</SelectItem>
                                    {instructors.map(inst => (
                                        <SelectItem key={inst.id} value={inst.id}>{inst.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date {createMode === "seed" && "(First Cohort)"}</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    readOnly={isDE} // Read-only for DE mostly
                                    className={isDE ? "bg-gray-100 text-gray-500" : ""}
                                />
                                {isDE && (
                                    <div className="absolute right-2 top-2 text-xs text-gray-400 pointer-events-none">
                                        {formData.series_key === 'de_weekend_5wk' ? 'Auto (5 weeks)' : 'Auto (2 weeks)'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Daily Start Time</Label>
                            <Input
                                type="time"
                                value={formData.daily_start_time}
                                onChange={(e) => setFormData({ ...formData, daily_start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Daily End Time</Label>
                            <Input
                                type="time"
                                value={formData.daily_end_time}
                                onChange={(e) => setFormData({ ...formData, daily_end_time: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Duration Display */}
                    <div className="text-xs text-gray-500 text-right -mt-2">
                        Duration: {calculateDailyDuration()}
                    </div>

                    <div className="space-y-3">
                        <Label>Class Days</Label>
                        <div className="flex gap-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        const newDays = formData.selected_days.includes(index)
                                            ? formData.selected_days.filter(d => d !== index)
                                            : [...formData.selected_days, index]
                                        setFormData({ ...formData, selected_days: newDays })
                                    }}
                                    className={`
                                        w-8 h-8 rounded-full text-xs font-medium transition-all border
                                        ${formData.selected_days.includes(index)
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Select the days of the week this class meets.
                        </p>
                    </div>

                    {/* Single Mode Recurrence (Legacy) - Hide in Seed Mode */}
                    {createMode === "single" && (
                        <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-100">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="recurrence"
                                    checked={formData.recurrence_enabled}
                                    onCheckedChange={(checked) => setFormData({ ...formData, recurrence_enabled: !!checked })}
                                />
                                <Label htmlFor="recurrence" className="text-sm font-medium leading-none cursor-pointer">
                                    Repeat this class
                                </Label>
                            </div>

                            {formData.recurrence_enabled && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Repeat every</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                className="bg-white"
                                                value={formData.recurrence_interval_value}
                                                onChange={(e) => setFormData({ ...formData, recurrence_interval_value: parseInt(e.target.value) || 1 })}
                                            />
                                            <Select
                                                value={formData.recurrence_interval_unit}
                                                onValueChange={(val: 'days' | 'weeks') => setFormData({ ...formData, recurrence_interval_unit: val })}
                                            >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="days">Days</SelectItem>
                                                    <SelectItem value="weeks">Weeks</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Occurrences</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={52}
                                            className="bg-white"
                                            value={formData.recurrence_count}
                                            onChange={(e) => setFormData({ ...formData, recurrence_count: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Driving Package Section */}
                    <div className="p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-100">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="package"
                                checked={formData.include_package}
                                onCheckedChange={(checked) => setFormData({ ...formData, include_package: !!checked })}
                                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Label htmlFor="package" className="text-sm font-medium leading-none cursor-pointer text-blue-900">
                                Include Driving Package (Post-Graduation)
                            </Label>
                        </div>

                        {formData.include_package && (
                            <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label className="text-xs text-blue-700">Total Hours</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                        value={formData.package_hours}
                                        onChange={(e) => setFormData({ ...formData, package_hours: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-blue-700">Sessions</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                        value={formData.package_sessions}
                                        onChange={(e) => setFormData({ ...formData, package_sessions: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-blue-700">Mins/Session</Label>
                                    <Input
                                        type="number"
                                        step={15}
                                        min={30}
                                        className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                        value={formData.package_session_duration}
                                        onChange={(e) => setFormData({ ...formData, package_session_duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        )}
                        {formData.include_package && (
                            <p className="text-xs text-blue-600 italic">
                                Students receive these credits <strong>AFTER passing with ≥ 80%</strong>. ({formData.package_hours} hours, {formData.package_sessions} sessions)
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
