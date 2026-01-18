"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { enrollStudent } from "@/app/actions/enrollment"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClassItem {
    id: string
    name: string
    start_date: string
    daily_start_time: string
    daily_end_time: string
    capacity: number
    enrollments: { count: number }[]
}

interface ClassListProps {
    classes: ClassItem[]
    courseType: 'RSEP' | 'DIP'
    userId?: string
}

export function ClassList({ classes, courseType, userId }: ClassListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()

    const handleEnroll = async (classId: string) => {
        if (!userId) {
            toast.error("Please login to enroll")
            router.push("/login")
            return
        }

        setLoadingId(classId)
        try {
            // In a real app, this would redirect to Stripe
            // For now, we simulate direct enrollment
            const result = await enrollStudent(classId, userId, 'paid') // Simulating paid for now

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Successfully enrolled!")
                router.push("/dashboard")
            }
        } catch (error) {
            toast.error("Failed to enroll")
        } finally {
            setLoadingId(null)
        }
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No upcoming {courseType} classes scheduled.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
                const enrolledCount = cls.enrollments?.[0]?.count || 0
                const isFull = enrolledCount >= cls.capacity

                return (
                    <Card key={cls.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{cls.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                {format(new Date(cls.start_date), "MMMM d, yyyy")}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                {cls.daily_start_time} - {cls.daily_end_time}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" />
                                Online / Zoom
                            </div>
                            <div className="text-sm">
                                <span className={isFull ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                                    {isFull ? "Class Full" : `${cls.capacity - enrolledCount} spots left`}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handleEnroll(cls.id)}
                                disabled={isFull || loadingId === cls.id}
                            >
                                {loadingId === cls.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : isFull ? (
                                    "Full"
                                ) : (
                                    "Book Now"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}
