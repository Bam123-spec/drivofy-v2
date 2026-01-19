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
    const [formData, setFormData] = useState({
        name: "",
        class_type: "DE",
        category_id: "",
        instructor_id: "",
        start_date: "",
        end_date: "",
        daily_start_time: "14:00",
        daily_end_time: "16:00",
        selected_days: [1, 2, 3, 4, 5], // Default to Mon-Fri (0=Sun, 1=Mon, ..., 6=Sat)
        recurrence_enabled: false,
        recurrence_interval_value: 1,
        recurrence_interval_unit: "weeks" as "days" | "weeks",
        recurrence_interval_unit: "weeks" as "days" | "weeks",
        recurrence_count: 1,
        // Package fields
        include_package: false,
        package_hours: 6,
        package_sessions: 3,
        package_session_duration: 120 // minutes
    })

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        const [instRes, catRes] = await Promise.all([
            supabase.from('instructors').select('id, full_name').eq('status', 'active').order('full_name'),
            supabase.from('class_categories').select('id, name').order('created_at')
        ])

        if (instRes.data) setInstructors(instRes.data)
        if (catRes.data) setCategories(catRes.data)
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            toast.error("Class name is required")
            return
        }
        if (!formData.instructor_id) {
            toast.error("Please select an instructor")
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

        // End Date is optional now (defaults to Start Date for 1-day classes)
        const finalEndDate = formData.end_date || formData.start_date

        if (new Date(formData.start_date) > new Date(finalEndDate)) {
            toast.error("End date must be after start date")
            return
        }

        try {
            setLoading(true)

            const classesToCreate = []
            const baseData = {
                name: formData.name,
                class_type: formData.class_type,
                category_id: formData.category_id || null,
                instructor_id: formData.instructor_id,
                start_date: formData.start_date,
                end_date: finalEndDate,
                daily_start_time: formData.daily_start_time,
                daily_end_time: formData.daily_end_time,
                daily_start_time: formData.daily_start_time,
                daily_end_time: formData.daily_end_time,
                status: 'active',
                // Package fields
                package_hours: formData.include_package ? formData.package_hours : 0,
                package_sessions: formData.include_package ? formData.package_sessions : 0,
                package_session_duration: formData.include_package ? formData.package_session_duration : 120
            }

            // 1. Prepare the first class
            classesToCreate.push(baseData)

            // 2. If recurrence is enabled, generate additional classes
            if (formData.recurrence_enabled && formData.recurrence_count > 1) {
                // Use parseLocalDate to avoid timezone issues with new Date()
                const parseLocalDate = (dateStr: string) => {
                    const [year, month, day] = dateStr.split('-').map(Number)
                    return new Date(year, month - 1, day)
                }

                const startDate = parseLocalDate(formData.start_date)
                const endDate = parseLocalDate(finalEndDate)
                const interval = formData.recurrence_interval_value || 1
                const unit = formData.recurrence_interval_unit

                for (let i = 1; i < formData.recurrence_count; i++) {
                    // Calculate offset in days
                    let daysToAdd = 0
                    if (unit === 'weeks') {
                        daysToAdd = i * interval * 7
                    } else {
                        daysToAdd = i * interval
                    }

                    // Create new dates (using local time logic to avoid timezone shifts)
                    const newStart = addDays(startDate, daysToAdd)
                    const newEnd = addDays(endDate, daysToAdd)

                    classesToCreate.push({
                        ...baseData,
                        start_date: format(newStart, 'yyyy-MM-dd'),
                        end_date: format(newEnd, 'yyyy-MM-dd'),
                        status: 'upcoming'
                    })
                }
            }

            // 3. Insert all classes and generate days for each
            for (const cls of classesToCreate) {
                const { data: classData, error: classError } = await supabase
                    .from('classes')
                    .insert([cls])
                    .select()
                    .single()

                if (classError) throw classError

                // Generate Class Days for this class
                const daysToInsert: any[] = []
                const parseLocalDate = (dateStr: string) => {
                    const [year, month, day] = dateStr.split('-').map(Number)
                    return new Date(year, month - 1, day)
                }

                const start = parseLocalDate(cls.start_date)
                const end = parseLocalDate(cls.end_date)
                const days = eachDayOfInterval({ start, end })

                days.forEach(day => {
                    // Filter by selected days of week
                    const dayOfWeek = getDay(day)
                    if (!formData.selected_days.includes(dayOfWeek)) {
                        return
                    }

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
            }

            toast.success(`${classesToCreate.length} class(es) created successfully`)
            onSuccess()
            onOpenChange(false)
            setFormData({
                name: "",
                class_type: "DE",
                category_id: "",
                instructor_id: "",
                start_date: "",
                end_date: "",
                daily_start_time: "14:00",
                daily_end_time: "16:00",
                selected_days: [1, 2, 3, 4, 5],
                recurrence_enabled: false,
                recurrence_interval_value: 1,
                recurrence_interval_unit: "weeks",
                recurrence_count: 1,
                include_package: false,
                package_hours: 6,
                package_sessions: 3,
                package_session_duration: 120
            })
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label>Class Name</Label>
                            <Input
                                placeholder="e.g. Evening Theory Session (Nov)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
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
                                    {instructors.map(inst => (
                                        <SelectItem key={inst.id} value={inst.id}>{inst.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
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
                                Students will receive <strong>{formData.package_hours} hours</strong> ({formData.package_sessions} sessions of {formData.package_session_duration} mins) upon graduation.
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
