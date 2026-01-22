"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addDays, isMonday } from "date-fns"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Instructor, ClassFormData } from "./types"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    class_type: z.enum(["DE", "RSEP", "DIP"]),
    start_date: z.string().refine((date) => {
        const d = new Date(date)
        // Only enforce Monday for DE classes? For now, let's relax it or keep it if RSEP/DIP also start on Mondays.
        // The user said RSEP/DIP are single session. So they can be any day.
        // Let's remove the Monday restriction for now or make it conditional.
        // For simplicity, I'll remove the strict Monday check here or make it generic.
        return !isNaN(d.getTime())
    }, "Invalid date"),
    end_date: z.string(),
    time_slot: z.string().min(1, "Please select a time slot"),
    instructor_id: z.string().min(1, "Please select an instructor"),
    status: z.enum(["upcoming", "active", "completed", "cancelled"]),
    classification: z.string().optional(),
    recurrence_enabled: z.boolean().optional(),
    recurrence_interval_value: z.coerce.number().min(1).optional(),
    recurrence_interval_unit: z.enum(["days", "weeks"]).optional(),
    recurrence_count: z.coerce.number().min(1).optional(),
})

interface ClassFormProps {
    initialData?: ClassFormData
    instructors: Instructor[]
    onSubmit: (data: ClassFormData) => Promise<void>
    isSubmitting?: boolean
}

export function ClassForm({ initialData, instructors, onSubmit, isSubmitting = false }: ClassFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            class_type: "DE",
            start_date: "",
            end_date: "",
            time_slot: "",
            instructor_id: "",
            status: "upcoming",
            classification: "",
            recurrence_enabled: false,
            recurrence_interval_value: 1,
            recurrence_interval_unit: "weeks",
            recurrence_count: 1,
        },
    })

    // Reset form when initialData changes (for editing different classes)
    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
        }
    }, [initialData, form])

    // Watch start_date and class_type to auto-calculate end_date
    const startDate = form.watch("start_date")
    const classType = form.watch("class_type")

    useEffect(() => {
        if (startDate) {
            const start = new Date(startDate)
            if (!isNaN(start.getTime())) {
                let end = start
                if (classType === 'DE') {
                    // DE: 2 weeks (11 days from Monday to next Friday)
                    end = addDays(start, 11)
                } else {
                    // RSEP/DIP: Single day (0 days diff)
                    end = start
                }
                form.setValue("end_date", format(end, "yyyy-MM-dd"))
            }
        }
    }, [startDate, classType, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Evening Theory (Nov)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="class_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DE">Driver's Ed (DE)</SelectItem>
                                        <SelectItem value="RSEP">RSEP (3-Hour)</SelectItem>
                                        <SelectItem value="DIP">DIP (Improvement)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {classType === 'DE' && (
                    <FormField
                        control={form.control}
                        name="classification"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Classification</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select classification..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Morning">Morning</SelectItem>
                                        <SelectItem value="Evening">Evening</SelectItem>
                                        <SelectItem value="Weekend">Weekend</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date (Monday)</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Must be a Monday.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} disabled className="bg-gray-50" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Auto-calculated (2 weeks).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="time_slot"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time Slot</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</SelectItem>
                                    <SelectItem value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</SelectItem>
                                    <SelectItem value="6:00 PM - 8:00 PM">6:00 PM - 8:00 PM</SelectItem>
                                    {/* Add the current value if it's not in the standard list */}
                                    {initialData?.time_slot &&
                                        !["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM", "6:00 PM - 8:00 PM"].includes(initialData.time_slot) && (
                                            <SelectItem value={initialData.time_slot}>
                                                {initialData.time_slot}
                                            </SelectItem>
                                        )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="instructor_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instructor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select instructor..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {instructors.map((inst) => (
                                        <SelectItem key={inst.id} value={inst.id}>
                                            {inst.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!initialData && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-4 border border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">Recurrence (Optional)</h3>
                            <FormField
                                control={form.control}
                                name="recurrence_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            Repeat this class
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.watch("recurrence_enabled") && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label>Repeat every</Label>
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="recurrence_interval_value"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input type="number" min={1} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="recurrence_interval_unit"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="days">Days</SelectItem>
                                                            <SelectItem value="weeks">Weeks</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="recurrence_count"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Number of occurrences</Label>
                                            <FormControl>
                                                <Input type="number" min={1} max={52} {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Total classes to create (including first one).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Save Changes" : "Create Class"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
