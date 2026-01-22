"use client"

import { Suspense } from "react"
import { AdminScheduleCalendar } from "./components/AdminScheduleCalendar"
import { GoogleCalendarConnect } from "@/app/instructor/profile/components/GoogleCalendarConnect"
import { CalendarDays, Info, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminSchedulePage() {
    return (
        <div className="space-y-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Schedule</h1>
                    <p className="text-gray-500">Manage all sessions and view external conflicts in one place.</p>
                </div>

                <div className="w-full lg:w-72">
                    <Suspense fallback={<div className="h-12 animate-pulse bg-gray-100 rounded-xl" />}>
                        <GoogleCalendarConnect instructorId="" />
                    </Suspense>
                </div>
            </div>

            <AdminScheduleCalendar />
        </div>
    )
}
