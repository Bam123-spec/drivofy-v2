'use client'

import { useEffect, useMemo, useState } from "react"
import {
    Loader2,
    Plus,
    LayoutList,
    Calendar as CalendarIcon,
    Filter,
    Share2,
    Search,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { getDrivingSessions, getDrivingServices, getInstructors, getStudents, getVehicles } from "@/app/actions/adminDriving"
import { DrivingSessionTable } from "./components/DrivingSessionTable"
import { DrivingSessionCalendar } from "./components/DrivingSessionCalendar"
import { SessionDrawer } from "./components/SessionDrawer"
import { ScheduleSessionModal } from "./components/ScheduleSessionModal"
import { DrivingServicesTable } from "./components/DrivingServicesTable"
import { ServiceAvailabilityDialog } from "./components/ServiceAvailabilityDialog"
import { CreateDrivingServiceDialog } from "./components/CreateDrivingServiceDialog"

export default function AdminDrivingPage() {
    const [activeTab, setActiveTab] = useState<'services' | 'sessions'>('services')
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
    const [sessions, setSessions] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [instructors, setInstructors] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [instructorFilter, setInstructorFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [serviceSearch, setServiceSearch] = useState("")
    const [serviceInstructorFilter, setServiceInstructorFilter] = useState("all")

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedSession, setSelectedSession] = useState<any | null>(null)
    const [selectedService, setSelectedService] = useState<any | null>(null)
    const [selectedPlanKey, setSelectedPlanKey] = useState<string | undefined>(undefined)
    const [showAvailability, setShowAvailability] = useState(false)
    const [showCreateService, setShowCreateService] = useState(false)

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [instructorFilter, statusFilter])

    const fetchInitialData = async () => {
        try {
            const [inst, stud, veh, svc] = await Promise.all([
                getInstructors(),
                getStudents(),
                getVehicles(),
                getDrivingServices()
            ])
            setInstructors(inst || [])
            setStudents(stud || [])
            setVehicles(veh || [])
            setServices(svc || [])
            await fetchSessions()
        } catch (error) {
            console.error(error)
            toast.error("Failed to load initial data")
        } finally {
            setLoading(false)
        }
    }

    const fetchServices = async () => {
        try {
            const svc = await getDrivingServices()
            setServices(svc || [])
        } catch (error) {
            toast.error("Failed to load services")
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

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = serviceSearch.trim().length === 0
                || (service.display_name || service.name || "").toLowerCase().includes(serviceSearch.toLowerCase())
                || (service.plan_key || service.slug || "").toLowerCase().includes(serviceSearch.toLowerCase())

            const matchesInstructor = serviceInstructorFilter === "all"
                || service.instructor_id === serviceInstructorFilter

            return matchesSearch && matchesInstructor
        })
    }, [services, serviceSearch, serviceInstructorFilter])

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'services' | 'sessions')}>
                {/* Header */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            Booking Services <span className="text-slate-400">{services.length}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Driving Sessions</h1>
                        <p className="text-gray-500">
                            Create and manage driving services, availability, and booked sessions.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            className="rounded-full gap-2"
                            onClick={() => toast.info("Use the availability link per service to sync to your website.")}
                        >
                            <Share2 className="h-4 w-4" />
                            Share Services
                        </Button>
                        <Button
                            className="rounded-full shadow-lg shadow-primary/25"
                            onClick={() => {
                                setSelectedPlanKey(undefined)
                                setIsCreateOpen(true)
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add People
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setShowCreateService(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Service
                        </Button>
                    </div>
                </div>

                <TabsList className="bg-transparent p-0 border-b border-slate-200 rounded-none gap-6">
                    <TabsTrigger value="services" className="rounded-none px-0 pb-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                        Services
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="rounded-none px-0 pb-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                        Sessions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="space-y-6">
                    <div className="space-y-3">
                        <div className="text-sm font-semibold text-slate-700">Business setup recommendations</div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border border-slate-200 shadow-sm">
                                <CardContent className="p-5 space-y-2">
                                    <div className="text-sm font-semibold text-slate-900">Sync availability</div>
                                    <p className="text-xs text-slate-500">
                                        Copy availability links so your public site can show open driving slots.
                                    </p>
                                    <Button variant="link" className="px-0 text-blue-600">
                                        View links
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="border border-slate-200 shadow-sm">
                                <CardContent className="p-5 space-y-2">
                                    <div className="text-sm font-semibold text-slate-900">Set up notifications</div>
                                    <p className="text-xs text-slate-500">
                                        Keep instructors and students updated when sessions are booked.
                                    </p>
                                    <Button variant="link" className="px-0 text-blue-600">
                                        Configure alerts
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="border border-slate-200 shadow-sm">
                                <CardContent className="p-5 space-y-2">
                                    <div className="text-sm font-semibold text-slate-900">Connect your website</div>
                                    <p className="text-xs text-slate-500">
                                        Embed booking links so students can schedule sessions online.
                                    </p>
                                    <Button variant="link" className="px-0 text-blue-600">
                                        Learn more <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-sm font-semibold text-slate-700">Service list</div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={serviceInstructorFilter} onValueChange={setServiceInstructorFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All instructors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Instructors</SelectItem>
                                        {instructors.map(i => (
                                            <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        placeholder="Search services..."
                                        className="pl-9 w-[220px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <DrivingServicesTable
                            services={filteredServices}
                            onShowAvailability={(service) => {
                                setSelectedService(service)
                                setShowAvailability(true)
                            }}
                            onAddStudent={(service) => {
                                setSelectedPlanKey(service.plan_key)
                                setIsCreateOpen(true)
                            }}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
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
                            <Button
                                onClick={() => {
                                    setSelectedPlanKey(undefined)
                                    setIsCreateOpen(true)
                                }}
                                className="shadow-lg shadow-primary/25"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Schedule Session
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
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
                    </div>

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
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <ScheduleSessionModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                instructors={instructors}
                students={students}
                vehicles={vehicles}
                onSuccess={fetchSessions}
                initialPlanKey={selectedPlanKey}
            />

            <SessionDrawer
                session={selectedSession}
                open={!!selectedSession}
                onClose={() => setSelectedSession(null)}
            />

            <ServiceAvailabilityDialog
                open={showAvailability}
                onClose={() => setShowAvailability(false)}
                service={selectedService}
            />

            <CreateDrivingServiceDialog
                open={showCreateService}
                onClose={() => setShowCreateService(false)}
                instructors={instructors}
                onSuccess={fetchServices}
            />
        </div>
    )
}
