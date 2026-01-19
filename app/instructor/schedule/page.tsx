'use client'

import { WeeklyCalendar } from "../components/WeeklyCalendar"

export default function InstructorSchedulePage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">My Schedule</h1>
                <p className="text-muted-foreground mt-1">Manage your driving lessons and availability.</p>
            </div>

            <WeeklyCalendar />
        </div>
    )
}
