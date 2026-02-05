'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createDrivingSession, getServicePackages, grantPackageCredits } from "@/app/actions/adminDriving"
import { toast } from "sonner"
import { Loader2, Calendar as CalendarIcon, Clock, PackageCheck, Info } from "lucide-react"
import { useEffect, useMemo } from "react"
import { format, parseISO } from "date-fns"

interface ScheduleModalProps {
    open: boolean
    onClose: () => void
    instructors: any[]
    students: any[]
    vehicles: any[]
    onSuccess: () => void
    initialPlanKey?: string
}

export function ScheduleSessionModal({
    open,
    onClose,
    instructors,
    students,
    vehicles,
    onSuccess,
    initialPlanKey
}: ScheduleModalProps) {
    const [loading, setLoading] = useState(false)
    const [servicePackages, setServicePackages] = useState<any[]>([])
    const [slots, setSlots] = useState<Array<{ start_time: string; instructor_id: string; instructor_name?: string }>>([])
    const [fetchingSlots, setFetchingSlots] = useState(false)
    const [formData, setFormData] = useState({
        studentId: "",
        instructorId: "",
        vehicleId: undefined as string | undefined,
        plan_key: "",
        date: "",
        time: "",
        duration: "2",
        notes: ""
    })

    // Memoized selected service info
    const selectedService = useMemo(() => {
        return servicePackages.find(p => p.plan_key === formData.plan_key)
    }, [formData.plan_key, servicePackages])

    const isPackage = selectedService?.category === 'package'

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const packages = await getServicePackages()
                setServicePackages(packages)
            } catch (error) {
                console.error("Error fetching packages:", error)
            }
        }
        if (open) fetchPackages()
    }, [open])

    useEffect(() => {
        if (open && initialPlanKey) {
            setFormData(prev => ({
                ...prev,
                plan_key: initialPlanKey
            }))
        }
    }, [open, initialPlanKey])

    useEffect(() => {
        const fetchSlots = async () => {
            if (!formData.plan_key || !formData.date || isPackage) {
                setSlots([])
                return
            }

            setFetchingSlots(true)
            try {
                const response = await fetch(`/api/availability?plan_key=${formData.plan_key}&date=${formData.date}&preview=true`)
                const data = await response.json()
                setSlots(Array.isArray(data.slots) ? data.slots : [])
            } catch (error) {
                console.error("Error fetching slots:", error)
                toast.error("Failed to fetch available slots")
            } finally {
                setFetchingSlots(false)
            }
        }
        fetchSlots()
    }, [formData.plan_key, formData.date, isPackage])

    const handleSlotSelect = (slot: { start_time: string; instructor_id: string }) => {
        const dateObj = parseISO(slot.start_time)
        const timeStr = format(dateObj, "HH:mm")

        setFormData(prev => ({
            ...prev,
            time: timeStr,
            instructorId: slot.instructor_id || prev.instructorId,
            duration: (selectedService?.duration_minutes / 60).toString() || prev.duration
        }))
    }

    const handleSubmit = async () => {
        if (!formData.studentId || !formData.plan_key) {
            toast.error("Please select a student and service")
            return
        }

        if (!isPackage && (!formData.instructorId || !formData.date || !formData.time)) {
            toast.error("Please fill in all required scheduling fields")
            return
        }

        setLoading(true)
        try {
            if (isPackage) {
                // Handle Package Enrollment
                const result = await grantPackageCredits(formData.studentId, selectedService.id)
                if (result.success) {
                    toast.success(`Successfully enrolled student and granted ${result.granted} sessions`)
                    onSuccess()
                    onClose()
                    resetForm()
                } else {
                    toast.error(result.error || "Failed to enroll student in package")
                }
            } else {
                // Handle Individual Session Scheduling
                const result = await createDrivingSession({
                    ...formData,
                    vehicleId: formData.vehicleId || undefined,
                    duration: parseFloat(formData.duration)
                })

                if (result.success) {
                    toast.success("Session scheduled successfully")
                    if (result.warning) toast.warning(result.warning, { duration: 5000 })
                    onSuccess()
                    onClose()
                    resetForm()
                } else {
                    toast.error(result.error || "Failed to schedule session")
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            studentId: "",
            instructorId: "",
            vehicleId: undefined,
            plan_key: "",
            date: "",
            time: "",
            duration: "2",
            notes: ""
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Schedule Driving Session</DialogTitle>
                    <DialogDescription>
                        Book a new behind-the-wheel lesson.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Student *</Label>
                            <Select value={formData.studentId} onValueChange={(val) => setFormData({ ...formData, studentId: val })}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {students.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Service Plan *</Label>
                            <Select value={formData.plan_key} onValueChange={(val) => setFormData({ ...formData, plan_key: val, time: "" })}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {servicePackages.map(p => (
                                        <SelectItem key={p.id} value={p.plan_key}>{p.display_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isPackage ? (
                        <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <PackageCheck className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-900">Package Enrollment</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        This is a multi-session package. Enrolling the student will grant them **{selectedService.credits_granted} sessions** to their balance.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl border border-orange-50 text-[11px] font-medium text-orange-700">
                                <Info className="h-3.5 w-3.5 shrink-0" />
                                Individual sessions can be booked by the student or admin after enrollment.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label>Date *</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="date"
                                        className="h-11 pl-10 rounded-xl"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                                    />
                                </div>
                            </div>

                            {formData.plan_key && formData.date && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-900 group flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Available Slots
                                    </Label>
                                    {fetchingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                        </div>
                                    ) : slots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                            {slots.map((slot) => {
                                                const dateObj = parseISO(slot.start_time)
                                                const displayTime = format(dateObj, "h:mm a")
                                                const valueTime = format(dateObj, "HH:mm")
                                                const isSelected = formData.time === valueTime && formData.instructorId === slot.instructor_id

                                                return (
                                                    <Button
                                                        key={`${slot.start_time}-${slot.instructor_id}`}
                                                        type="button"
                                                        variant={isSelected ? "default" : "outline"}
                                                        className={`h-10 text-xs font-bold rounded-lg transition-all ${isSelected ? "bg-blue-600 shadow-md shadow-blue-600/20" : "hover:border-blue-200 hover:bg-blue-50"
                                                            }`}
                                                        onClick={() => handleSlotSelect(slot)}
                                                    >
                                                        <span className="flex flex-col leading-tight">
                                                            <span>{displayTime}</span>
                                                            {slot.instructor_name && <span className="text-[10px] font-medium opacity-80">{slot.instructor_name}</span>}
                                                        </span>
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-500 font-medium">No slots available for this date.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Vehicle (Optional)</Label>
                                    <Select value={formData.vehicleId} onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (hrs)</Label>
                                    <Input
                                        disabled
                                        value={`${formData.duration} hours`}
                                        className="h-11 rounded-xl bg-slate-50 font-medium"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            placeholder="Internal notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={isPackage ? "bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPackage ? "Enroll Student" : "Schedule Session"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
