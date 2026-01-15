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
import { addWeeks, eachDayOfInterval, format, addDays } from "date-fns"

interface CreateClassDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CreateClassDialog({ open, onOpenChange, onSuccess }: CreateClassDialogProps) {
    const [loading, setLoading] = useState(false)
    const [instructors, setInstructors] = useState<any[]>([])
    const [formData, setFormData] = useState({
        name: "",
        instructor_id: "",
        start_date: "",
        end_date: "",
        daily_start_time: "14:00",
        daily_end_time: "16:00",
        repeat_every_weeks: 0, // 0 = no repeat
        generate_future_runs: 4 // Default 4 runs if repeating
    })

    useEffect(() => {
        if (open) {
            fetchInstructors()
        }
    }, [open])

    const fetchInstructors = async () => {
        const { data } = await supabase
            .from('instructors')
            .select('id, full_name')
            .eq('status', 'active')
            .order('full_name')

        if (data) setInstructors(data)
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
        if (!formData.end_date) {
            toast.error("End date is required")
            return
        }
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            toast.error("End date must be after start date")
            return
        }

        try {
            setLoading(true)

            // 1. Create the Class
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .insert([{
                    name: formData.name,
                    instructor_id: formData.instructor_id,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    daily_start_time: formData.daily_start_time,
                    daily_end_time: formData.daily_end_time,
                    repeat_every_weeks: formData.repeat_every_weeks > 0 ? formData.repeat_every_weeks : null,
                    status: 'active'
                }])
                .select()
                .single()

            if (classError) throw classError

            // 2. Generate Class Days
            const daysToInsert: any[] = []

            // Helper to parse YYYY-MM-DD as local start of day
            const parseLocalDate = (dateStr: string) => {
                const [year, month, day] = dateStr.split('-').map(Number)
                return new Date(year, month - 1, day)
            }

            const start = parseLocalDate(formData.start_date)
            const end = parseLocalDate(formData.end_date)

            // Generate days for the main run
            const days = eachDayOfInterval({ start, end })

            days.forEach(day => {
                // Combine date with time for timestamps
                const startDateTime = new Date(day)
                const [startHour, startMinute] = formData.daily_start_time.split(':')
                startDateTime.setHours(parseInt(startHour), parseInt(startMinute))

                const endDateTime = new Date(day)
                const [endHour, endMinute] = formData.daily_end_time.split(':')
                endDateTime.setHours(parseInt(endHour), parseInt(endMinute))

                daysToInsert.push({
                    class_id: classData.id,
                    date: format(day, 'yyyy-MM-dd'),
                    start_datetime: startDateTime.toISOString(),
                    end_datetime: endDateTime.toISOString(),
                    status: 'scheduled'
                })
            })

            // Handle Recurrence
            if (formData.repeat_every_weeks > 0) {
                for (let i = 1; i <= formData.generate_future_runs; i++) {
                    const offsetWeeks = i * formData.repeat_every_weeks
                    // Use the parsed local dates for adding weeks to avoid shifting
                    const newStart = addWeeks(parseLocalDate(formData.start_date), offsetWeeks)
                    const newEnd = addWeeks(parseLocalDate(formData.end_date), offsetWeeks)

                    // Create Future Class
                    const { data: futureClass, error: futureError } = await supabase
                        .from('classes')
                        .insert([{
                            name: classData.name,
                            instructor_id: classData.instructor_id,
                            daily_start_time: classData.daily_start_time,
                            daily_end_time: classData.daily_end_time,
                            status: 'active',
                            start_date: format(newStart, 'yyyy-MM-dd'),
                            end_date: format(newEnd, 'yyyy-MM-dd'),
                            repeat_every_weeks: formData.repeat_every_weeks > 0 ? formData.repeat_every_weeks : null
                        }])
                        .select()
                        .single()

                    if (futureError) console.error("Error creating future class:", JSON.stringify(futureError, null, 2))

                    if (futureClass) {
                        // Generate days for future class
                        const futureDays = eachDayOfInterval({ start: newStart, end: newEnd })
                        futureDays.forEach(day => {
                            const startDateTime = new Date(day)
                            const [startHour, startMinute] = formData.daily_start_time.split(':')
                            startDateTime.setHours(parseInt(startHour), parseInt(startMinute))

                            const endDateTime = new Date(day)
                            const [endHour, endMinute] = formData.daily_end_time.split(':')
                            endDateTime.setHours(parseInt(endHour), parseInt(endMinute))

                            daysToInsert.push({
                                class_id: futureClass.id,
                                date: format(day, 'yyyy-MM-dd'),
                                start_datetime: startDateTime.toISOString(),
                                end_datetime: endDateTime.toISOString(),
                                status: 'scheduled'
                            })
                        })
                    }
                }
            }

            // Bulk insert all days
            if (daysToInsert.length > 0) {
                const { error: daysError } = await supabase
                    .from('class_days')
                    .insert(daysToInsert)

                if (daysError) throw daysError
            }

            toast.success("Class created successfully")
            onSuccess()
            onOpenChange(false)
            setFormData({
                name: "",
                instructor_id: "",
                start_date: "",
                end_date: "",
                daily_start_time: "14:00",
                daily_end_time: "16:00",
                repeat_every_weeks: 0,
                generate_future_runs: 4
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
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
                        <div className="space-y-2 col-span-2">
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

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="recurrence"
                            checked={formData.repeat_every_weeks > 0}
                            onCheckedChange={(checked) => setFormData({ ...formData, repeat_every_weeks: checked ? 2 : 0 })}
                        />
                        <Label htmlFor="recurrence" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Repeat this class every 2 weeks
                        </Label>
                    </div>

                    {formData.repeat_every_weeks > 0 && (
                        <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-md flex items-start gap-2">
                            <Repeat className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                                This will automatically create <strong>{formData.generate_future_runs} future runs</strong> of this class, spaced {formData.repeat_every_weeks} weeks apart.
                            </div>
                        </div>
                    )}
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
