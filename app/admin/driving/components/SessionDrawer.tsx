'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { User, Calendar, Clock, Car, FileText, CheckCircle2, XCircle } from "lucide-react"
import { updateSessionStatus, updateSessionNotes } from "@/app/actions/adminDriving"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface SessionDrawerProps {
    session: any | null
    open: boolean
    onClose: () => void
}

export function SessionDrawer({ session, open, onClose }: SessionDrawerProps) {
    const [notes, setNotes] = useState(session?.notes || "")
    const [isSaving, setIsSaving] = useState(false)

    if (!session) return null

    const handleStatusUpdate = async (status: string) => {
        setIsSaving(true)
        try {
            await updateSessionStatus(session.id, status)
            toast.success(`Session marked as ${status}`)
            onClose()
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveNotes = async () => {
        setIsSaving(true)
        try {
            await updateSessionNotes(session.id, notes)
            toast.success("Notes saved")
        } catch (error) {
            toast.error("Failed to save notes")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Session Details</SheetTitle>
                    <SheetDescription>
                        Manage this driving appointment.
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Status Banner */}
                    <div className="flex items-center justify-between">
                        <Badge variant={
                            session.status === 'scheduled' ? 'secondary' :
                                session.status === 'completed' ? 'outline' : 'destructive'
                        } className={`text-sm px-3 py-1 ${session.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''
                            }`}>
                            {session.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">ID: {session.id.slice(0, 8)}</span>
                    </div>

                    {/* Student Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Student</h4>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{session.profiles?.full_name}</div>
                                <div className="text-sm text-gray-500">{session.profiles?.email}</div>
                                <div className="text-sm text-gray-500">{session.profiles?.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Instructor</h4>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{session.instructors?.full_name}</div>
                                <div className="text-sm text-gray-500">{session.instructors?.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Time & Vehicle */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-xs font-medium text-gray-500 uppercase">Date</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {format(new Date(session.start_time), "MMM d, yyyy")}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-medium text-gray-500 uppercase">Time</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                            </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase">Vehicle</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <Car className="h-4 w-4 text-gray-400" />
                                {session.vehicles?.name || "No vehicle assigned"}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Notes</h4>
                        <Textarea
                            placeholder="Add session notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={isSaving}>
                            Save Notes
                        </Button>
                    </div>
                </div>

                <SheetFooter className="flex-col gap-2 sm:flex-col">
                    {session.status === 'scheduled' && (
                        <>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('completed')} disabled={isSaving}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={() => handleStatusUpdate('cancelled')} disabled={isSaving}>
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Session
                            </Button>
                        </>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
