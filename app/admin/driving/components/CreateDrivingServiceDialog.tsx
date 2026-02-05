'use client'

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createDrivingService } from "@/app/actions/adminDriving"
import { toast } from "sonner"

interface CreateDrivingServiceDialogProps {
    open: boolean
    onClose: () => void
    instructors: any[]
    onSuccess: () => void
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

export function CreateDrivingServiceDialog({
    open,
    onClose,
    instructors,
    onSuccess
}: CreateDrivingServiceDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        display_name: "",
        plan_key: "",
        instructor_id: "",
        duration_minutes: "120"
    })

    useEffect(() => {
        if (!open) {
            setFormData({
                display_name: "",
                plan_key: "",
                instructor_id: "",
                duration_minutes: "120"
            })
        }
    }, [open])

    const suggestedPlanKey = useMemo(() => {
        if (!formData.display_name) return ""
        return slugify(formData.display_name)
    }, [formData.display_name])

    useEffect(() => {
        if (!formData.plan_key && suggestedPlanKey) {
            setFormData(prev => ({ ...prev, plan_key: suggestedPlanKey }))
        }
    }, [suggestedPlanKey, formData.plan_key])

    const handleSubmit = async () => {
        if (!formData.display_name || !formData.plan_key || !formData.instructor_id) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            await createDrivingService({
                display_name: formData.display_name,
                plan_key: formData.plan_key,
                instructor_id: formData.instructor_id,
                duration_minutes: Number(formData.duration_minutes)
            })
            toast.success("Driving service created")
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error?.message || "Failed to create service")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Create Driving Service</DialogTitle>
                    <DialogDescription>
                        Add a new driving service and connect it to an instructor schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Service Name *</Label>
                        <Input
                            placeholder="Driving Practice (2 Hour)"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Plan Key *</Label>
                        <Input
                            placeholder="driving-practice-2hr"
                            value={formData.plan_key}
                            onChange={(e) => setFormData({ ...formData, plan_key: slugify(e.target.value) })}
                        />
                        <p className="text-xs text-slate-500">Used by the availability sync URL.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Instructor *</Label>
                        <Select value={formData.instructor_id} onValueChange={(val) => setFormData({ ...formData, instructor_id: val })}>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {instructors.map(inst => (
                                    <SelectItem key={inst.id} value={inst.id}>{inst.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <Input
                            type="number"
                            min={30}
                            step={30}
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Create Service"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
