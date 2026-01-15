'use client'

import { useEffect, useState } from "react"
import {
    Loader2,
    Plus,
    LayoutList,
    Calendar as CalendarIcon,
    Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { getDrivingSessions, getInstructors, getStudents, getVehicles } from "@/app/actions/adminDriving"
import { DrivingSessionTable } from "./components/DrivingSessionTable"
import { DrivingSessionCalendar } from "./components/DrivingSessionCalendar"
import { SessionDrawer } from "./components/SessionDrawer"
import { ScheduleSessionModal } from "./components/ScheduleSessionModal"

export default function AdminDrivingPage() {
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
    const [sessions, setSessions] = useState<any[]>([])
    const [instructors, setInstructors] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [instructorFilter, setInstructorFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedSession, setSelectedSession] = useState<any | null>(null)

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [instructorFilter, statusFilter])

    const fetchInitialData = async () => {
        try {
            const [inst, stud, veh] = await Promise.all([
                getInstructors(),
                getStudents(),
                getVehicles()
            ])
            setInstructors(inst || [])
            setStudents(stud || [])
            setVehicles(veh || [])
            await fetchSessions()
        } catch (error) {
            console.error(error)
            toast.error("Failed to load initial data")
        } finally {
            setLoading(false)
        }
    }

    const fetchSessions = async () => {
        try {
            const data = await getDrivingSessions({
                instructorId: instructorFilter,
                status: statusFilter
            })
            setSessions(data || [])
        } catch (error) {
            toast.error("Failed to load sessions")
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Driving Sessions</h1>
                    <p className="text-gray-500 mt-1">Manage behind-the-wheel appointments and schedules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border rounded-lg p-1 flex items-center">
                        <Button
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="h-8"
                        >
                            <LayoutList className="h-4 w-4 mr-2" /> Table
                        </Button>
                        <Button
                            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                            className="h-8"
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
                        </Button>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/25">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Session
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="h-4 w-4" />
                    Filters:
                </div>
                <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Instructors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Instructors</SelectItem>
                        {instructors.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <DrivingSessionTable
                    sessions={sessions}
                    onSelectSession={setSelectedSession}
                />
            ) : (
                <DrivingSessionCalendar
                    sessions={sessions}
                    onSelectSession={setSelectedSession}
                />
            )}

            {/* Modals */}
            <ScheduleSessionModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                instructors={instructors}
                students={students}
                vehicles={vehicles}
                onSuccess={fetchSessions}
            />

            <SessionDrawer
                session={selectedSession}
                open={!!selectedSession}
                onClose={() => setSelectedSession(null)}
            />
        </div>
    )
}
