'use client'

import { useEffect, useState } from "react"
import { getInstructorStudents } from "@/app/actions/instructor"
import { Loader2, Search, Filter, User, ChevronRight, GraduationCap, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"

export default function MyStudentsPage() {
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<any[]>([])
    const [filteredStudents, setFilteredStudents] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [programFilter, setProgramFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        loadStudents()
    }, [])

    useEffect(() => {
        filterStudents()
    }, [searchQuery, programFilter, statusFilter, students])

    const loadStudents = async () => {
        try {
            const data = await getInstructorStudents()
            setStudents(data)
        } catch (error) {
            console.error("Failed to load students", error)
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    const filterStudents = () => {
        let result = students

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(s =>
                s.full_name?.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query)
            )
        }

        // Program Filter
        if (programFilter !== "all") {
            result = result.filter(s => s.programs.includes(programFilter))
        }

        // Status Filter (Mock logic as status might not be fully populated on student object yet)
        // Assuming active if they have sessions
        if (statusFilter !== "all") {
            // Implement status logic if available
        }

        setFilteredStudents(result)
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Students</h1>
                    <p className="text-gray-500 mt-1">Overview of students you're currently teaching.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 rounded-full">
                    <User className="h-4 w-4 mr-2" /> Add Student
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Select value={programFilter} onValueChange={setProgramFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-50 border-transparent">
                                <SelectValue placeholder="Program Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Programs</SelectItem>
                                <SelectItem value="Driving">Driving</SelectItem>
                                <SelectItem value="Theory">Theory</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-50 border-transparent">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No students found matching your criteria.
                        </div>
                    ) : (
                        filteredStudents.map((student) => {
                            const progress = student.totalSessions > 0
                                ? Math.round((student.completedSessions / student.totalSessions) * 100)
                                : 0

                            return (
                                <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        {/* Student Info */}
                                        <div className="flex items-center gap-4 min-w-[250px]">
                                            <Avatar className="h-12 w-12 border border-gray-200">
                                                <AvatarImage src={student.avatar_url} />
                                                <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                                                    {student.full_name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/instructor/students/${student.id}`} className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                                                    {student.full_name}
                                                </Link>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </div>

                                        {/* Programs */}
                                        <div className="flex flex-wrap gap-2 min-w-[150px]">
                                            {student.programs.map((prog: string) => (
                                                <Badge key={prog} variant="secondary" className={`
                                                    ${prog === 'Driving' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}
                                                `}>
                                                    {prog === 'Driving' ? <Car className="h-3 w-3 mr-1" /> : <GraduationCap className="h-3 w-3 mr-1" />}
                                                    {prog}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Progress */}
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="font-medium text-gray-900">{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" indicatorClassName="bg-green-500" />
                                            <div className="text-xs text-gray-400 mt-1">
                                                {student.completedSessions} / {student.totalSessions} sessions completed
                                            </div>
                                        </div>

                                        {/* Next Session */}
                                        <div className="min-w-[180px]">
                                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Session</div>
                                            {student.nextSession ? (
                                                <div className="text-sm font-medium text-gray-900">
                                                    {format(parseISO(student.nextSession.date), "MMM d, h:mm a")}
                                                    <div className="text-xs text-blue-600 font-normal">{student.nextSession.type}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400 italic">No upcoming sessions</div>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <Button variant="ghost" size="icon" className="text-gray-400 group-hover:text-purple-600" asChild>
                                            <Link href={`/instructor/students/${student.id}`}>
                                                <ChevronRight className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </Card>
        </div>
    )
}
