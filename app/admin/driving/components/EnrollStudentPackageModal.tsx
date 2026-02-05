'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { grantPackageCredits } from "@/app/actions/adminDriving"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Package } from "lucide-react"

interface EnrollStudentPackageModalProps {
    open: boolean
    onClose: () => void
    students: any[]
    service: any | null
    onSuccess: () => void
}

export function EnrollStudentPackageModal({
    open,
    onClose,
    students,
    service,
    onSuccess
}: EnrollStudentPackageModalProps) {
    const [loading, setLoading] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState("")

    const handleSubmit = async () => {
        if (!selectedStudentId || !service?.id) {
            toast.error("Please select a student")
            return
        }

        setLoading(true)
        try {
            const result = await grantPackageCredits(selectedStudentId, service.id)
            if (result.success) {
                toast.success(`Successfully granted ${result.granted} sessions to student`)
                onSuccess()
                onClose()
            } else {
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to grant credits")
        } finally {
            setLoading(false)
        }
    }

    if (!service) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] bg-white rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
                <div className="bg-orange-50 px-6 py-8 border-b border-orange-100/50 flex flex-col items-center text-center">
                    <div className="h-14 w-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <Package className="h-7 w-7" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900 mb-1">Enroll in Package</DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm max-w-[280px]">
                        Assign <span className="font-bold text-orange-600">{service.display_name}</span> to a student and grant <span className="font-bold text-orange-600">{service.credits_granted} sessions</span>.
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-sm">Select Student</Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white rounded-xl focus:ring-orange-500 font-medium text-slate-900">
                                <SelectValue placeholder="Search or select student..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 rounded-xl shadow-xl border-slate-100">
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id} className="py-3 cursor-pointer rounded-lg hover:bg-slate-50">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{student.full_name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{student.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Package Details</span>
                            <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-400">ID: {service.plan_key}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">Total Credits to Grant</span>
                            <span className="text-sm font-bold text-orange-600">{service.credits_granted} Sessions</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-11 font-semibold text-slate-500">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedStudentId}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold shadow-lg shadow-orange-500/20 transition-all border-0"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Grant Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
