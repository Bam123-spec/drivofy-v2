'use client'

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { updateDrivingService } from "@/app/actions/adminDriving"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface EditDrivingServiceDialogProps {
    open: boolean
    onClose: () => void
    instructors: any[]
    service: any | null
    onSuccess: () => void
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

export function EditDrivingServiceDialog({
    open,
    onClose,
    instructors,
    service,
    onSuccess
}: EditDrivingServiceDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        display_name: "",
        plan_key: "",
        instructor_ids: [] as string[],
        duration_minutes: "120",
        price: "",
        category: "service",
        credits_granted: "0"
    })

    const usesPriceCents = useMemo(() => {
        if (!service) return false
        return typeof service.price_cents === "number"
    }, [service])

    useEffect(() => {
        if (!service || !open) return
        setFormData({
            display_name: service.display_name || service.name || "",
            plan_key: service.plan_key || service.slug || "",
            instructor_ids: (service.service_package_instructors || [])
                .map((entry: any) => entry.instructor_id)
                .filter(Boolean),
            duration_minutes: service.duration_minutes?.toString() || "120",
            price: service.price_cents !== undefined && service.price_cents !== null
                ? (service.price_cents / 100).toString()
                : service.price !== undefined && service.price !== null
                    ? service.price.toString()
                    : "",
            category: service.category || "service",
            credits_granted: service.credits_granted?.toString() || "0"
        })
    }, [service, open])

    const handleSubmit = async () => {
        if (!service?.id || !formData.display_name || !formData.plan_key || formData.instructor_ids.length === 0) {
            toast.error("Please fill in all required fields")
            return
        }

        const priceValue = formData.price ? Number(formData.price) : null
        if (priceValue !== null && Number.isNaN(priceValue)) {
            toast.error("Price must be a number")
            return
        }

        setLoading(true)
        try {
            await updateDrivingService({
                id: service.id,
                display_name: formData.display_name,
                plan_key: formData.plan_key,
                instructor_ids: formData.instructor_ids,
                duration_minutes: Number(formData.duration_minutes),
                price: usesPriceCents ? undefined : priceValue,
                price_cents: usesPriceCents ? (priceValue !== null ? Math.round(priceValue * 100) : null) : undefined,
                category: formData.category,
                credits_granted: Number(formData.credits_granted)
            })
            toast.success("Service updated")
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error?.message || "Failed to update service")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Edit Driving Service</DialogTitle>
                    <DialogDescription>
                        Update the service details, pricing, and instructor assignment.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Service Name *</Label>
                        <Input
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Plan Key *</Label>
                        <Input
                            value={formData.plan_key}
                            onChange={(e) => setFormData({ ...formData, plan_key: slugify(e.target.value) })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="service">Individual Service</SelectItem>
                                    <SelectItem value="package">Package Program</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Credits Granted</Label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.credits_granted}
                                onChange={(e) => setFormData({ ...formData, credits_granted: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-500 leading-tight">Sessions added to student balance when assigned.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Instructors *</Label>
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-2">
                            {instructors.map(inst => {
                                const checked = formData.instructor_ids.includes(inst.id)
                                return (
                                    <label key={inst.id} className="flex items-center gap-3 text-sm text-slate-700">
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(val) => {
                                                const next = val
                                                    ? [...formData.instructor_ids, inst.id]
                                                    : formData.instructor_ids.filter(id => id !== inst.id)
                                                setFormData({ ...formData, instructor_ids: next })
                                            }}
                                        />
                                        <span>{inst.full_name}</span>
                                    </label>
                                )
                            })}
                        </div>
                        <p className="text-xs text-slate-500">Removing instructors may reduce available slots.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
