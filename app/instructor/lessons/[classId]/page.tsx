'use client'

export const runtime = 'edge';

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCourseDetails, updateBatchAttendance, updateStudentGrade, updateStudentCertification, removeStudentFromCourse } from "@/app/actions/instructor"
import { Loader2, Calendar, Users, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, Save, Trash2, Award, GraduationCap, MoreHorizontal, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

export default function CourseControlCenterPage() {
    const params = useParams()
    const classId = params.classId as string
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<any>(null)
    const [attendanceChanges, setAttendanceChanges] = useState<Map<string, string>>(new Map())
    const [savingAttendance, setSavingAttendance] = useState(false)

    useEffect(() => {
        loadData()
    }, [classId])

    const loadData = async () => {
        try {
            const result = await getCourseDetails(classId)

            if (!result) {
                setError({ code: "NOT_FOUND", message: "Course not found or unauthorized (Null result)" })
                return
            }

            if ('error' in result) {
                setError(result)
                return
            }

            setData(result)
        } catch (err: any) {
            console.error("Failed to load course details", err)
            setError({ code: "EXCEPTION", message: err.message || "Unknown error occurred" })
        } finally {
            setLoading(false)
        }
    }

    const handleAttendanceChange = (studentId: string, sessionId: string, status: string) => {
        const key = `${studentId}-${sessionId}`
        setAttendanceChanges(prev => new Map(prev).set(key, status))
    }

    const saveAttendance = async () => {
        if (attendanceChanges.size === 0) return
        setSavingAttendance(true)

        const updates: { classDayId: string, studentId: string, status: string }[] = []
        attendanceChanges.forEach((status, key) => {
            const [studentId, sessionId] = key.split('-')
            updates.push({ classDayId: sessionId, studentId, status })
        })

        try {
            await updateBatchAttendance(updates)
            toast.success("Attendance updated")
            setAttendanceChanges(new Map())
            loadData()
        } catch (error) {
            console.error("Failed to save attendance", error)
            toast.error("Failed to save attendance")
        } finally {
            setSavingAttendance(false)
        }
    }

    const handleUpdateGrade = async (enrollmentId: string, grade: string) => {
        try {
            await updateStudentGrade(enrollmentId, grade)
            toast.success("Grade updated")
            loadData()
        } catch (error) {
            toast.error("Failed to update grade")
        }
    }

    const handleUpdateCertification = async (enrollmentId: string, status: string) => {
        try {
            await updateStudentCertification(enrollmentId, status)
            toast.success("Certification status updated")
            loadData()
        } catch (error) {
            toast.error("Failed to update certification")
        }
    }

    const handleRemoveStudent = async (enrollmentId: string) => {
        if (!confirm("Are you sure you want to remove this student from the course?")) return
        try {
            await removeStudentFromCourse(enrollmentId)
            toast.success("Student removed")
            loadData()
        } catch (error) {
            toast.error("Failed to remove student")
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 p-4">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Unable to Load Course</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        We encountered an issue while trying to fetch the course details.
                    </p>
                </div>

                <Card className="w-full max-w-lg border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Error Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-red-600 font-mono">
                        <div><span className="font-bold">Code:</span> {error?.code || "UNKNOWN"}</div>
                        <div><span className="font-bold">Message:</span> {error?.message || "No message provided"}</div>
                        {error?.debug && (
                            <div className="mt-2 p-2 bg-white/50 rounded border border-red-100 overflow-auto max-h-40">
                                <pre className="text-xs">{JSON.stringify(error.debug, null, 2)}</pre>
                            </div>
                        )}
                        {error?.details && (
                            <div className="mt-2 p-2 bg-white/50 rounded border border-red-100 overflow-auto max-h-40">
                                <pre className="text-xs">{JSON.stringify(error.details, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button asChild variant="outline">
                    <Link href="/instructor/lessons">Back to Courses</Link>
                </Button>
            </div>
        )
    }

    const { course, sessions, students, attendanceRecords } = data

    // Helper to get current status
    const getStatus = (studentId: string, sessionId: string) => {
        if (attendanceChanges.has(`${studentId}-${sessionId}`)) {
            return attendanceChanges.get(`${studentId}-${sessionId}`)
        }
        const record = attendanceRecords.find((r: any) => r.student_id === studentId && r.class_day_id === sessionId)
        return record?.status || 'unmarked'
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/instructor/lessons" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Courses
                </Link>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {format(parseISO(course.start_date), "MMM d")} - {format(parseISO(course.end_date), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {course.time_slot || "Scheduled"}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="text-2xl font-bold text-purple-700">{sessions.length}</div>
                            <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">Sessions</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="text-2xl font-bold text-blue-700">{students.length}</div>
                            <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Students</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Grid */}
            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b border-gray-100">
                    <div>
                        <CardTitle>Attendance Grid</CardTitle>
                        <CardDescription>Track attendance for all sessions.</CardDescription>
                    </div>
                    {attendanceChanges.size > 0 && (
                        <Button onClick={saveAttendance} disabled={savingAttendance} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20">
                            {savingAttendance ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes ({attendanceChanges.size})
                        </Button>
                    )}
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10 w-[250px]">Student</th>
                                {sessions.map((session: any) => (
                                    <th key={session.id} className="px-4 py-3 min-w-[120px] text-center">
                                        <div className="font-semibold text-gray-900">{format(parseISO(session.date), "MMM d")}</div>
                                        <div className="text-[10px] text-gray-500 font-normal">{format(parseISO(session.date), "EEE")}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {students.map((student: any) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 border-r border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-gray-200">
                                                <AvatarImage src={student.avatar_url} />
                                                <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                                    {student.full_name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium text-gray-900 truncate max-w-[150px]" title={student.full_name}>
                                                {student.full_name}
                                            </div>
                                        </div>
                                    </td>
                                    {sessions.map((session: any) => {
                                        const status = getStatus(student.id, session.id)
                                        return (
                                            <td key={session.id} className="px-4 py-3 text-center">
                                                <Select
                                                    value={status}
                                                    onValueChange={(val) => handleAttendanceChange(student.id, session.id, val)}
                                                >
                                                    <SelectTrigger className={`
                                                        h-8 w-[100px] mx-auto border-transparent focus:ring-0 focus:ring-offset-0
                                                        ${status === 'present' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                                                            status === 'absent' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                                                                status === 'late' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' :
                                                                    status === 'excused' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                                                        'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                                                    `}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unmarked">Unmarked</SelectItem>
                                                        <SelectItem value="present">Present</SelectItem>
                                                        <SelectItem value="absent">Absent</SelectItem>
                                                        <SelectItem value="late">Late</SelectItem>
                                                        <SelectItem value="excused">Excused</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Students Panel */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>Manage grades and certification status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {students.map((student: any) => (
                            <div key={student.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                                <div className="flex items-center gap-4 min-w-[250px]">
                                    <Avatar className="h-10 w-10 border border-gray-200">
                                        <AvatarImage src={student.avatar_url} />
                                        <AvatarFallback className="bg-purple-100 text-purple-600">
                                            {student.full_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-gray-900">{student.full_name}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    {/* Grade Input */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Grade:</span>
                                        <Input
                                            className="h-9 w-20 bg-white"
                                            defaultValue={student.grade || ""}
                                            onBlur={(e) => handleUpdateGrade(student.enrollmentId, e.target.value)}
                                            placeholder="-"
                                        />
                                    </div>

                                    {/* Certification Status */}
                                    <Select
                                        defaultValue={student.certification_status || "pending"}
                                        onValueChange={(val) => handleUpdateCertification(student.enrollmentId, val)}
                                    >
                                        <SelectTrigger className={`w-[140px] h-9 ${student.certification_status === 'certified' ? 'bg-green-50 text-green-700 border-green-200' :
                                            student.certification_status === 'honors' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-white'
                                            }`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="certified">Certified</SelectItem>
                                            <SelectItem value="honors">Honors</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/instructor/students/${student.id}`} className="flex items-center cursor-pointer">
                                                    <User className="h-4 w-4 mr-2" /> View Profile
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleRemoveStudent(student.enrollmentId)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove from Course
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                        {students.length === 0 && (
                            <div className="text-center py-8 text-gray-500 italic">No students enrolled in this course.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
