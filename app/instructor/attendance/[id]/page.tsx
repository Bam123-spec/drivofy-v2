"use client"

export const runtime = 'edge';

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

export default function InstructorAttendanceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [classDay, setClassDay] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Class Day Info
            const { data: dayData, error: dayError } = await supabase
                .from('class_days')
                .select(`
                    *,
                    classes (
                        id,
                        name,
                        instructor_id
                    )
                `)
                .eq('id', params.id)
                .single()

            if (dayError) throw dayError
            setClassDay(dayData)

            // 2. Fetch Enrolled Students
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select(`
                    student_id,
                    profiles:student_id (
                        id,
                        full_name,
                        email,
                        phone
                    )
                `)
                .eq('class_id', dayData.class_id)
                .eq('status', 'active')
                .order('student_id')

            if (enrollError) throw enrollError

            // 3. Fetch Existing Attendance
            const { data: attendance, error: attError } = await supabase
                .from('attendance_records')
                .select('student_id, status')
                .eq('class_day_id', params.id)

            if (attError) throw attError

            const attMap: Record<string, string> = {}
            attendance?.forEach(r => {
                attMap[r.student_id] = r.status
            })
            setAttendanceMap(attMap)

            setStudents(enrollments?.map(e => e.profiles) || [])

        } catch (error) {
            console.error("Error fetching detail:", error)
            toast.error("Failed to load attendance details")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (studentId: string, status: string) => {
        setSaving(prev => ({ ...prev, [studentId]: true }))
        setAttendanceMap(prev => ({ ...prev, [studentId]: status }))

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // Get instructor ID
            const { data: instructor } = await supabase
                .from('instructors')
                .select('id')
                .eq('profile_id', user?.id)
                .single()

            const { error } = await supabase
                .from('attendance_records')
                .upsert({
                    class_day_id: params.id,
                    student_id: studentId,
                    status: status,
                    marked_by_instructor_id: instructor?.id,
                    marked_at: new Date().toISOString()
                }, { onConflict: 'class_day_id, student_id' })

            if (error) throw error
        } catch (error) {
            console.error("Error saving attendance:", error)
            toast.error("Failed to save attendance")
            fetchData()
        } finally {
            setSaving(prev => ({ ...prev, [studentId]: false }))
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!classDay) return <div>Class day not found</div>

    const markedCount = Object.keys(attendanceMap).length
    const totalStudents = students.length
    const progress = totalStudents > 0 ? (markedCount / totalStudents) * 100 : 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <Link href="/instructor/attendance" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Schedule
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{classDay.classes?.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(classDay.date), "EEEE, MMMM do, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(classDay.start_datetime), "h:mm a")} - {format(new Date(classDay.end_datetime), "h:mm a")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
                        <div className="text-sm font-medium text-gray-500 mb-1">Attendance Progress</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-gray-900">{markedCount}</span>
                            <span className="text-gray-400 mb-1">/ {totalStudents} marked</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Student Name</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <TableRow key={student.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-gray-100">
                                                <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">
                                                    {student.full_name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-gray-900">{student.full_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-500">
                                            <div>{student.email}</div>
                                            <div className="text-xs">{student.phone}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={attendanceMap[student.id] || "unmarked"}
                                                onValueChange={(val) => handleStatusChange(student.id, val)}
                                            >
                                                <SelectTrigger className={`w-[140px] border-transparent ring-1 ring-gray-200 ${attendanceMap[student.id] === 'present' ? 'bg-green-50 text-green-700 ring-green-200' :
                                                    attendanceMap[student.id] === 'absent' ? 'bg-red-50 text-red-700 ring-red-200' :
                                                        attendanceMap[student.id] === 'late' ? 'bg-yellow-50 text-yellow-700 ring-yellow-200' :
                                                            attendanceMap[student.id] === 'excused' ? 'bg-blue-50 text-blue-700 ring-blue-200' :
                                                                'bg-gray-50 text-gray-500'
                                                    }`}>
                                                    <SelectValue placeholder="Mark Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unmarked" disabled>Not Marked</SelectItem>
                                                    <SelectItem value="present">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" /> Present
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="absent">
                                                        <div className="flex items-center gap-2">
                                                            <XCircle className="h-4 w-4 text-red-600" /> Absent
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="late">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-yellow-600" /> Late
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="excused">
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="h-4 w-4 text-blue-600" /> Excused
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {saving[student.id] && (
                                                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-gray-500">
                                    No students enrolled in this class.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
