"use client"

import { useEffect, useState } from "react"
import { getDashboardStats } from "@/app/actions/adminDashboard"
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
        instructors: { value: 0, trend: 0 },
        activeClasses: { value: 0, trend: 0 },
        todaySessions: { value: 0, trend: 0 },
        totalStudents: { value: 0, trend: 0 },
        revenue: { value: 0, trend: 0 }
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
            const data = await getDashboardStats()

            if (data) {
                setStats(data.stats)
                setTodaysSessions(data.todaysSessions)
                setRecentActivity(data.recentActivity)
                setDistributionData(data.distributionData)
                setGrowthData(data.growthData)
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
                    <p className="text-slate-500 font-medium text-base mt-1">Overview of your driving school operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex bg-white hover:bg-slate-50 h-10 px-4 rounded-xl font-semibold border-slate-200">
                        <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                        Last 7 Days
                    </Button>
                    <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <KpiCard
                    title="Total Revenue"
                    value={`$${stats.revenue.value.toLocaleString()}`}
                    icon={DollarSign}
                    trend={`${stats.revenue.trend > 0 ? '+' : ''}${stats.revenue.trend}%`}
                    trendUp={stats.revenue.trend >= 0}
                    color="green"
                    description="Total earnings"
                />
                <KpiCard
                    title="Total Students"
                    value={stats.totalStudents.value}
                    icon={Users}
                    trend={`${stats.totalStudents.trend > 0 ? '+' : ''}${stats.totalStudents.trend}%`}
                    trendUp={stats.totalStudents.trend >= 0}
                    color="blue"
                    description="Active learners"
                />
                <KpiCard
                    title="Active Instructors"
                    value={stats.instructors.value}
                    icon={Car}
                    trend={`${stats.instructors.trend > 0 ? '+' : ''}${stats.instructors.trend}%`}
                    trendUp={stats.instructors.trend >= 0}
                    color="purple"
                    description="Currently teaching"
                />
                <KpiCard
                    title="Active Classes"
                    value={stats.activeClasses.value}
                    icon={BookOpen}
                    trend={`${stats.activeClasses.trend > 0 ? '+' : ''}${stats.activeClasses.trend}%`}
                    trendUp={stats.activeClasses.trend >= 0}
                    color="indigo"
                    description="Open for enrollment"
                />
                <KpiCard
                    title="Sessions Today"
                    value={stats.todaySessions.value}
                    icon={Clock}
                    trend="On Track"
                    trendUp={true}
                    color="amber"
                    description="Scheduled drives"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-white p-6 border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-900">Enrollment Growth</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">New student enrollments over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                            backgroundColor: '#fff',
                                            color: '#1e293b'
                                        }}
                                    />
                                    <Bar
                                        dataKey="students"
                                        fill="#2563eb"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution Chart */}
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-white p-6 border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-900">Student Status</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Current enrollment distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-2xl font-bold text-slate-900">{stats.totalStudents.value}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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

// Helper Components

function KpiCard({ title, value, icon: Icon, trend, trendUp, color, description }: any) {
    const colorStyles: any = {
        blue: "bg-blue-50 text-blue-600",
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-emerald-50 text-emerald-600",
        purple: "bg-indigo-50 text-indigo-600", // Standardizing
        amber: "bg-amber-50 text-amber-600",
    }

    return (
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.blue}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                        {trend}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{title}</p>
                    {description && <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">{description}</p>}
                </div>
            </CardContent>
        </Card>
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
