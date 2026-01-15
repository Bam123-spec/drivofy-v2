'use client'

import { useEffect, useState } from "react"
import { Loader2, BookOpen, Video, Calendar, Clock, Users, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { format, parseISO, isSameDay } from "date-fns"
import { getInstructorCourses } from "@/app/actions/instructor"
import Link from "next/link"
import { Search } from "lucide-react"

export default function LessonsPage() {
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await getInstructorCourses()
                setCourses(data)
            } catch (error) {
                console.error("Failed to load courses", error)
            } finally {
                setLoading(false)
            }
        }
        loadCourses()
    }, [])

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Find if there's a session happening today for the "Start Zoom Class" button
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage your theory cohorts and curriculum.</p>
                </div>
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

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search courses..."
                    className="pl-10 bg-white border-gray-200 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                        const progress = course.totalSessions > 0
                            ? (course.completedSessions / course.totalSessions) * 100
                            : 0

                        return (
                            <Link href={`/instructor/lessons/${course.id}`} key={course.id} className="block group">
                                <Card className="h-full hover:shadow-lg transition-all border-gray-200 hover:border-purple-200 rounded-2xl overflow-hidden bg-white">
                                    <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
                                    <CardContent className="p-6 space-y-6">
                                        {/* Header */}
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between">
                                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100">
                                                    {course.status === 'active' ? 'In Progress' : course.status}
                                                </Badge>
                                                <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                                    {course.totalSessions} Sessions
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">
                                                {course.name}
                                            </h3>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span>
                                                    {format(parseISO(course.start_date), "MMM d")} – {format(parseISO(course.end_date), "MMM d")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span>
                                                    {course.daily_start_time?.slice(0, 5)} – {course.daily_end_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span>{course.enrolledCount} Students Enrolled</span>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Progress</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-1.5 bg-gray-100" indicatorClassName="bg-purple-500" />
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Video className="h-3 w-3" />
                                                Zoom
                                            </div>
                                            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                                View Course <ChevronRight className="h-4 w-4 ml-1" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm text-gray-400 mb-4">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Courses Found</h3>
                        <p className="text-gray-500 mt-1">You aren't assigned to any theory courses yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
