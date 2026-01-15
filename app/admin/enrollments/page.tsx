"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Search,
    Plus,
    MoreHorizontal,
    FileText,
    CheckCircle2,
    XCircle,
    Filter,
    Pin,
    PinOff,
    Users,
    TrendingUp
} from "lucide-react"
import { EnrollStudentDialog } from "./components/EnrollStudentDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { addDays, isWithinInterval, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedClass, setSelectedClass] = useState<string>("all")
    const [pinnedClass, setPinnedClass] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 30),
    })


    useEffect(() => {
        // Load pinned class from local storage
        const savedPinnedClass = localStorage.getItem("drivofy_pinned_class")
        if (savedPinnedClass) {
            setPinnedClass(savedPinnedClass)
            setSelectedClass(savedPinnedClass)
        }
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [enrollRes, classesRes, studentsRes] = await Promise.all([
                supabase.from('enrollments')
                    .select('*, classes(name, start_date, end_date), profiles(full_name, email)')
                    .order('enrolled_at', { ascending: false }),
                supabase.from('classes').select('*').eq('status', 'active'),
                supabase.from('profiles').select('id, full_name, email').eq('role', 'student')
            ])

            setEnrollments(enrollRes.data || [])
            setClasses(classesRes.data || [])
            setStudents(studentsRes.data || [])
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load enrollments")
        } finally {
            setLoading(false)
        }
    }

    const handlePinClass = (classId: string) => {
        if (pinnedClass === classId) {
            setPinnedClass(null)
            localStorage.removeItem("drivofy_pinned_class")
            toast.success("Class unpinned")
        } else {
            setPinnedClass(classId)
            localStorage.setItem("drivofy_pinned_class", classId)
            setSelectedClass(classId)
            toast.success("Class pinned")
        }
    }



    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('enrollments')
                .update({ status })
                .eq('id', id)

            if (error) throw error

            toast.success(`Enrollment marked as ${status}`)
            fetchData()
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    // Filter classes based on date range
    const visibleClasses = classes.filter(cls => {
        if (!dateRange?.from || !dateRange?.to) return true
        const start = new Date(cls.start_date)
        const end = new Date(cls.end_date)

        // Check if class overlaps with selected range
        return (start <= dateRange.to && end >= dateRange.from)
    })

    const filteredEnrollments = enrollments.filter(e => {
        const matchesClass = selectedClass === "all" || e.class_id === selectedClass

        // Also filter by date range if "all" classes selected, to show only relevant enrollments
        let matchesDate = true
        if (selectedClass === "all" && dateRange?.from && dateRange?.to) {
            const enrolledAt = new Date(e.enrolled_at)
            matchesDate = isWithinInterval(enrolledAt, { start: dateRange.from, end: dateRange.to })
        }

        return matchesClass && matchesDate
    })

    // Calculate stats for selected class (or all visible)
    const stats = {
        totalStudents: filteredEnrollments.length,
        completed: filteredEnrollments.filter(e => e.status === 'completed').length,
        dropped: filteredEnrollments.filter(e => e.status === 'dropped').length,
        active: filteredEnrollments.filter(e => e.status === 'enrolled').length
    }
    const completionRate = stats.totalStudents > 0 ? Math.round((stats.completed / stats.totalStudents) * 100) : 0

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enrollments</h1>
                    <p className="text-gray-500 mt-1">Track student class registrations and progress.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />

                    <div className="flex items-center gap-2">
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-[200px]">
                                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                                <SelectValue placeholder="Filter by Class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Visible Classes</SelectItem>
                                {visibleClasses.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name} {pinnedClass === cls.id && "📌"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedClass !== "all" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePinClass(selectedClass)}
                                className={pinnedClass === selectedClass ? "text-primary bg-primary/10" : "text-gray-400"}
                                title={pinnedClass === selectedClass ? "Unpin Class" : "Pin Class"}
                            >
                                {pinnedClass === selectedClass ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>

                    <EnrollStudentDialog onEnrolled={fetchData} />
                </div>
            </div>

            {/* Class Summary Cards */}
            {selectedClass !== "all" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active} active, {stats.dropped} dropped
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completionRate}%</div>
                            <Progress value={completionRate} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Class Status</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {classes.find(c => c.id === selectedClass)?.status || 'Active'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(classes.find(c => c.id === selectedClass)?.start_date).toLocaleDateString()} - {new Date(classes.find(c => c.id === selectedClass)?.end_date).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Student</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Enrolled Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEnrollments.length > 0 ? (
                            filteredEnrollments.map((enrollment) => (
                                <TableRow key={enrollment.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{enrollment.profiles?.full_name}</div>
                                        <div className="text-xs text-gray-500">{enrollment.profiles?.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-700">{enrollment.classes?.name}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${enrollment.status === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                                            enrollment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {enrollment.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(enrollment.id, 'completed')}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleUpdateStatus(enrollment.id, 'dropped')}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Drop Student
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No enrollments found for the selected criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
