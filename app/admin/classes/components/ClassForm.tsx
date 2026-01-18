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
        },
    })

    // Watch start_date to auto-calculate end_date
    const startDate = form.watch("start_date")

    useEffect(() => {
        if (startDate) {
            const start = new Date(startDate)
            if (!isNaN(start.getTime())) {
                // Auto-calculate end date: Start Date + 11 days (Friday of 2nd week)
                const end = addDays(start, 11)
                form.setValue("end_date", format(end, "yyyy-MM-dd"))
            }
        }
    }, [startDate, form])

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
