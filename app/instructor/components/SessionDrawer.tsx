'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { User, Calendar, Clock, Car, CheckCircle2, XCircle, MapPin, Phone } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateSessionStatus, saveSessionReport } from "@/app/actions/instructor"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface SessionDrawerProps {
    session: any | null
    open: boolean
    onClose: () => void
    onUpdate: () => void
}

export function SessionDrawer({ session, open, onClose, onUpdate }: SessionDrawerProps) {
    const [mode, setMode] = useState<'view' | 'report'>('view')
    const [isSaving, setIsSaving] = useState(false)

    // Report State
    const [skills, setSkills] = useState<any>({ steering: 3, braking: 3, observation: 3 })
    const [improvements, setImprovements] = useState("")
    const [homework, setHomework] = useState("")

    if (!session) return null

    const handleStatusUpdate = async (status: string) => {
        setIsSaving(true)
        try {
            await updateSessionStatus(session.id, status)
            toast.success(`Session marked as ${status}`)
            onUpdate()
            onClose()
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveReport = async () => {
        setIsSaving(true)
        try {
            await saveSessionReport(session.id, {
                skills,
                improvements,
                homework
            })
            toast.success("Session report saved!")
            onUpdate()
            onClose()
        } catch (error) {
            toast.error("Failed to save report")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {mode === 'view' ? 'Session Details' : 'Session Report'}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === 'view' ? 'Manage this driving appointment.' : 'Grade student performance.'}
                    </SheetDescription>
                </SheetHeader>

                {mode === 'view' ? (
                    <div className="py-6 space-y-6">
                        {/* Status Banner */}
                        <div className="flex items-center justify-between">
                            <Badge variant={
                                session.status === 'scheduled' ? 'secondary' :
                                    session.status === 'completed' ? 'outline' : 'destructive'
                            } className={
                                session.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''
                            }>
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
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <a href={`tel:${session.profiles?.phone}`} className="hover:underline">{session.profiles?.phone}</a>
                                    </div>
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

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t">
                            {session.status === 'scheduled' && (
                                <>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setMode('report')}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Complete & Report
                                    </Button>
                                    <Button variant="destructive" className="w-full" onClick={() => handleStatusUpdate('cancelled')} disabled={isSaving}>
                                        <XCircle className="mr-2 h-4 w-4" /> Cancel Session
                                    </Button>
                                </>
                            )}
                            {session.status === 'completed' && (
                                <Button variant="outline" className="w-full" onClick={() => setMode('report')}>
                                    View/Edit Report
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-6">
                        {/* Report Form */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Steering Control (1-5)</Label>
                                <Slider
                                    value={[skills.steering]}
                                    max={5} min={1} step={1}
                                    onValueChange={(val) => setSkills({ ...skills, steering: val[0] })}
                                />
                                <div className="text-xs text-right text-gray-500">{skills.steering}/5</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Braking & Acceleration (1-5)</Label>
                                <Slider
                                    value={[skills.braking]}
                                    max={5} min={1} step={1}
                                    onValueChange={(val) => setSkills({ ...skills, braking: val[0] })}
                                />
                                <div className="text-xs text-right text-gray-500">{skills.braking}/5</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Observation & Awareness (1-5)</Label>
                                <Slider
                                    value={[skills.observation]}
                                    max={5} min={1} step={1}
                                    onValueChange={(val) => setSkills({ ...skills, observation: val[0] })}
                                />
                                <div className="text-xs text-right text-gray-500">{skills.observation}/5</div>
                            </div>

                            <div className="space-y-2">
                                <Label>Areas for Improvement</Label>
                                <Textarea
                                    placeholder="e.g. Needs to check mirrors more frequently..."
                                    value={improvements}
                                    onChange={(e) => setImprovements(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Homework / Next Steps</Label>
                                <Textarea
                                    placeholder="e.g. Practice parallel parking..."
                                    value={homework}
                                    onChange={(e) => setHomework(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setMode('view')} className="flex-1">Back</Button>
                            <Button onClick={handleSaveReport} disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">
                                Save Report
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
