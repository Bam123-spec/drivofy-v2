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
    ExternalLink,
    Car,
    Bell
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
import { EditDrivingServiceDialog } from "./components/EditDrivingServiceDialog"
import { EnrollStudentPackageModal } from "./components/EnrollStudentPackageModal"

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
    const [showEditService, setShowEditService] = useState(false)
    const [showEnrollPackage, setShowEnrollPackage] = useState(false)

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
                || (service.service_package_instructors || []).some(
                    (entry: any) => entry.instructor_id === serviceInstructorFilter
                )

            return matchesSearch && matchesInstructor
        })
    }, [services, serviceSearch, serviceInstructorFilter])

    const usesPriceCents = useMemo(() => {
        return services.some((service) => typeof service?.price_cents === "number")
    }, [services])

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
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1.5 font-sans">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.25em] animate-in-fade opacity-70">
                            <Car className="h-3.5 w-3.5" />
                            Booking Services {services.length}
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight animate-in-fade">
                            Driving Sessions
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-lg animate-in-fade leading-relaxed">
                            Create and manage driving services, availability, and booked sessions.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 animate-in-fade">
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl gap-2 font-semibold border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                            onClick={() => toast.info("Use the availability link per service to sync to your website.")}
                        >
                            <Share2 className="h-4 w-4" />
                            Share Services
                        </Button>
                        <Button
                            className="h-11 rounded-2xl gap-2 font-bold shadow-premium bg-primary hover:bg-primary/90 transition-all active:scale-95 px-6"
                            onClick={() => {
                                setSelectedPlanKey(undefined)
                                setIsCreateOpen(true)
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add People
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl gap-2 font-semibold border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                            onClick={() => setShowCreateService(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add New Service
                        </Button>
                    </div>
                </div>

                <div className="border-b border-slate-100/60 mt-2">
                    <TabsList className="bg-transparent h-12 p-0 gap-8 justify-start">
                        <TabsTrigger
                            value="services"
                            className="relative h-12 rounded-none bg-transparent px-0 pb-4 pt-0 text-sm font-bold text-slate-400 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all group"
                        >
                            Services
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100" />
                        </TabsTrigger>
                        <TabsTrigger
                            value="sessions"
                            className="relative h-12 rounded-none bg-transparent px-0 pb-4 pt-0 text-sm font-bold text-slate-400 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all group"
                        >
                            Sessions
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100" />
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="services" className="space-y-10 mt-6 focus-visible:outline-none">
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                            Business setup recommendations
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="glass-card premium-card p-6 flex flex-col items-start gap-5 group hover:bg-white transition-all duration-500">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50/50 flex items-center justify-center text-primary shadow-sm border border-blue-100 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <CalendarIcon className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-slate-900 tracking-tight">Sync availability</div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Copy availability links so your public site can show open driving slots.
                                    </p>
                                </div>
                                <Button variant="link" className="px-0 h-auto text-primary font-bold text-[11px] uppercase tracking-wider hover:no-underline hover:text-primary/70 transition-colors">
                                    View links
                                </Button>
                            </div>
                            <div className="glass-card premium-card p-6 flex flex-col items-start gap-5 group hover:bg-white transition-all duration-500">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50/50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-slate-900 tracking-tight">Set up notifications</div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Keep instructors and students updated when sessions are booked.
                                    </p>
                                </div>
                                <Button variant="link" className="px-0 h-auto text-primary font-bold text-[11px] uppercase tracking-wider hover:no-underline hover:text-primary/70 transition-colors">
                                    Configure alerts
                                </Button>
                            </div>
                            <div className="glass-card premium-card p-6 flex flex-col items-start gap-5 group hover:bg-white transition-all duration-500">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50/50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                    <ExternalLink className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-slate-900 tracking-tight">Connect your website</div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Embed booking links so students can schedule sessions online.
                                    </p>
                                </div>
                                <Button variant="link" className="px-0 h-auto text-primary font-bold text-[11px] uppercase tracking-wider hover:no-underline hover:text-primary/70 transition-colors">
                                    Learn more
                                </Button>
                            </div>
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
                                setSelectedService(service)
                                if (service.category === 'package') {
                                    setShowEnrollPackage(true)
                                } else {
                                    setSelectedPlanKey(service.plan_key)
                                    setIsCreateOpen(true)
                                }
                            }}
                            onEditService={(service) => {
                                setSelectedService(service)
                                setShowEditService(true)
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
                onSuccess={fetchInitialData}
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
                usesPriceCents={usesPriceCents}
            />

            <EditDrivingServiceDialog
                open={showEditService}
                onClose={() => setShowEditService(false)}
                instructors={instructors}
                service={selectedService}
                onSuccess={fetchServices}
            />

            <EnrollStudentPackageModal
                open={showEnrollPackage}
                onClose={() => setShowEnrollPackage(false)}
                students={students}
                service={selectedService}
                onSuccess={fetchInitialData}
            />
        </div>
    )
}
