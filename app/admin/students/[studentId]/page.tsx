"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { getAdminStudentDetails } from "@/app/actions/adminStudents"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ChevronLeft, Mail, Phone, BookOpen, Car, Clock3, CalendarDays } from "lucide-react"
import { toast } from "sonner"

type StudentType = "registered" | "lead"

function formatDate(value?: string | null) {
    if (!value) return "N/A"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "N/A"
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}

function enrollmentLabel(enrollment: any) {
    if (enrollment?.classes?.name) return enrollment.classes.name
    const serviceType = enrollment?.customer_details?.service_type
    if (serviceType === "TEN_HOUR_PACKAGE") return "10 Hour Package"
    if (serviceType === "BTW_PACKAGE") return "Behind-the-Wheel Package"
    if (serviceType === "DRIVING_PRACTICE_PACKAGE") return "Driving Practice Package"
    return "Driving Service"
}

export default function AdminStudentDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const studentId = params.studentId as string
    const studentType = (searchParams.get("type") as StudentType) || "registered"

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const result = await getAdminStudentDetails(studentId, studentType)
                setData(result)
            } catch (error) {
                console.error(error)
                toast.error("Failed to load student details")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [studentId, studentType])

    const stats = useMemo(() => {
        if (!data) return null

        const enrollments = data.enrollments || []
        const drivingSessions = data.drivingSessions || []
        const attendance = data.attendance || []
        const btwAllocations = data.btwAllocations || []

        const purchasedCourses = enrollments.filter((e: any) => Boolean(e.class_id || e.classes?.id))
        const purchasedPackages = enrollments.filter((e: any) => !e.class_id && !e.classes?.id)

        const completedDriving = drivingSessions.filter((s: any) => s.status === "completed").length
        const upcomingDriving = drivingSessions.filter((s: any) => {
            const start = new Date(s.start_time)
            return start > new Date() && (s.status === "scheduled" || s.status === "booked")
        }).length

        const attendancePresent = attendance.filter((a: any) => a.status === "present").length
        const attendanceRate = attendance.length > 0
            ? Math.round((attendancePresent / attendance.length) * 100)
            : 0

        const tenHourTotal = data.student?.ten_hour_sessions_total || 0
        const tenHourUsed = data.student?.ten_hour_sessions_used || 0
        const tenHourRemaining = Math.max(tenHourTotal - tenHourUsed, 0)
        const tenHourProgress = tenHourTotal > 0 ? Math.round((tenHourUsed / tenHourTotal) * 100) : 0

        const btwTotal = btwAllocations.reduce((sum: number, row: any) => sum + (row.total_included_sessions || 0), 0)
        const btwUsed = btwAllocations.reduce((sum: number, row: any) => sum + (row.sessions_used || 0), 0)
        const btwRemaining = Math.max(btwTotal - btwUsed, 0)
        const btwProgress = btwTotal > 0 ? Math.round((btwUsed / btwTotal) * 100) : 0

        return {
            purchasedCourses,
            purchasedPackages,
            completedDriving,
            upcomingDriving,
            attendancePresent,
            attendanceRate,
            tenHourTotal,
            tenHourUsed,
            tenHourRemaining,
            tenHourProgress,
            btwTotal,
            btwUsed,
            btwRemaining,
            btwProgress,
        }
    }, [data])

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!data || !stats) {
        return (
            <div className="p-6">
                <Link href="/admin/students" className="text-sm text-slate-500 hover:text-slate-900">
                    <span className="inline-flex items-center gap-1"><ChevronLeft className="h-4 w-4" /> Back to Students</span>
                </Link>
                <div className="mt-8 text-slate-500">No student data found.</div>
            </div>
        )
    }

    const { student, enrollments, drivingSessions, attendance } = data

    return (
        <div className="space-y-6 py-4">
            <div className="px-1">
                <Link href="/admin/students" className="text-sm text-slate-500 hover:text-slate-900">
                    <span className="inline-flex items-center gap-1"><ChevronLeft className="h-4 w-4" /> Back to Students</span>
                </Link>
            </div>

            <Card className="border border-slate-200 rounded-2xl shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border border-slate-200">
                                <AvatarImage src={student.avatar_url || undefined} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                    {student.full_name?.[0] || "S"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-900">{student.full_name || "Student"}</h1>
                                    <Badge variant="secondary" className={studentType === "lead" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}>
                                        {studentType === "lead" ? "Lead" : "Student"}
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <div className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {student.email || "No email"}</div>
                                    <div className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {student.phone || "No phone"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
                            <div className="rounded-xl border border-slate-200 p-3">
                                <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Courses</div>
                                <div className="text-xl font-bold text-slate-900">{stats.purchasedCourses.length}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-3">
                                <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Packages</div>
                                <div className="text-xl font-bold text-slate-900">{stats.purchasedPackages.length}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-3">
                                <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Driving Done</div>
                                <div className="text-xl font-bold text-slate-900">{stats.completedDriving}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-3">
                                <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Upcoming</div>
                                <div className="text-xl font-bold text-slate-900">{stats.upcomingDriving}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="progress" className="space-y-4">
                <TabsList className="bg-white border border-slate-200 rounded-xl">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="purchases">Purchases</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="progress" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border border-slate-200 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-base">10 Hour Package</CardTitle>
                                <CardDescription>{stats.tenHourUsed} used of {stats.tenHourTotal} sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Progress value={stats.tenHourProgress} className="h-2" />
                                <div className="text-sm text-slate-600">{stats.tenHourRemaining} sessions remaining</div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-base">BTW Allocation</CardTitle>
                                <CardDescription>{stats.btwUsed} used of {stats.btwTotal} sessions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Progress value={stats.btwProgress} className="h-2" />
                                <div className="text-sm text-slate-600">{stats.btwRemaining} sessions remaining</div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 rounded-2xl md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Theory Attendance</CardTitle>
                                <CardDescription>{stats.attendancePresent} present out of {attendance.length} records</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Progress value={stats.attendanceRate} className="h-2" />
                                <div className="text-sm text-slate-600">{stats.attendanceRate}% attendance rate</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="purchases" className="space-y-4">
                    <Card className="border border-slate-200 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-base">Purchased Courses & Packages</CardTitle>
                            <CardDescription>Everything linked to this student email/profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-slate-100">
                            {enrollments.length === 0 && (
                                <div className="py-8 text-sm text-slate-500">No purchases found yet.</div>
                            )}
                            {enrollments.map((enrollment: any) => (
                                <div key={enrollment.id} className="py-4 flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-900 inline-flex items-center gap-2">
                                            {enrollment.class_id ? <BookOpen className="h-4 w-4 text-indigo-500" /> : <Car className="h-4 w-4 text-blue-500" />}
                                            {enrollmentLabel(enrollment)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Enrolled: {formatDate(enrollment.enrolled_at)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Payment: {enrollment.payment_status || "unknown"}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {enrollment.status || "active"}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                    <Card className="border border-slate-200 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-base">Driving Sessions</CardTitle>
                            <CardDescription>Scheduled and completed driving sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-slate-100">
                            {drivingSessions.length === 0 && (
                                <div className="py-8 text-sm text-slate-500">No driving sessions yet.</div>
                            )}
                            {drivingSessions.map((session: any) => (
                                <div key={session.id} className="py-4 flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-900 inline-flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-slate-500" />
                                            {formatDate(session.start_time)}
                                        </div>
                                        <div className="text-xs text-slate-500 inline-flex items-center gap-2">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {session.duration_minutes || 0} min
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Instructor: {session.instructors?.full_name || "Unassigned"}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{session.status || "scheduled"}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
