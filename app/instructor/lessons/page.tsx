'use client'

import { useEffect, useState, useMemo } from "react"
import { Loader2, BookOpen, Video, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSameDay, parseISO } from "date-fns"
import { getInstructorCourses } from "@/app/actions/instructor"
import { supabase } from "@/lib/supabaseClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ClassesFilterBar } from "./components/ClassesFilterBar"
import { CourseTypeRow } from "./components/CourseTypeRow"
import { ManageCategoriesDialog } from "./components/ManageCategoriesDialog"
import { CreateClassDialog } from "@/app/admin/classes/components/CreateClassDialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"

export default function LessonsPage() {
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([]) // Kept for "Create Row" compatibility if needed

    // Filter State
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [modeFilter, setModeFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set())

    // Dialog State
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [coursesData, categoriesData] = await Promise.all([
                getInstructorCourses(),
                supabase.from('class_categories').select('*').order('created_at', { ascending: true })
            ])

            setCourses(coursesData)
            if (categoriesData.data) setCategories(categoriesData.data)
        } catch (error) {
            console.error("Failed to load data", error)
        } finally {
            setLoading(false)
        }
    }

    // 1. Flatten Courses into Sessions for easier processing
    const allSessions = useMemo(() => {
        return courses.flatMap(course => {
            return (course.class_days || []).map((day: any) => ({
                id: day.id,
                date: day.date,
                start_time: day.start_datetime.split('T')[1],
                end_time: day.end_datetime.split('T')[1],
                status: day.status,
                class_id: course.id,
                class_name: course.name,
                class_type: course.class_type || 'Uncategorized', // Use class_type
                enrolled_count: course.enrolledCount,
                total_sessions: course.totalSessions,
                completed_sessions: course.completedSessions,
                mode: course.zoom_url ? 'zoom' : 'in-person', // Infer mode
                instructor_name: course.instructors?.full_name
            }))
        })
    }, [courses])

    // 2. Apply Filters
    const filteredSessions = useMemo(() => {
        return allSessions.filter(session => {
            // Search
            const matchesSearch =
                session.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.class_type.toLowerCase().includes(searchQuery.toLowerCase())

            // Status
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'upcoming' && session.status === 'scheduled') ||
                (statusFilter === 'active' && session.status === 'in_progress') ||
                (statusFilter === 'completed' && session.status === 'completed')

            // Mode
            const matchesMode = modeFilter === 'all' || session.mode === modeFilter

            // Date
            const matchesDate = !dateFilter || isSameDay(parseISO(session.date), dateFilter)

            return matchesSearch && matchesStatus && matchesMode && matchesDate
        })
    }, [allSessions, searchQuery, statusFilter, modeFilter, dateFilter])

    // 3. Group by Course Type
    const sessionsByType = useMemo(() => {
        const groups: { [key: string]: any[] } = {}
        filteredSessions.forEach(session => {
            const type = session.class_type || 'Other'
            if (!groups[type]) groups[type] = []
            groups[type].push(session)
        })
        return groups
    }, [filteredSessions])

    // Get unique types for tabs
    const courseTypes = useMemo(() => {
        const types = new Set(courses.map(c => c.class_type || 'Other'))
        return Array.from(types).sort()
    }, [courses])

    const toggleExpand = (type: string) => {
        const newSet = new Set(expandedTypes)
        if (newSet.has(type)) {
            newSet.delete(type)
        } else {
            newSet.add(type)
        }
        setExpandedTypes(newSet)
    }

    // Find active course for "Start Today's Class"
    const today = new Date()
    const activeCourse = courses.find(c =>
        c.nextSession && isSameDay(parseISO(c.nextSession.start_datetime), today)
    )

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Classes</h1>
                    <p className="text-gray-500 mt-1">Manage your theory cohorts and curriculum.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Kept "Create Row" for backward compatibility if needed, but hidden from main view if confusing */}
                    {/* <Button variant="outline" onClick={() => setIsManageCategoriesOpen(true)}>
                        Manage Rows
                    </Button> */}

                    {activeCourse ? (
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 rounded-full animate-pulse">
                            <Video className="h-4 w-4 mr-2" /> Start Today's Class
                        </Button>
                    ) : (
                        <Button variant="outline" className="rounded-full text-gray-600">
                            <Video className="h-4 w-4 mr-2" /> Zoom Meeting
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <ClassesFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                modeFilter={modeFilter}
                onModeChange={setModeFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
                    <TabsList className="bg-transparent p-0 h-auto gap-6 border-b border-gray-200 w-full justify-start rounded-none">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-gray-500 rounded-none px-2 pb-3 font-medium text-base transition-all"
                        >
                            All Courses
                            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600">
                                {filteredSessions.length}
                            </Badge>
                        </TabsTrigger>
                        {courseTypes.map(type => (
                            <TabsTrigger
                                key={type}
                                value={type}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 text-gray-500 rounded-none px-2 pb-3 font-medium text-base transition-all"
                            >
                                {type}
                                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600">
                                    {sessionsByType[type]?.length || 0}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Content */}
                <TabsContent value="all" className="mt-0 focus-visible:outline-none">
                    {viewMode === 'card' ? (
                        <div className="space-y-6">
                            {Object.entries(sessionsByType).map(([type, sessions]) => (
                                <CourseTypeRow
                                    key={type}
                                    type={type}
                                    sessions={sessions}
                                    expanded={expandedTypes.has(type)}
                                    onToggle={() => toggleExpand(type)}
                                    onAddClass={() => setIsCreateClassOpen(true)}
                                />
                            ))}
                            {Object.keys(sessionsByType).length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
                                    <p className="text-gray-500">Try adjusting your filters.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead>Course Type</TableHead>
                                        <TableHead>Class Name</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSessions.map((session) => (
                                        <TableRow key={session.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-900">{session.class_type}</TableCell>
                                            <TableCell>{session.class_name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-medium">{format(parseISO(session.date), "MMM d, yyyy")}</span>
                                                    <span className="text-gray-500">{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{session.enrolled_count}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white">
                                                    {session.mode === 'zoom' ? 'Zoom' : 'In-Person'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={
                                                    session.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                                                        session.status === 'in_progress' ? 'bg-green-50 text-green-700' :
                                                            'bg-gray-100 text-gray-600'
                                                }>
                                                    {session.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm" className="text-purple-600">
                                                    <Link href={`/instructor/lessons/${session.class_id}`}>Manage</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                {/* Specific Type Tabs */}
                {courseTypes.map(type => (
                    <TabsContent key={type} value={type} className="mt-0 focus-visible:outline-none">
                        {viewMode === 'card' ? (
                            <CourseTypeRow
                                type={type}
                                sessions={sessionsByType[type] || []}
                                expanded={true} // Always expanded in specific tab
                                onToggle={() => { }} // No toggle needed
                                onAddClass={() => setIsCreateClassOpen(true)}
                            />
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead>Class Name</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Students</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(sessionsByType[type] || []).map((session) => (
                                            <TableRow key={session.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-gray-900">{session.class_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span className="font-medium">{format(parseISO(session.date), "MMM d, yyyy")}</span>
                                                        <span className="text-gray-500">{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{session.enrolled_count}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-white">
                                                        {session.mode === 'zoom' ? 'Zoom' : 'In-Person'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={
                                                        session.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                                                            session.status === 'in_progress' ? 'bg-green-50 text-green-700' :
                                                                'bg-gray-100 text-gray-600'
                                                    }>
                                                        {session.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="ghost" size="sm" className="text-purple-600">
                                                        <Link href={`/instructor/lessons/${session.class_id}`}>Manage</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            <ManageCategoriesDialog
                open={isManageCategoriesOpen}
                onOpenChange={setIsManageCategoriesOpen}
                onSuccess={loadData}
            />

            <CreateClassDialog
                open={isCreateClassOpen}
                onOpenChange={setIsCreateClassOpen}
                onSuccess={loadData}
            />
        </div>
    )
}
