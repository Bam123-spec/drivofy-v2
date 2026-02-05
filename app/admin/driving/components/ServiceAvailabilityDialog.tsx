'use client'

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"

interface ServiceAvailabilityDialogProps {
    open: boolean
    onClose: () => void
    service: any | null
}

export function ServiceAvailabilityDialog({ open, onClose, service }: ServiceAvailabilityDialogProps) {
    const [date, setDate] = useState<string>("")
    const [slots, setSlots] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) {
            setDate("")
            setSlots([])
        }
    }, [open])

    useEffect(() => {
        const fetchSlots = async () => {
            if (!service?.plan_key || !date) {
                setSlots([])
                return
            }

            setLoading(true)
            try {
                const response = await fetch(`/api/availability?plan_key=${service.plan_key}&date=${date}`)
                const data = await response.json()
                setSlots(data.slots || [])
            } catch (error) {
                console.error("Error fetching availability:", error)
                toast.error("Failed to load availability")
            } finally {
                setLoading(false)
            }
        }
        fetchSlots()
    }, [service, date])

    const handleCopy = async () => {
        if (!service?.plan_key || !date) {
            toast.error("Pick a date to copy the availability link")
            return
        }
        const url = `${window.location.origin}/api/availability?plan_key=${service.plan_key}&date=${date}`
        await navigator.clipboard.writeText(url)
        toast.success("Availability link copied")
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Availability Preview</DialogTitle>
                    <DialogDescription>
                        {service?.display_name || "Service"} — share or sync these slots to your booking site.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Pick a date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                className="h-11 pl-10 rounded-xl"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <span className="text-slate-600">Sync link for your website</span>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                                Available slots
                            </div>
                            {slots.length === 0 ? (
                                <p className="text-sm text-slate-500">No available slots for this date.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map(slot => {
                                        const dateObj = parseISO(slot)
                                        return (
                                            <div
                                                key={slot}
                                                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700"
                                            >
                                                {format(dateObj, "h:mm a")}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
