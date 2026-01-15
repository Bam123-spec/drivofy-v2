'use client'

export const runtime = 'edge';

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSessionDetails, updateAttendance, saveLessonNote, toggleSessionStatus } from "@/app/actions/instructor"
import { Loader2, Calendar, Clock, Users, Video, CheckCircle2, XCircle, AlertCircle, ChevronLeft, MoreHorizontal, Save, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TheoryLessonModePage() {
    const params = useParams()
    const classId = params.classId as string
    const classDayId = params.classDayId as string
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [noteContent, setNoteContent] = useState("")
    const [savingNote, setSavingNote] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    useEffect(() => {
        loadData()
    }, [classDayId])

    const loadData = async () => {
        try {
            const result = await getSessionDetails(classDayId)
            setData(result)
            if (result.note) {
                setNoteContent(result.note.content)
            }
        } catch (error) {
            console.error("Failed to load session details", error)
            toast.error("Failed to load session details")
        } finally {
            setLoading(false)
        }
    }

    const handleAttendanceChange = async (studentId: string, status: string) => {
        // Optimistic update
        const updatedStudents = data.students.map((s: any) =>
            s.studentId === studentId ? { ...s, attendanceStatus: status } : s
        )
        setData({ ...data, students: updatedStudents })

        try {
            await updateAttendance(classDayId, studentId, status)
            toast.success("Attendance updated")
        } catch (error) {
            console.error("Failed to update attendance", error)
            toast.error("Failed to update attendance")
            loadData() // Revert on error
        }
    }

    const handleSaveNote = async () => {
        setSavingNote(true)
        try {
            await saveLessonNote(classDayId, noteContent)
            toast.success("Note saved")
        } catch (error) {
            console.error("Failed to save note", error)
            toast.error("Failed to save note")
        } finally {
            setSavingNote(false)
        }
    }

    const handleToggleStatus = async () => {
        setUpdatingStatus(true)
        const newStatus = data.session.status === 'in_progress' ? 'completed' : 'in_progress'
        try {
            await toggleSessionStatus(classDayId, newStatus)
            setData({ ...data, session: { ...data.session, status: newStatus } })
            toast.success(`Class ${newStatus === 'in_progress' ? 'started' : 'ended'}`)
        } catch (error) {
            console.error("Failed to toggle status", error)
            toast.error("Failed to update status")
        } finally {
            setUpdatingStatus(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    if (!data) return null

    const { session, course, students } = data
    const presentCount = students.filter((s: any) => s.attendanceStatus === 'present').length
    const absentCount = students.filter((s: any) => s.attendanceStatus === 'absent').length
    const lateCount = students.filter((s: any) => s.attendanceStatus === 'late').length

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href={`/instructor/lessons/${classId}`} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Course
                </Link>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                            <Badge variant={session.status === 'in_progress' ? 'default' : 'secondary'} className={`capitalize ${session.status === 'in_progress' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                                {session.status === 'in_progress' ? 'Live Now' : session.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {format(parseISO(session.start_datetime), "EEEE, MMMM d")}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {format(parseISO(session.start_datetime), "h:mm a")} – {format(parseISO(session.end_datetime), "h:mm a")}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {course.zoom_url && (
                            <Button variant="outline" className="rounded-full" asChild>
                                <a href={course.zoom_url} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-2" /> Open Zoom
                                </a>
                            </Button>
                        )}
                        <Button
                            onClick={handleToggleStatus}
                            disabled={updatingStatus}
                            className={`rounded-full min-w-[140px] ${session.status === 'in_progress'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none'
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
                                }`}
                        >
                            {updatingStatus ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : session.status === 'in_progress' ? (
                                <>
                                    <Square className="h-4 w-4 mr-2 fill-current" /> End Class
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2 fill-current" /> Start Class
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="attendance" className="space-y-6">
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto inline-flex">
                    <TabsTrigger value="attendance" className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                        Students & Attendance
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                        Lesson Notes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="space-y-6">
                    {/* Attendance Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-green-50 border-green-100 shadow-sm">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                                <div className="text-xs font-medium text-green-600 uppercase tracking-wider">Present</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 border-red-100 shadow-sm">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                                <div className="text-xs font-medium text-red-600 uppercase tracking-wider">Absent</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-orange-50 border-orange-100 shadow-sm">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-bold text-orange-700">{lateCount}</div>
                                <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Late</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-50 border-gray-100 shadow-sm">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl font-bold text-gray-700">{students.length}</div>
                                <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">Total</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Class Roster</CardTitle>
                            <CardDescription>Mark attendance for today's session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-gray-100">
                                {students.map((student: any) => (
                                    <div key={student.studentId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={student.avatarUrl} />
                                                <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Select
                                                defaultValue={student.attendanceStatus}
                                                onValueChange={(val) => handleAttendanceChange(student.studentId, val)}
                                            >
                                                <SelectTrigger className={`w-[140px] ${student.attendanceStatus === 'present' ? 'text-green-600 bg-green-50 border-green-200' :
                                                    student.attendanceStatus === 'absent' ? 'text-red-600 bg-red-50 border-red-200' :
                                                        student.attendanceStatus === 'late' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                                            student.attendanceStatus === 'excused' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                                                'text-gray-500'
                                                    }`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unmarked">Unmarked</SelectItem>
                                                    <SelectItem value="present">Present</SelectItem>
                                                    <SelectItem value="late">Late</SelectItem>
                                                    <SelectItem value="excused">Excused</SelectItem>
                                                    <SelectItem value="absent">Absent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson Notes</CardTitle>
                            <CardDescription>Record what was covered, homework assignments, or issues.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Enter notes for this lesson..."
                                className="min-h-[300px] resize-y"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSaveNote} disabled={savingNote} className="bg-purple-600 hover:bg-purple-700">
                                    {savingNote ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Notes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
