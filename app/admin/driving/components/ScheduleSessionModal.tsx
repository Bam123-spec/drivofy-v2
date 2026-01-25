'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createDrivingSession } from "@/app/actions/adminDriving"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ScheduleModalProps {
    open: boolean
    onClose: () => void
    instructors: any[]
    students: any[]
    vehicles: any[]
    onSuccess: () => void
}

export function ScheduleSessionModal({ open, onClose, instructors, students, vehicles, onSuccess }: ScheduleModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        studentId: "",
        instructorId: "",
        vehicleId: undefined as string | undefined,
        date: "",
        time: "",
        duration: "2",
        notes: ""
    })

    const handleSubmit = async () => {
        if (!formData.studentId || !formData.instructorId || !formData.date || !formData.time) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const result = await createDrivingSession({
                ...formData,
                vehicleId: formData.vehicleId || undefined,
                duration: parseFloat(formData.duration)
            })

            if (result.success) {
                toast.success("Session scheduled successfully")
                onSuccess()
                onClose()
                // Reset form
                setFormData({
                    studentId: "",
                    instructorId: "",
                    vehicleId: undefined,
                    date: "",
                    time: "",
                    duration: "2",
                    notes: ""
                })
            } else {
                toast.error(result.error || "Failed to schedule session")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
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
                            <Select onValueChange={(val) => setFormData({ ...formData, studentId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Instructor *</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, instructorId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instructors.map(i => (
                                        <SelectItem key={i.id} value={i.id}>{i.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Date *</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Time *</Label>
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (hrs)</Label>
                            <Select value={formData.duration} onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 hour</SelectItem>
                                    <SelectItem value="1.5">1.5 hours</SelectItem>
                                    <SelectItem value="2">2 hours</SelectItem>
                                    <SelectItem value="3">3 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Vehicle (Optional)</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicles.map(v => (
                                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Schedule Session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
