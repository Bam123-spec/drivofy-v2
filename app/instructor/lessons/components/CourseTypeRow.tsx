"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, Users, FileText, Settings, Car, Shield, Activity, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SessionList } from "./SessionList"

interface CourseTypeRowProps {
    type: string
    courses: any[]
    expanded: boolean
    onToggle: () => void
}

export function CourseTypeRow({ type, courses, expanded, onToggle }: CourseTypeRowProps) {
    // Determine Icon based on type
    const getIcon = (t: string) => {
        const lower = t.toLowerCase()
        if (lower.includes('driver')) return Car
        if (lower.includes('safety') || lower.includes('rsep')) return Shield
        if (lower.includes('alcohol') || lower.includes('drug')) return Activity
        return BookOpen
    }

    const Icon = getIcon(type)
    const upcomingCount = courses.filter(c => c.status === 'scheduled' || c.status === 'active').length // Or check dates. Simple status check for now.

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
            {/* Header Row */}
            <div
                className={cn(
                    "p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors",
                    expanded ? "bg-gray-50/50" : "hover:bg-gray-50"
                )}
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                        expanded ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{type}</h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {upcomingCount} Active/Upcoming
                            <span className="mx-2 text-gray-300">|</span>
                            {courses.length} Total
                        </p>
                    </div>
                </div>

                {/* Removed admin buttons */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-gray-400 transition-transform duration-300 ml-2",
                        expanded && "rotate-180 bg-gray-200 text-gray-600"
                    )}>
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50/30">
                        <div className="py-4">
                            <SessionList sessions={courses} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
