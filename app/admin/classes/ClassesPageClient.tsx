"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Class, Instructor, ClassFormData } from "./components/types"
import { ClassesFilters } from "./components/ClassesFilters"
import { ClassesTable } from "./components/ClassesTable"
import { ClassForm } from "./components/ClassForm"
import { ClassDetailSheet } from "./components/ClassDetailSheet"

interface ClassesPageClientProps {
    initialClasses: Class[]
    instructors: Instructor[]
}

export default function ClassesPageClient({ initialClasses, instructors }: ClassesPageClientProps) {
    const router = useRouter()
    const [classes, setClasses] = useState<Class[]>(initialClasses)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [instructorFilter, setInstructorFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState<Class | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"details" | "students">("details")
    const [classToDelete, setClassToDelete] = useState<Class | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter Logic
    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === "all" || cls.status === statusFilter
        const matchesInstructor = instructorFilter === "all" || cls.instructor_id === instructorFilter
        const matchesType = typeFilter === "all" || cls.class_type === typeFilter
        return matchesSearch && matchesStatus && matchesInstructor && matchesType
    })

    // Actions
    const handleCreate = async (data: ClassFormData) => {
        setIsSubmitting(true)
        try {
            const classesToCreate = []
            const { recurrence_enabled, recurrence_interval_value, recurrence_interval_unit, recurrence_count, ...baseData } = data

            // 1. Prepare the first class
            classesToCreate.push(baseData)

            // 2. If recurrence is enabled, generate additional classes
            if (recurrence_enabled && recurrence_count && recurrence_count > 1) {
                const startDate = new Date(baseData.start_date)
                const endDate = new Date(baseData.end_date)
                const interval = recurrence_interval_value || 1
                const unit = recurrence_interval_unit || 'weeks'

                for (let i = 1; i < recurrence_count; i++) {
                    // Calculate offset in days
                    let daysToAdd = 0
                    if (unit === 'weeks') {
                        daysToAdd = i * interval * 7
                    } else {
                        daysToAdd = i * interval
                    }

                    // Create new dates
                    const newStart = new Date(startDate)
                    newStart.setDate(startDate.getDate() + daysToAdd)

                    const newEnd = new Date(endDate)
                    newEnd.setDate(endDate.getDate() + daysToAdd)

                    classesToCreate.push({
                        ...baseData,
                        start_date: newStart.toISOString().split('T')[0], // YYYY-MM-DD
                        end_date: newEnd.toISOString().split('T')[0],
                        status: 'upcoming' as const
                    })
                }
            }

            // 3. Insert all classes
            const { data: newClasses, error } = await supabase
                .from('classes')
                .insert(classesToCreate)
                .select('*, instructors(full_name)')

            if (error) throw error

            // 4. Update state
            // @ts-ignore - Supabase types might be slightly off with joins
            setClasses([...newClasses, ...classes])
            setIsCreateOpen(false)
            toast.success(`${newClasses.length} class(es) created successfully`)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to create class(es)")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: ClassFormData) => {
        if (!selectedClass) return
        setIsSubmitting(true)
        try {
            const { data: updatedClass, error } = await supabase
                .from('classes')
                .update(data)
                .eq('id', selectedClass.id)
                .select('*, instructors(full_name)')
                .single()

            if (error) throw error

            setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c))
            setIsDetailOpen(false)
            toast.success("Class updated successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update class")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!classToDelete) return
        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', classToDelete.id)

            if (error) throw error

            setClasses(classes.filter(c => c.id !== classToDelete.id))
            setClassToDelete(null)
            toast.success("Class deleted successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete class")
        }
    }

    const handleDuplicate = async (cls: Class) => {
        try {
            const { id, created_at, ...rest } = cls
            // @ts-ignore - instructors is joined but not in insert
            const { instructors, ...insertData } = rest

            const { data: newClass, error } = await supabase
                .from('classes')
                .insert([{
                    ...insertData,
                    name: `${insertData.name} (Copy)`,
                    status: 'upcoming'
                }])
                .select('*, instructors(full_name)')
                .single()

            if (error) throw error

            setClasses([newClass, ...classes])
            toast.success("Class duplicated successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to duplicate class")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classes</h1>
                    <p className="text-gray-500 mt-1">Manage theory sessions and schedules.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/25">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>
                                Schedule a new theory session. Classes are 2 weeks long (Mon-Fri).
                            </DialogDescription>
                        </DialogHeader>
                        <ClassForm
                            instructors={instructors}
                            onSubmit={handleCreate}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <ClassesFilters
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                instructorFilter={instructorFilter}
                setInstructorFilter={setInstructorFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                instructors={instructors}
            />

            <ClassesTable
                classes={filteredClasses}
                onEdit={(cls) => {
                    setSelectedClass(cls)
                    setActiveTab("details")
                    setIsDetailOpen(true)
                }}
                onAddStudent={(cls) => {
                    setSelectedClass(cls)
                    setActiveTab("students")
                    setIsDetailOpen(true)
                }}
                onDuplicate={handleDuplicate}
                onDelete={setClassToDelete}
                onViewEnrollments={(cls) => router.push(`/admin/enrollments?class=${cls.id}`)}
                onTakeAttendance={(cls) => router.push(`/admin/manage-class`)}
            />

            <ClassDetailSheet
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                classData={selectedClass}
                instructors={instructors}
                onUpdate={handleUpdate}
                defaultTab={activeTab}
            />

            <AlertDialog open={!!classToDelete} onOpenChange={(open) => !open && setClassToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the class
                            and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
