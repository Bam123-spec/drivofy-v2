'use client'

import { useEffect, useState } from "react"
import { Loader2, Car, MapPin, Calendar, Clock, Phone, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format, parseISO, isPast } from "date-fns"
import { getSchedule, InstructorEvent } from "@/app/actions/instructor"
import Link from "next/link"

export default function DrivingPage() {
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState<InstructorEvent[]>([])
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')

    useEffect(() => {
        const loadSessions = async () => {
            try {
                // Fetch range (past 7 days to next 30 days)
                const start = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
                const end = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
                const { sessions } = await getSchedule(start, end)

                // Filter for driving only
                const drivingSessions = sessions.filter(s => s.type === 'driving')
                setSessions(drivingSessions)
            } catch (error) {
                console.error("Failed to load driving sessions", error)
            } finally {
                setLoading(false)
            }
        }
        loadSessions()
    }, [])

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const filteredSessions = sessions.filter(s => {
        const isPastSession = isPast(parseISO(s.end_time))
        return filter === 'upcoming' ? !isPastSession : isPastSession
    }).sort((a, b) => {
        return filter === 'upcoming'
            ? new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            : new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Driving Sessions</h1>
                    <p className="text-muted-foreground mt-1">Manage your behind-the-wheel training sessions.</p>
                </div>
                <div className="flex bg-muted p-1 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === 'upcoming' ? 'bg-card text-blue-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === 'past' ? 'bg-card text-blue-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Past
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                        <Card key={session.id} className="group hover:shadow-md transition-all border-border rounded-xl overflow-hidden">
                            <CardContent className="p-0 flex flex-col sm:flex-row">
                                {/* Date Box */}
                                <div className="bg-blue-50 w-full sm:w-32 p-6 flex flex-col items-center justify-center text-blue-700 border-b sm:border-b-0 sm:border-r border-blue-100">
                                    <span className="text-xs font-bold uppercase tracking-wider mb-1">{format(parseISO(session.start_time), "MMM")}</span>
                                    <span className="text-3xl font-bold leading-none">{format(parseISO(session.start_time), "d")}</span>
                                    <span className="text-xs opacity-75 mt-1">{format(parseISO(session.start_time), "EEE")}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                                {session.studentName?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-foreground">{session.studentName}</h3>
                                                <Badge variant="outline" className={`text-xs border-0 ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {session.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    {format(parseISO(session.start_time), "h:mm a")} - {format(parseISO(session.end_time), "h:mm a")}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    Downtown Area
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                                        {session.status === 'scheduled' && !isPast(parseISO(session.start_time)) && (
                                            <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 rounded-full" asChild>
                                                <Link href={`/instructor/driving/${session.id}`}>
                                                    Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                        {session.meta?.profiles?.phone && (
                                            <Button variant="outline" size="icon" className="rounded-full border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50" asChild>
                                                <a href={`tel:${session.meta.profiles.phone}`}>
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                            <Car className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No {filter} Sessions</h3>
                        <p className="text-muted-foreground mt-1">You don't have any {filter} driving sessions.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
