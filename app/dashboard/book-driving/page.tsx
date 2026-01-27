"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { bookStudentLesson } from "@/app/actions/studentBooking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Clock, User, Calendar as CalendarIcon, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function BookDrivingPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [instructors, setInstructors] = useState<any[]>([])

    // Form State
    const [selectedInstructorId, setSelectedInstructorId] = useState<string>("")
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [time, setTime] = useState<string>("")
    const [duration, setDuration] = useState<number>(2) // Default 2 hours

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            // Fetch Instructors (Driving only)
            const { data: instructorsData } = await supabase
                .from('instructors')
                .select('id, full_name, type')
                .eq('status', 'active')
                .in('type', ['driving', 'both'])
                .order('full_name')
            setInstructors(instructorsData || [])

        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load booking data")
        } finally {
            setLoading(false)
        }
    }

    const handleBook = async () => {
        if (!selectedInstructorId || !date || !time) {
            toast.error("Please fill in all fields")
            return
        }

        if ((profile?.driving_balance_sessions || 0) <= 0) {
            toast.error("You don't have enough credits to book a lesson.")
            return
        }

        setSubmitting(true)
        try {
            const formattedDate = format(date, 'yyyy-MM-dd')
            const result = await bookStudentLesson({
                instructorId: selectedInstructorId,
                date: formattedDate,
                time,
                duration,
                plan_key: 'btw'
            })

            if (result.success) {
                toast.success("Lesson booked successfully!")
                router.push('/dashboard')
            } else {
                toast.error(result.error || "Failed to book lesson")
            }
        } catch (error) {
            console.error("Booking error:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Book Driving Lesson</h1>
                    <p className="text-muted-foreground">Use your credits to schedule a behind-the-wheel session.</p>
                </div>

                {/* Credit Balance Card */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Your Balance</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">{profile?.driving_balance_sessions || 0}</span>
                                <span className="text-sm text-muted-foreground">sessions remaining</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                ({profile?.driving_balance_hours || 0} hours total)
                            </p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-primary/20" />
                    </CardContent>
                </Card>

                {/* Booking Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Schedule Session</CardTitle>
                        <CardDescription>Select an instructor and time slot.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Instructor Selection */}
                        <div className="space-y-2">
                            <Label>Select Instructor</Label>
                            <Select onValueChange={setSelectedInstructorId} value={selectedInstructorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instructors.map(inst => (
                                        <SelectItem key={inst.id} value={inst.id}>{inst.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2">
                            <Label>Select Date</Label>
                            <div className="rounded-md border p-4 bg-white flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6} // Disable weekends for now? Or allow? Let's allow all future dates.
                                    // Actually, let's disable past dates.
                                    fromDate={new Date()}
                                    className="rounded-md border shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Select onValueChange={setTime} value={time}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="08:00">08:00 AM</SelectItem>
                                        <SelectItem value="10:00">10:00 AM</SelectItem>
                                        <SelectItem value="12:00">12:00 PM</SelectItem>
                                        <SelectItem value="14:00">02:00 PM</SelectItem>
                                        <SelectItem value="16:00">04:00 PM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Select disabled value={duration.toString()}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2">2 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Standard session length</p>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleBook}
                            disabled={submitting || !selectedInstructorId || !date || !time || (profile?.driving_balance_sessions || 0) <= 0}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                "Confirm Booking"
                            )}
                        </Button>

                        {(profile?.driving_balance_sessions || 0) <= 0 && (
                            <p className="text-sm text-center text-red-500">
                                You need at least 1 session credit to book.
                            </p>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
