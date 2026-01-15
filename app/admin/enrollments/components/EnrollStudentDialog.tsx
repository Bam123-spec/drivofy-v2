"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { StudentSelect, StudentOption } from "./StudentSelect"
import { ClassSelect, ClassOption } from "./ClassSelect"

interface EnrollStudentDialogProps {
    onEnrolled?: () => void
}

export function EnrollStudentDialog({ onEnrolled }: EnrollStudentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [students, setStudents] = useState<StudentOption[]>([])
    const [classes, setClasses] = useState<ClassOption[]>([])

    const [selectedStudentId, setSelectedStudentId] = useState<string>("")
    const [selectedClassId, setSelectedClassId] = useState<string>("")

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch active students (role = student)
            const { data: studentsData, error: studentsError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'student')
                .order('full_name')

            if (studentsError) {
                console.error("Error fetching students:", studentsError)
                throw studentsError
            }
            console.log("Fetched students:", studentsData)

            // Fetch active/upcoming classes
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select('id, name, start_date, end_date, status')
                .in('status', ['upcoming', 'active'])
                .order('start_date')

            if (classesError) throw classesError

            setStudents(studentsData.map(s => ({
                id: s.id,
                name: s.full_name || 'Unknown',
                email: s.email
            })))

            setClasses(classesData || [])

        } catch (error) {
            console.error("Error fetching enrollment data:", error)
            toast.error("Failed to load students and classes")
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async () => {
        if (!selectedStudentId || !selectedClassId) return

        setSubmitting(true)
        try {
            // Check for duplicate enrollment
            const { data: existing, error: checkError } = await supabase
                .from('enrollments')
                .select('id')
                .eq('student_id', selectedStudentId)
                .eq('class_id', selectedClassId)
                .maybeSingle() // Use maybeSingle to avoid error on no rows

            if (checkError) {
                console.error("Check duplicate error:", checkError)
                throw checkError
            }

            if (existing) {
                toast.error("Student is already enrolled in this class")
                setSubmitting(false)
                return
            }

            // Insert enrollment
            const { error: insertError } = await supabase
                .from('enrollments')
                .insert({
                    student_id: selectedStudentId,
                    class_id: selectedClassId,
                    status: 'enrolled'
                })

            if (insertError) {
                console.error("Insert error:", insertError)
                throw insertError
            }

            toast.success("Student enrolled successfully")
            setOpen(false)
            setSelectedStudentId("")
            setSelectedClassId("")
            if (onEnrolled) onEnrolled()

        } catch (error: any) {
            console.error("Enrollment error object:", error)
            console.error("Enrollment error string:", JSON.stringify(error, null, 2))
            toast.error(error.message || "Failed to enroll student")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/25">
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll Student
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enroll Student</DialogTitle>
                    <DialogDescription>
                        Add a student to an active class session.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Select Student</Label>
                        <StudentSelect
                            students={students}
                            value={selectedStudentId}
                            onChange={setSelectedStudentId}
                            disabled={loading || submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Select Class</Label>
                        <ClassSelect
                            classes={classes}
                            value={selectedClassId}
                            onChange={setSelectedClassId}
                            disabled={loading || submitting}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEnroll}
                        disabled={!selectedStudentId || !selectedClassId || submitting || loading}
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enroll Student
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
