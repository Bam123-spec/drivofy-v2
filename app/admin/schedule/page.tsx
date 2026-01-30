"use client"

import { Suspense } from "react"
import { AdminScheduleCalendar } from "./components/AdminScheduleCalendar"
import { GoogleCalendarConnect } from "@/app/instructor/profile/components/GoogleCalendarConnect"
import { CalendarDays, Info, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminSchedulePage() {
    return (
        <div className="space-y-6 pb-6 overflow-x-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 mb-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Schedule</h1>
                    <p className="text-gray-500 font-medium">Manage all sessions and view external conflicts in one place.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Suspense fallback={<div className="h-10 w-48 animate-pulse bg-gray-100 rounded-xl" />}>
                        <GoogleCalendarConnect instructorId="" variant="compact" />
                    </Suspense>
                </div>
            </div>

            <AdminScheduleCalendar />
        </div>
    )
}
