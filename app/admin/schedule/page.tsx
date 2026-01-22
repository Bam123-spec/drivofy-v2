"use client"

import { Suspense } from "react"
import { AdminScheduleCalendar } from "./components/AdminScheduleCalendar"
import { GoogleCalendarConnect } from "@/app/instructor/profile/components/GoogleCalendarConnect"
import { CalendarDays, Info, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminSchedulePage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Schedule</h1>
                    <p className="text-gray-500 text-lg">Unified operational view of classes, sessions, and external events.</p>
                </div>

                <div className="w-full lg:w-72">
                    <Suspense fallback={<div className="h-20 animate-pulse bg-gray-100 rounded-xl" />}>
                        <GoogleCalendarConnect instructorId="" />
                    </Suspense>
                </div>
            </div>

            {/* Integration Note */}
            <Alert className="bg-blue-50 border-blue-100 text-blue-800 rounded-2xl p-4">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertTitle className="font-bold mb-1 ml-2">Smart Conflict Detection</AlertTitle>
                <AlertDescription className="text-blue-700/80 ml-2">
                    Connect your Google Calendar to see external busy times. The calendar will automatically highlight conflicts with
                    internal driving sessions and theory classes to help you manage your time effectively.
                </AlertDescription>
            </Alert>

            {/* Main Calendar View */}
            <div className="relative">
                <AdminScheduleCalendar />
            </div>

            {/* Legend / Info Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Driving Sessions</h3>
                        <p className="text-sm text-gray-500">Individual behind-the-wheel appointments for students.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Info className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Theory Classes</h3>
                        <p className="text-sm text-gray-500">Classroom-based educational sessions (recurring M-F).</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <ShieldAlert className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Google Sync</h3>
                        <p className="text-sm text-gray-500">Real-time availability from your personal/work Google accounts.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
