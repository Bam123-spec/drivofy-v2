"use client"

import { useState } from "react"
import { format, parseISO, isSameDay } from "date-fns"
import { Calendar, Clock, Users, Video, MapPin, ChevronRight, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Session {
    id: string
    date: string
    start_time: string
    end_time: string
    status: string
    class_id: string
    class_name: string
    enrolled_count: number
    total_sessions: number
    completed_sessions: number
    mode?: 'zoom' | 'in-person'
}

interface SessionListProps {
    sessions: Session[]
    limit?: number
}

export function SessionList({ sessions, limit = 10 }: SessionListProps) {
    const [page, setPage] = useState(1)

    const displayedSessions = sessions.slice(0, page * limit)
    const hasMore = sessions.length > displayedSessions.length

    if (sessions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm italic">
                No upcoming sessions found.
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {displayedSessions.map((session) => {
                    const progress = session.total_sessions > 0
                        ? (session.completed_sessions / session.total_sessions) * 100
                        : 0

                    const isZoom = session.mode === 'zoom' || !session.mode // Default to zoom if undefined

                    return (
                        <div
                            key={session.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/10 group-hover:bg-purple-500 transition-colors" />

                            <div className="flex justify-between items-start mb-3 pl-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1" title={session.class_name}>
                                        {session.class_name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-gray-100 text-gray-600 font-normal">
                                            {isZoom ? 'Zoom' : 'In-Person'}
                                        </Badge>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">
                                            {session.enrolled_count} Students
                                        </span>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/instructor/lessons/${session.class_id}`}>Manage Class</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>View Attendance</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-2 pl-2">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                    <span className="font-medium">
                                        {format(parseISO(session.date), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                                    <span>
                                        {session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pl-2">
                                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Course Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-1 bg-gray-100" indicatorClassName="bg-purple-500" />
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end pl-2">
                                <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2">
                                    <Link href={`/instructor/lessons/${session.class_id}`}>
                                        Manage Class <ChevronRight className="h-3 w-3 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => p + 1)}
                        className="text-xs"
                    >
                        Show Next {limit} Sessions
                    </Button>
                </div>
            )}
        </div>
    )
}
