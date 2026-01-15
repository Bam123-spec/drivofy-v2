'use client'

export const runtime = 'edge';

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getStudentDetails, saveStudentNote } from "@/app/actions/instructor"
import { Loader2, Calendar, Clock, Mail, Phone, CheckCircle2, XCircle, AlertCircle, ChevronLeft, GraduationCap, Car, Save, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

export default function StudentDetailPage() {
    const params = useParams()
    const studentId = params.studentId as string
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [noteContent, setNoteContent] = useState("")
    const [savingNote, setSavingNote] = useState(false)

    useEffect(() => {
        loadData()
    }, [studentId])

    const loadData = async () => {
        try {
            const result = await getStudentDetails(studentId)
            setData(result)
        } catch (error) {
            console.error("Failed to load student details", error)
            toast.error("Failed to load student details")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNote = async () => {
        if (!noteContent.trim()) return
        setSavingNote(true)
        try {
            await saveStudentNote(studentId, noteContent)
            toast.success("Note saved")
            setNoteContent("")
            loadData() // Reload to show new note
        } catch (error) {
            console.error("Failed to save note", error)
            toast.error("Failed to save note")
        } finally {
            setSavingNote(false)
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

    const { student, enrollments, drivingSessions, attendance, notes } = data

    // Calculate Stats
    const totalDrivingHours = drivingSessions.filter((s: any) => s.status === 'completed')
        .reduce((acc: number, s: any) => {
            const duration = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000
            return acc + duration
        }, 0)

    const attendedTheorySessions = attendance.filter((a: any) => a.status === 'present').length
    const totalTheorySessions = attendance.length // Or total required if we knew it

    // Combine sessions for list
    const allSessions = [
        ...drivingSessions.map((s: any) => ({ ...s, type: 'Driving', date: s.start_time })),
        ...attendance.map((a: any) => ({ ...a, type: 'Theory', date: a.class_days.start_datetime, status: a.status === 'present' ? 'completed' : a.status }))
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const upcomingSessions = allSessions.filter((s: any) => new Date(s.date) > new Date()).reverse()
    const pastSessions = allSessions.filter((s: any) => new Date(s.date) <= new Date())

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/instructor/students" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Students
                </Link>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                                {student.full_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
                            <div className="flex flex-col gap-1 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" /> {student.email}
                                </div>
                                {student.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5" /> {student.phone}
                                    </div>
                                )}
                            </div>
                            <div className="pt-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active Student</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{Math.round(totalDrivingHours * 10) / 10}</div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Driving Hours</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{attendedTheorySessions}</div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Theory Classes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {attendance.length > 0 ? Math.round((attendedTheorySessions / attendance.length) * 100) : 0}%
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto inline-flex">
                    <TabsTrigger value="overview" className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Overview</TabsTrigger>
                    <TabsTrigger value="sessions" className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Sessions</TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Enrollments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Enrollments</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {enrollments.map((enrollment: any) => (
                                    <div key={enrollment.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-semibold text-gray-900">{enrollment.classes?.name || "Driving Package"}</div>
                                                <div className="text-sm text-gray-500">
                                                    {enrollment.classes ? "Theory Course" : "Behind-the-Wheel"}
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">In Progress</Badge>
                                        </div>
                                        {enrollment.classes && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Progress</span>
                                                    <span>{Math.round((attendedTheorySessions / 10) * 100)}%</span> {/* Mock total 10 */}
                                                </div>
                                                <Progress value={(attendedTheorySessions / 10) * 100} className="h-1.5" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {enrollments.length === 0 && drivingSessions.length > 0 && (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-semibold text-gray-900">Driving Lessons</div>
                                                <div className="text-sm text-gray-500">Behind-the-Wheel</div>
                                            </div>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Next Session</div>
                                    {upcomingSessions.length > 0 ? (
                                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <div className="font-medium text-purple-900">
                                                    {format(parseISO(upcomingSessions[0].date), "EEEE, MMM d")}
                                                </div>
                                                <div className="text-sm text-purple-700">
                                                    {format(parseISO(upcomingSessions[0].date), "h:mm a")} • {upcomingSessions[0].type}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No upcoming sessions scheduled.</div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Last Session</div>
                                    {pastSessions.length > 0 ? (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {format(parseISO(pastSessions[0].date), "MMM d, h:mm a")}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {pastSessions[0].type} • {pastSessions[0].status}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No past sessions.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Session History</CardTitle>
                            <CardDescription>All driving and theory sessions with this student.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-gray-100">
                                {allSessions.map((session: any, idx: number) => (
                                    <div key={idx} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${session.type === 'Driving' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {session.type === 'Driving' ? <Car className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {session.type === 'Theory' ? (session.class_days?.classes?.name || 'Theory Class') : 'Driving Lesson'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {format(parseISO(session.date), "MMM d, yyyy • h:mm a")}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`capitalize ${session.status === 'completed' || session.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                                            session.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {session.status === 'present' ? 'Attended' : session.status}
                                        </Badge>
                                    </div>
                                ))}
                                {allSessions.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">No sessions found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Instructor Notes</CardTitle>
                                    <CardDescription>Private notes about this student's progress.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Write a new note..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleSaveNote} disabled={savingNote || !noteContent.trim()} className="bg-purple-600 hover:bg-purple-700">
                                                {savingNote ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                Save Note
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        {notes.map((note: any) => (
                                            <div key={note.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-xs text-gray-500 font-medium">
                                                        {format(parseISO(note.created_at), "MMM d, yyyy • h:mm a")}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                        ))}
                                        {notes.length === 0 && (
                                            <div className="text-center py-8 text-gray-400 italic">No notes yet.</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
