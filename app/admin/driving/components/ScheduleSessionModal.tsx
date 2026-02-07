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
                    toast.success(`Successfully enrolled student and granted ${result.granted} sessions (${(result.granted * (selectedService.duration_minutes || 120)) / 60} hours)`)
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
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-slate-100 rounded-[2rem] shadow-heavy bg-white">
                <div className="relative p-6 pt-8 bg-slate-50/50 border-b border-slate-50">
                    <div className="absolute top-4 right-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] opacity-40">
                        Admin Tool
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Schedule Session</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Create a new behind-the-wheel lesson or enroll package.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student</Label>
                            <Select value={formData.studentId} onValueChange={(val) => setFormData({ ...formData, studentId: val })}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold text-slate-700">
                                    <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-heavy p-1">
                                    {students.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-xl font-bold py-2.5">{s.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Plan</Label>
                            <Select value={formData.plan_key} onValueChange={(val) => setFormData({ ...formData, plan_key: val, time: "" })}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold text-slate-700">
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-heavy p-1">
                                    {servicePackages.map(p => (
                                        <SelectItem key={p.id} value={p.plan_key} className="rounded-xl font-bold py-2.5">{p.display_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isPackage ? (
                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                                    <PackageCheck className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Package Enrollment</h4>
                                    <p className="text-xs text-amber-700/80 leading-relaxed font-bold">
                                        Granting <span className="text-amber-900">{selectedService.credits_granted} sessions</span> to student balance.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-white/40 rounded-xl border border-amber-100/30 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-700">
                                <Info className="h-3.5 w-3.5" />
                                Individual sessions booked after enrollment.
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Selection</Label>
                                <div className="relative group">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                                    <Input
                                        type="date"
                                        className="h-12 pl-11 rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold text-slate-700 focus:ring-primary/20"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                                    />
                                </div>
                            </div>

                            {formData.plan_key && formData.date && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                        Available Time Slots
                                    </Label>
                                    <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner">
                                        {fetchingSlots ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                                            </div>
                                        ) : slots.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                                                {slots.map((slot) => {
                                                    const dateObj = parseISO(slot.start_time)
                                                    const displayTime = format(dateObj, "h:mm a")
                                                    const valueTime = format(dateObj, "HH:mm")
                                                    const isSelected = formData.time === valueTime && formData.instructorId === slot.instructor_id

                                                    return (
                                                        <Button
                                                            key={`${slot.start_time}-${slot.instructor_id}`}
                                                            type="button"
                                                            variant="ghost"
                                                            className={`h-auto flex flex-col items-center py-3 rounded-2xl border-2 transition-all group/slot ${isSelected
                                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[0.98]"
                                                                : "bg-white border-transparent hover:border-primary/10 hover:bg-white shadow-sm font-bold text-slate-600"
                                                                }`}
                                                            onClick={() => handleSlotSelect(slot)}
                                                        >
                                                            <span className="text-xs font-black tracking-tight">{displayTime}</span>
                                                            {slot.instructor_name && (
                                                                <span className={`text-[9px] font-black uppercase tracking-tighter opacity-60 mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                                                                    {slot.instructor_name.split(' ')[0]}
                                                                </span>
                                                            )}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 space-y-2">
                                                <div className="text-3xl">📅</div>
                                                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">No free slots found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle</Label>
                                    <Select value={formData.vehicleId} onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}>
                                        <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold text-slate-700">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-heavy p-1">
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id} className="rounded-xl font-bold py-2.5">{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Duration</Label>
                                    <div className="h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center px-4 text-sm font-black text-slate-400 cursor-not-allowed">
                                        {formData.duration} HOURS
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</Label>
                        <Textarea
                            placeholder="Add administrative context..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-slate-50/50 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-primary/10 transition-all min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <div className="p-8 bg-slate-50/30 border-t border-slate-50">
                    <DialogFooter className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} className="rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 px-6 h-12">Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex-1 rounded-2xl font-black uppercase tracking-[0.15em] text-xs h-12 transition-all active:scale-[0.98] shadow-lg ${isPackage
                                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                                : "bg-primary hover:bg-primary/90 shadow-primary/20"
                                }`}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isPackage ? "Enroll Student" : "Confirm Booking")}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
