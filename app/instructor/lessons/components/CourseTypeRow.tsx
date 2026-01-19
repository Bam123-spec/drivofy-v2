"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Plus, Users, FileText, Settings, Car, Shield, Activity, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SessionList } from "./SessionList"

interface CourseTypeRowProps {
    type: string
    sessions: any[]
    expanded: boolean
    onToggle: () => void
    onAddClass: () => void
}

export function CourseTypeRow({ type, sessions, expanded, onToggle, onAddClass }: CourseTypeRowProps) {
    // Determine Icon based on type
    const getIcon = (t: string) => {
        const lower = t.toLowerCase()
        if (lower.includes('driver')) return Car
        if (lower.includes('safety') || lower.includes('rsep')) return Shield
        if (lower.includes('alcohol') || lower.includes('drug')) return Activity
        return BookOpen
    }

    const Icon = getIcon(type)
    const upcomingCount = sessions.filter(s => new Date(s.date) >= new Date()).length

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
                            {upcomingCount} Upcoming Sessions
                            <span className="mx-2 text-gray-300">|</span>
                            {sessions.length} Total
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="hidden md:flex items-center gap-2 mr-4">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-gray-600">
                            <Users className="h-3.5 w-3.5 mr-2" />
                            Enrollments
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-gray-600">
                            <FileText className="h-3.5 w-3.5 mr-2" />
                            Attendance
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-gray-600">
                            <Settings className="h-3.5 w-3.5 mr-2" />
                            Settings
                        </Button>
                    </div>

                    <Button
                        size="sm"
                        className="h-9 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        onClick={onAddClass}
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Class
                    </Button>

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
                            <SessionList sessions={sessions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
