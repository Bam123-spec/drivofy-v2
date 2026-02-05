"use client"

import { useEffect, useState } from "react"
import { getDashboardStats } from "@/app/actions/adminDashboard"
import {
    Loader2,
    Users,
    Plus,
    Calendar,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function AdminDashboard() {
    const [todaysSessions, setTodaysSessions] = useState<any[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const data = await getDashboardStats()

            if (data) {
                setTodaysSessions(data.todaysSessions)
                setRecentActivity(data.recentActivity)
            } else {
                toast.error("Failed to load dashboard data")
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium text-base mt-1">Operations overview and today’s schedule.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Schedule & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-white p-6 border-b border-slate-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900">Today's Schedule</CardTitle>
                                <CardDescription className="text-slate-500 font-medium">Upcoming driving sessions for today.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider">View All</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {todaysSessions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                                            <TableHead className="pl-6 font-semibold text-slate-900 uppercase text-[10px] tracking-wider py-4">Time</TableHead>
                                            <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Student</TableHead>
                                            <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Instructor</TableHead>
                                            <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Status</TableHead>
                                            <TableHead className="pr-6 text-right font-semibold text-slate-900 uppercase text-[10px] tracking-wider"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todaysSessions.map((session) => (
                                            <TableRow key={session.id} className="group hover:bg-slate-50/30 transition-colors border-slate-50">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 border border-slate-100 shadow-sm">
                                                            <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-bold">
                                                                {session.student?.full_name?.charAt(0) || "S"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-semibold text-slate-700 text-sm whitespace-nowrap">{session.student?.full_name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {session.instructor?.full_name || "Unassigned"}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={session.status} />
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Calendar className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">No sessions today</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                                        There are no driving sessions scheduled for today.
                                    </p>
                                    <Button variant="outline">Schedule Session</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Recent Activity & Actions */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-white p-6 border-b border-slate-50">
                            <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Latest system events</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-start gap-4 relative">
                                            {/* Timeline Line */}
                                            {i !== recentActivity.length - 1 && (
                                                <div className="absolute left-[18px] top-10 bottom-[-24px] w-[1px] bg-slate-100"></div>
                                            )}
                                            <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 z-10 ring-4 ring-white shadow-sm">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-900">
                                                    New Enrollment
                                                </p>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    <span className="font-semibold text-slate-700">{activity.student?.full_name}</span> enrolled in <span className="font-semibold text-slate-700">{activity.class?.name}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                                                    {new Date(activity.enrolled_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden relative group">
                        <CardHeader className="bg-white p-6 border-b border-slate-50">
                            <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            <Button variant="outline" className="w-full justify-start h-11 px-4 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all group/btn">
                                <Plus className="mr-3 h-4 w-4 text-blue-500 group-hover/btn:scale-110 transition-transform" />
                                Create New Class
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-11 px-4 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all group/btn">
                                <Users className="mr-3 h-4 w-4 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                                Add Instructor
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        scheduled: "bg-blue-50 text-blue-700 border-blue-100",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
        active: "bg-indigo-50 text-indigo-700 border-indigo-100",
        dropped: "bg-rose-50 text-rose-700 border-rose-100"
    }

    const icons: any = {
        scheduled: Clock,
        completed: CheckCircle2,
        cancelled: XCircle,
        active: AlertCircle,
        dropped: XCircle
    }

    const Icon = icons[status] || Clock

    return (
        <Badge variant="secondary" className={`${styles[status] || styles.scheduled} px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide border-0 flex items-center w-fit`}>
            <Icon className="h-3 w-3 mr-1.5" />
            {status}
        </Badge>
    )
}
