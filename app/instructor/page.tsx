'use client'

import { useEffect, useState } from "react"
import {
    Loader2,
    Calendar,
    Clock,
    MapPin,
    Users,
    ChevronRight,
    Car,
    AlertCircle,
    CheckCircle2,
    Phone,
    Timer,
    CalendarDays,
    BookOpen,
    Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isAfter, parseISO } from "date-fns"
import Link from "next/link"
import { getDashboardStats, InstructorEvent } from "@/app/actions/instructor"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function InstructorDashboard() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [scheduleView, setScheduleView] = useState<'today' | 'tomorrow' | 'week'>('today')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const stats = await getDashboardStats()
            setData(stats)
        } catch (error) {
            console.error("Failed to load dashboard", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!data) return null

    const { instructorName, hoursToday, activeStudents, nextLesson, weekSessions, todaySessionsCount, canDriving, canTheory } = data

    // Filter sessions based on view
    const getFilteredSessions = () => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (scheduleView === 'today') {
            return weekSessions.filter((s: InstructorEvent) => isToday(parseISO(s.start_time)))
        } else if (scheduleView === 'tomorrow') {
            return weekSessions.filter((s: InstructorEvent) => {
                const d = parseISO(s.start_time)
                return d.getDate() === tomorrow.getDate() &&
                    d.getMonth() === tomorrow.getMonth() &&
                    d.getFullYear() === tomorrow.getFullYear()
            })
        } else {
            return weekSessions // 'week' returns all
        }
    }

    const filteredSessions = getFilteredSessions()

    // Group by day for 'week' view
    const groupedSessions = scheduleView === 'week'
        ? filteredSessions.reduce((groups: any, session: InstructorEvent) => {
            const date = format(parseISO(session.start_time), "yyyy-MM-dd")
            if (!groups[date]) groups[date] = []
            groups[date].push(session)
            return groups
        }, {})
        : null

    // Filter "Later Today" sessions (after the next lesson)
    const laterSessions = weekSessions.filter((s: InstructorEvent) =>
        isToday(parseISO(s.start_time)) &&
        nextLesson &&
        isAfter(parseISO(s.start_time), parseISO(nextLesson.start_time))
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Top Search / Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Good Morning, {instructorName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Here's what's happening today.</p>
                </div>
                <Button variant="outline" className="hidden md:flex rounded-full px-6 border-gray-300 hover:bg-gray-50 hover:text-gray-900" asChild>
                    <Link href="/instructor/schedule">View Calendar</Link>
                </Button>

                <StartLessonButton
                    canDriving={canDriving}
                    canTheory={canTheory}
                    nextDriving={data.nextDrivingSession}
                    nextTheory={data.nextTheorySession}
                />
            </div>

            {/* Next Lesson Card (Hero) */}
            {
                nextLesson ? (
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.4)] relative overflow-hidden group transition-all hover:shadow-[0_25px_60px_-12px_rgba(79,70,229,0.5)] border border-white/10">
                        {/* Background Glows */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-16 -mb-16 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-blue-100/90">
                                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                        <Clock className="h-3 w-3" />
                                        Up Next
                                    </div>
                                    <span className="text-sm font-medium opacity-80">
                                        {format(new Date(nextLesson.start_time), "EEEE, MMMM d")}
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white drop-shadow-sm">
                                        {nextLesson.type === 'driving'
                                            ? `Driving Lesson with ${nextLesson.studentName?.split(' ')[0]}`
                                            : nextLesson.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 text-blue-50 text-sm md:text-base font-medium">
                                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                                            <Timer className="h-4 w-4" />
                                            <span>{format(new Date(nextLesson.start_time), "h:mm a")} - {format(new Date(nextLesson.end_time), "h:mm a")}</span>
                                        </div>
                                        <span className="opacity-50">•</span>
                                        <span>{Math.round(nextLesson.duration_minutes)} Minutes</span>
                                        <span className="opacity-50">•</span>
                                        <span className="flex items-center gap-1.5">
                                            {nextLesson.type === 'driving' ? <MapPin className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                            {nextLesson.type === 'driving' ? 'Downtown Area' : 'Zoom / Online'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Student Contact Block (Only for Driving) */}
                            {nextLesson.type === 'driving' && nextLesson.meta?.profiles?.phone && (
                                <div className="flex items-center gap-5 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg min-w-[280px]">
                                    <Avatar className="h-14 w-14 border-2 border-white/30 shadow-md">
                                        <AvatarFallback className="bg-indigo-500 text-white font-bold text-lg">
                                            {nextLesson.studentName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-white mb-0.5">Student Contact</div>
                                        <div className="text-xs text-blue-100/80 mb-3">{nextLesson.meta.profiles.phone}</div>
                                        <Button size="sm" className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-full shadow-sm h-8 text-xs" asChild>
                                            <a href={`tel:${nextLesson.meta.profiles.phone}`}>
                                                <Phone className="h-3 w-3 mr-1.5" /> Call Student
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Class Info Block (Only for Theory) */}
                            {nextLesson.type === 'theory' && (
                                <div className="flex items-center gap-5 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg min-w-[280px]">
                                    <div className="h-14 w-14 rounded-full bg-purple-500/50 flex items-center justify-center border-2 border-white/30 shadow-md text-white">
                                        <BookOpen className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-white mb-0.5">Theory Class</div>
                                        <div className="text-xs text-blue-100/80 mb-3">Online Session</div>
                                        <Button size="sm" className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold rounded-full shadow-sm h-8 text-xs">
                                            <Video className="h-3 w-3 mr-1.5" /> Join Zoom
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                            <div className="h-full bg-white/40 w-[35%] rounded-r-full" /> {/* Placeholder progress */}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-4 shadow-sm">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Upcoming Lessons</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">You're all caught up for now! Take a break or check your schedule for upcoming days.</p>
                        <Button variant="outline" className="mt-6 rounded-full" asChild>
                            <Link href="/instructor/schedule">Check Schedule</Link>
                        </Button>
                    </div>
                )
            }

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Schedule */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <CardContent className="p-5 flex flex-col items-start">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Timer className="h-5 w-5" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 tracking-tight">{hoursToday}h</div>
                                <div className="text-xs text-gray-500 font-medium mt-1">Hours Scheduled Today</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <CardContent className="p-5 flex flex-col items-start">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    {canTheory ? <BookOpen className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                                </div>
                                <div className="text-3xl font-bold text-gray-900 tracking-tight">{todaySessionsCount}</div>
                                <div className="text-xs text-gray-500 font-medium mt-1">
                                    {canDriving && canTheory ? "Total Sessions" : canTheory ? "Classes Today" : "Driving Sessions"}
                                </div>
                            </CardContent>
                        </Card>
                        {canDriving && (
                            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <CardContent className="p-5 flex flex-col items-start">
                                    <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 tracking-tight">{activeStudents}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">Active Students</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Schedule Card with Tabs */}
                    <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-50 bg-gray-50/50 gap-4">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg font-bold text-gray-900">Schedule</CardTitle>
                                {/* Segmented Control */}
                                <div className="flex p-1 bg-gray-200/50 rounded-lg">
                                    {(['today', 'tomorrow', 'week'] as const).map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => setScheduleView(view)}
                                            className={`
                                                px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize
                                                ${scheduleView === view
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                                            `}
                                        >
                                            {view === 'week' ? 'This Week' : view}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-3 text-xs font-semibold" asChild>
                                <Link href="/instructor/schedule">View Full Calendar</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-50">
                                {filteredSessions.length > 0 ? (
                                    scheduleView === 'week' ? (
                                        // Grouped View for Week
                                        Object.entries(groupedSessions).map(([date, sessions]: [string, any]) => (
                                            <div key={date}>
                                                <div className="bg-gray-50/80 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
                                                    {format(parseISO(date), "EEEE, MMM d")}
                                                </div>
                                                {sessions.map((session: InstructorEvent) => (
                                                    <SessionRow key={session.id} session={session} />
                                                ))}
                                            </div>
                                        ))
                                    ) : (
                                        // Flat View for Today/Tomorrow
                                        filteredSessions.map((session: InstructorEvent) => (
                                            <SessionRow key={session.id} session={session} />
                                        ))
                                    )
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                                            <Calendar className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm">No lessons scheduled for {scheduleView}.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Later Today Mini-List */}
                    {laterSessions.length > 0 && scheduleView === 'today' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Later Today</h3>
                            <div className="space-y-2">
                                {laterSessions.map((session: InstructorEvent) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="font-medium text-gray-500 w-16 text-right">
                                                {format(new Date(session.start_time), "h:mm a")}
                                            </div>
                                            <div className="h-4 w-[1px] bg-gray-200" />
                                            <div className="font-semibold text-gray-900">
                                                {session.type === 'driving' ? session.studentName : session.title}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-[10px] border-0 ${session.type === 'driving' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                                }`}>
                                                {session.type === 'driving' ? 'Driving' : 'Class'}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                                                {session.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-6">
                    <Card className="rounded-2xl border-gray-100 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button variant="outline" className="h-12 justify-start px-4 gap-3 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-all group" asChild>
                                <Link href="/instructor/schedule">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>
                                    <span className="font-semibold">My Schedule</span>
                                </Link>
                            </Button>
                            {canDriving && (
                                <Button variant="outline" className="h-12 justify-start px-4 gap-3 rounded-xl border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 transition-all group" asChild>
                                    <Link href="/instructor/students">
                                        <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold">My Students</span>
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" className="h-12 justify-start px-4 gap-3 rounded-xl border-gray-200 hover:border-green-300 hover:bg-green-50/50 hover:text-green-700 transition-all group" asChild>
                                <Link href="/instructor/profile">
                                    <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                        <Timer className="h-4 w-4" />
                                    </div>
                                    <span className="font-semibold">Availability</span>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 rounded-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-orange-800 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Pending Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-orange-900/80">
                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                    <span>Submit progress report for <strong>Sarah Johnson</strong></span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-orange-900/80">
                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                    <span>Confirm availability for next week</span>
                                </li>
                            </ul>
                            <Button size="sm" variant="outline" className="w-full mt-4 bg-white border-orange-200 text-orange-700 hover:bg-orange-100 rounded-lg font-semibold">
                                View All Tasks
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}

function SessionRow({ session }: { session: InstructorEvent }) {
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-all group relative">
            {/* Status Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${session.status === 'completed' ? 'bg-green-500' :
                session.status === 'cancelled' ? 'bg-red-500' :
                    session.type === 'theory' ? 'bg-purple-500' :
                        'bg-blue-500'
                }`} />

            <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-100 text-gray-600 rounded-xl shrink-0 font-medium border border-gray-200">
                <span className="text-[10px] uppercase tracking-wider">{format(new Date(session.start_time), "MMM")}</span>
                <span className="text-lg font-bold text-gray-900 leading-none">{format(new Date(session.start_time), "d")}</span>
            </div>

            <div className="flex-1 min-w-0 ml-2">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 truncate text-sm md:text-base">
                        {session.type === 'driving' ? session.studentName : session.title}
                    </h4>
                    <div className="flex gap-1">
                        <Badge variant="secondary" className={`text-[10px] h-5 px-2 font-semibold rounded-md ${session.type === 'driving' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                            {session.type === 'driving' ? 'Driving' : 'Class'}
                        </Badge>
                        <Badge variant="secondary" className={`text-[10px] h-5 px-2 font-semibold rounded-md ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                            session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {session.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                    </div>
                    {session.type === 'theory' && (
                        <div className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-gray-400" />
                            Zoom
                        </div>
                    )}
                </div>
            </div>

            <Button size="icon" variant="ghost" className="text-gray-300 group-hover:text-blue-600 rounded-full" asChild>
                <Link href={`/instructor/schedule?session=${session.id}`}>
                    <ChevronRight className="h-5 w-5" />
                </Link>
            </Button>
        </div>
    )
}

function StartLessonButton({
    canDriving,
    canTheory,
    nextDriving,
    nextTheory
}: {
    canDriving: boolean,
    canTheory: boolean,
    nextDriving?: InstructorEvent,
    nextTheory?: InstructorEvent
}) {
    const [open, setOpen] = useState(false)
    const router = useRouter() // Ensure useRouter is imported from next/navigation

    const handleStart = () => {
        // 1. If Both, open dialog
        if (canDriving && canTheory) {
            setOpen(true)
            return
        }

        // 2. If Driving Only
        if (canDriving) {
            if (nextDriving) {
                router.push(`/instructor/driving/${nextDriving.id}`)
            } else {
                router.push('/instructor/driving')
            }
            return
        }

        // 3. If Theory Only
        if (canTheory) {
            if (nextTheory) {
                router.push(`/instructor/lessons/${nextTheory.meta.class_id}/sessions/${nextTheory.id}`)
            } else {
                router.push('/instructor/lessons')
            }
            return
        }

        // 4. Fallback
        toast.info("No upcoming sessions found.")
    }

    return (
        <>
            <Button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-full px-6 transition-all hover:scale-105"
            >
                Start Lesson Mode
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start Lesson Mode</DialogTitle>
                        <DialogDescription>
                            You have both driving and theory sessions. Which one would you like to start?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                        <Button
                            variant="outline"
                            className="h-auto py-4 justify-start px-4 gap-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                            onClick={() => {
                                if (nextDriving) {
                                    router.push(`/instructor/driving/${nextDriving.id}`)
                                } else {
                                    router.push('/instructor/driving')
                                }
                                setOpen(false)
                            }}
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Car className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">Driving Session</div>
                                <div className="text-xs text-gray-500">
                                    {nextDriving
                                        ? `Next: ${format(new Date(nextDriving.start_time), "h:mm a")} with ${nextDriving.studentName?.split(' ')[0]}`
                                        : "No upcoming driving sessions"}
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-4 justify-start px-4 gap-4 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                            onClick={() => {
                                if (nextTheory) {
                                    router.push(`/instructor/lessons/${nextTheory.meta.class_id}/sessions/${nextTheory.id}`)
                                } else {
                                    router.push('/instructor/lessons')
                                }
                                setOpen(false)
                            }}
                        >
                            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                <Video className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">Theory Class</div>
                                <div className="text-xs text-gray-500">
                                    {nextTheory
                                        ? `Next: ${format(new Date(nextTheory.start_time), "h:mm a")} - ${nextTheory.title}`
                                        : "No upcoming theory classes"}
                                </div>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
