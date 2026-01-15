"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Users,
    BookOpen,
    Car,
    TrendingUp,
    Plus,
    Calendar,
    ArrowUpRight,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    DollarSign,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from "sonner"

const COLORS = ['#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        instructors: 0,
        activeClasses: 0,
        todaySessions: 0,
        totalStudents: 0
    })
    const [todaysSessions, setTodaysSessions] = useState<any[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [distributionData, setDistributionData] = useState<any[]>([])
    const [growthData, setGrowthData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // 1. Instructors
            const { count: instructorCount } = await supabase
                .from('instructors')
                .select('*', { count: 'exact', head: true })

            // 2. Active Classes
            const { count: classCount } = await supabase
                .from('classes')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')

            // 3. Today's Sessions
            const today = new Date().toISOString().split('T')[0]
            const { count: sessionCount, data: sessions } = await supabase
                .from('driving_sessions')
                .select('*, profiles:student_id(full_name), instructors(full_name)')
                .gte('start_time', `${today}T00:00:00`)
                .lte('start_time', `${today}T23:59:59`)
                .order('start_time', { ascending: true })
                .limit(5)

            // 4. Total Students (Profiles with role 'student') - Approximation via enrollments for now or separate query
            // Using enrollments to get recent activity and stats
            const { data: allEnrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('*, profiles:student_id(full_name), classes(name)')
                .order('enrollment_date', { ascending: false })

            if (enrollError) throw enrollError

            // Process Enrollments for Stats & Charts
            const totalStudents = new Set(allEnrollments?.map(e => e.student_id)).size
            const recent = allEnrollments?.slice(0, 5) || []

            // Distribution Data (Status)
            const statusCounts: any = {}
            allEnrollments?.forEach(e => {
                const status = e.status || 'active'
                statusCounts[status] = (statusCounts[status] || 0) + 1
            })
            const distData = Object.keys(statusCounts).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: statusCounts[key]
            }))

            // Growth Data (Enrollments by Month - Last 6 Months)
            const months: any = {}
            const now = new Date()
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthName = d.toLocaleString('default', { month: 'short' })
                months[monthName] = 0
            }

            allEnrollments?.forEach(e => {
                const d = new Date(e.enrollment_date)
                // Only count if within last 6 months roughly
                if ((now.getTime() - d.getTime()) < 180 * 24 * 60 * 60 * 1000) {
                    const monthName = d.toLocaleString('default', { month: 'short' })
                    if (months[monthName] !== undefined) {
                        months[monthName]++
                    }
                }
            })

            const growth = Object.keys(months).map(key => ({
                name: key,
                students: months[key]
            }))

            setStats({
                instructors: instructorCount || 0,
                activeClasses: classCount || 0,
                todaySessions: sessionCount || 0,
                totalStudents: totalStudents
            })
            setTodaysSessions(sessions || [])
            setRecentActivity(recent)
            setDistributionData(distData)
            setGrowthData(growth)

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Overview of your driving school operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex bg-white hover:bg-gray-50">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 7 Days
                    </Button>
                    <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow bg-gradient-to-r from-primary to-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                    description="Active learners"
                />
                <KpiCard
                    title="Active Instructors"
                    value={stats.instructors}
                    icon={Car}
                    trend="+2"
                    trendUp={true}
                    color="purple"
                    description="Currently teaching"
                />
                <KpiCard
                    title="Active Classes"
                    value={stats.activeClasses}
                    icon={BookOpen}
                    trend="Stable"
                    trendUp={true}
                    color="indigo"
                    description="Open for enrollment"
                />
                <KpiCard
                    title="Sessions Today"
                    value={stats.todaySessions}
                    icon={Clock}
                    trend="On Track"
                    trendUp={true}
                    color="green"
                    description="Scheduled drives"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <Card className="lg:col-span-2 border-none shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Enrollment Growth</CardTitle>
                        <CardDescription>New student enrollments over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#fff',
                                            color: '#1f2937'
                                        }}
                                    />
                                    <Bar
                                        dataKey="students"
                                        fill="var(--primary)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution Chart */}
                <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Student Status</CardTitle>
                        <CardDescription>Current enrollment distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-3xl font-bold text-gray-900">{stats.totalStudents}</span>
                                <span className="text-xs text-gray-500 uppercase font-medium">Students</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Schedule & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Today's Schedule</CardTitle>
                                <CardDescription>Upcoming driving sessions for today.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View All</Button>
                        </CardHeader>
                        <CardContent>
                            {todaysSessions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-gray-100">
                                            <TableHead>Time</TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todaysSessions.map((session) => (
                                            <TableRow key={session.id} className="group hover:bg-gray-50/50 transition-colors border-gray-100">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2 text-gray-900">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 border border-gray-100">
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                                {session.profiles?.full_name?.charAt(0) || "S"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-700">{session.profiles?.full_name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {session.instructors?.full_name || "Unassigned"}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={session.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
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
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest system events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-start gap-4 relative">
                                            {/* Timeline Line */}
                                            {i !== recentActivity.length - 1 && (
                                                <div className="absolute left-[18px] top-10 bottom-[-24px] w-[2px] bg-gray-100"></div>
                                            )}
                                            <div className="h-9 w-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0 z-10 ring-4 ring-white">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    New Enrollment
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    <span className="font-medium text-gray-700">{activity.profiles?.full_name}</span> enrolled in <span className="font-medium text-gray-700">{activity.classes?.name}</span>
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(activity.enrollment_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-none shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-24 w-24 bg-primary/20 rounded-full blur-xl"></div>
                        <CardHeader>
                            <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 relative z-10">
                            <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm transition-all">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Class
                            </Button>
                            <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm transition-all">
                                <Users className="mr-2 h-4 w-4" />
                                Add Instructor
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// Helper Components

function KpiCard({ title, value, icon: Icon, trend, trendUp, color, description }: any) {
    const colorStyles: any = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-emerald-50 text-emerald-600",
    }

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colorStyles[color] || colorStyles.blue} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${trendUp ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                        {trend}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</h3>
                    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        scheduled: "bg-sky-50 text-sky-700 border-sky-200",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cancelled: "bg-rose-50 text-rose-700 border-rose-200",
        active: "bg-violet-50 text-violet-700 border-violet-200",
        dropped: "bg-gray-100 text-gray-700 border-gray-200"
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
        <Badge variant="outline" className={`${styles[status] || styles.scheduled} pl-1.5 pr-2.5 py-0.5 border shadow-sm`}>
            <Icon className="h-3 w-3 mr-1.5" />
            <span className="capitalize">{status}</span>
        </Badge>
    )
}
