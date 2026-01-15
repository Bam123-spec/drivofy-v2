"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentAttendanceTable, StudentAttendance } from "./StudentAttendanceTable"
import { supabase } from "@/lib/supabaseClient"

interface AttendanceSessionRowProps {
    classId: string
    date: Date
    isOpen: boolean
    onToggle: () => void
}

export function AttendanceSessionRow({ classId, date, isOpen, onToggle }: AttendanceSessionRowProps) {
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState<StudentAttendance[]>([])
    const [stats, setStats] = useState({ marked: 0, total: 0 })
    const [hasLoaded, setHasLoaded] = useState(false)

    const dateStr = format(date, 'yyyy-MM-dd')

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Fetch enrollments (students)
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('student_id, profiles(full_name, email)')
                .eq('class_id', classId)
                .eq('status', 'enrolled')

            if (enrollError) throw enrollError

            // 2. Fetch existing attendance for this date
            const { data: attendance, error: attError } = await supabase
                .from('attendance')
                .select('student_id, status, id')
                .eq('class_id', classId)
                .eq('date', dateStr)

            if (attError) throw attError

            // 3. Merge data
            const mergedData: StudentAttendance[] = (enrollments || []).map((enroll: any) => {
                const record = attendance?.find((a: any) => a.student_id === enroll.student_id)
                return {
                    studentId: enroll.student_id,
                    name: enroll.profiles?.full_name || 'Unknown',
                    email: enroll.profiles?.email || '',
                    status: record?.status || 'unmarked',
                    recordId: record?.id
                }
            })

            setStudents(mergedData)

            // Update stats
            const markedCount = mergedData.filter(s => s.status !== 'unmarked').length
            setStats({ marked: markedCount, total: mergedData.length })
            setHasLoaded(true)

        } catch (error) {
            console.error("Error fetching session data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch data when opening if not loaded
    const handleOpenChange = () => {
        if (!isOpen && !hasLoaded) {
            fetchData()
        }
        onToggle()
    }

    // Refresh data after save
    const handleSaveSuccess = () => {
        fetchData()
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
            <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer" onClick={handleOpenChange}>
                <div className="flex items-center gap-4">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            {isOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                        </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{format(date, 'MMM')}</span>
                            <span className="text-sm font-bold text-gray-900 leading-none">{format(date, 'dd')}</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{format(date, 'EEEE, MMMM do')}</h3>
                            <p className="text-xs text-gray-500">
                                {hasLoaded ? `${stats.marked} / ${stats.total} marked` : 'Click to view'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasLoaded && stats.marked === stats.total && stats.total > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                    )}
                </div>
            </div>

            <CollapsibleContent>
                <div className="p-4 border-t border-gray-200">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <StudentAttendanceTable
                            classId={classId}
                            date={dateStr}
                            initialData={students}
                            onSaveSuccess={handleSaveSuccess}
                        />
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
