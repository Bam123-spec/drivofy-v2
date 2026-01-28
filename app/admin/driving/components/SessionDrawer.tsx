'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { User, Calendar, Clock, Car, FileText, CheckCircle2, XCircle, MoreVertical, Phone, Mail, MapPin, AlertCircle, Save } from "lucide-react"
import { updateSessionStatus, updateSessionNotes } from "@/app/actions/adminDriving"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"

interface SessionDrawerProps {
    session: any | null
    open: boolean
    onClose: () => void
}

export function SessionDrawer({ session, open, onClose }: SessionDrawerProps) {
    const [notes, setNotes] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (session) {
            setNotes(session.notes || "")
        }
    }, [session])

    if (!session) return null

    const handleStatusUpdate = async (status: string) => {
        setIsSaving(true)
        const promise = updateSessionStatus(session.id, status)
        toast.promise(promise, {
            loading: `Marking as ${status}...`,
            success: () => {
                onClose()
                return `Session ${status}`
            },
            error: "Failed to update status"
        })
        try {
            await promise
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveNotes = async () => {
        setIsSaving(true)
        try {
            await updateSessionNotes(session.id, notes)
            toast.success("Notes saved successfully")
        } catch (error) {
            toast.error("Failed to save notes")
        } finally {
            setIsSaving(false)
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'scheduled':
                return { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Clock className="h-3 w-3" /> }
            case 'completed':
                return { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="h-3 w-3" /> }
            case 'cancelled':
                return { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: <XCircle className="h-3 w-3" /> }
            case 'no_show':
                return { label: 'No Show', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <AlertCircle className="h-3 w-3" /> }
            default:
                return { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: <MoreVertical className="h-3 w-3" /> }
        }
    }

    const statusConfig = getStatusConfig(session.status)

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md p-0 overflow-hidden flex flex-col border-l border-white/5 bg-slate-950 shadow-2xl">
                {/* Premium Header */}
                <div className="relative h-32 bg-slate-900/50 flex items-end p-6 overflow-hidden shrink-0 border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
                    <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest opacity-80 font-bold">
                        #{session.id.slice(0, 8)}
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl">
                            <Car className="h-7 w-7 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Driving Session</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] uppercase font-bold tracking-wider ${statusConfig.color}`}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
                    <div className="p-6 space-y-8">
                        {/* Session Summary Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Date</span>
                                <div className="flex items-center gap-2 text-sm font-bold text-white">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    {format(new Date(session.start_time), "MMM d, yyyy")}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Time Slot</span>
                                <div className="flex items-center gap-2 text-sm font-bold text-white">
                                    <Clock className="h-4 w-4 text-purple-500" />
                                    {format(new Date(session.start_time), "h:mm a")}
                                </div>
                            </div>
                        </div>

                        {/* Student Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Student Information</h3>
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-bold border-white/5 text-slate-500 uppercase tracking-tighter">Profile Card</Badge>
                            </div>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 rounded-xl border border-white/10 shadow-sm shrink-0">
                                    <AvatarFallback className="bg-blue-600/10 text-blue-400 font-bold text-sm uppercase">
                                        {session.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div>
                                        <p className="text-base font-bold text-white leading-none truncate">{session.profiles?.full_name}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Student Member</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                            <span className="truncate">{session.profiles?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                            <span>{session.profiles?.phone || "No phone provided"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator className="bg-white/5" />

                        {/* Instructor & Vehicle */}
                        <section className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instructor</h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="h-8 w-8 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-400 shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{session.instructors?.full_name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate">{session.instructors?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle Assigned</h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                        <Car className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{session.vehicles?.name || "No vehicle assigned"}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Main training fleet</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator className="bg-white/5" />

                        {/* Notes Section */}
                        <section className="space-y-3 pb-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Session Notes</h3>
                                <div className="text-[10px] font-bold text-slate-700">ADMIN ONLY</div>
                            </div>
                            <div className="relative group">
                                <Textarea
                                    placeholder="Add detailed session notes, performance feedback, or internal administrative comments..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[140px] rounded-2xl border-white/10 focus:ring-blue-500 bg-slate-900 resize-none p-4 text-sm leading-relaxed shadow-sm transition-all text-white placeholder:text-slate-600"
                                />
                                <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        onClick={handleSaveNotes}
                                        disabled={isSaving}
                                        className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest px-3 shadow-lg shadow-blue-600/20"
                                    >
                                        {isSaving ? <MoreVertical className="h-3 w-3 animate-pulse" /> : <Save className="h-3 w-3 mr-1.5" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-white/5 shrink-0">
                    <div className="space-y-3">
                        {session.status === 'scheduled' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                                    onClick={() => handleStatusUpdate('completed')}
                                    disabled={isSaving}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-12 rounded-xl bg-white/5 hover:bg-rose-600 hover:text-white border border-white/5 font-bold transition-all active:scale-[0.98] text-slate-300"
                                    onClick={() => handleStatusUpdate('cancelled')}
                                    disabled={isSaving}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="col-span-2 h-12 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white border border-white/5 font-bold transition-all active:scale-[0.98] text-slate-300"
                                    onClick={() => handleStatusUpdate('no_show')}
                                    disabled={isSaving}
                                >
                                    <AlertCircle className="mr-2 h-4 w-4" /> Student No-Show
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-white/5 bg-white/5">
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No further actions required</p>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest h-8"
                            onClick={onClose}
                        >
                            Close Details
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
