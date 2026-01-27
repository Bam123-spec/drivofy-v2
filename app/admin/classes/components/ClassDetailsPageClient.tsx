"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import { ClassForm } from "../components/ClassForm"
import { AddStudentForm } from "../components/AddStudentForm"
import { Class, Instructor, ClassFormData } from "../components/types"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

interface ClassDetailsPageClientProps {
    classData: Class
    instructors: Instructor[]
}

export function ClassDetailsPageClient({
    classData: initialClassData,
    instructors
}: ClassDetailsPageClientProps) {
    const router = useRouter()
    const [classData, setClassData] = useState<Class>(initialClassData)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpdate = async (data: ClassFormData) => {
        setIsSubmitting(true)
        try {
            const { data: updatedClass, error } = await supabase
                .from('classes')
                .update(data)
                .eq('id', classData.id)
                .select('*, instructors(full_name)')
                .single()

            if (error) throw error

            // Update local state with proper type casting if needed
            setClassData(updatedClass)
            setIsEditMode(false)
            toast.success("Class updated successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update class")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/admin/classes')}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            {classData.name}
                            <Badge variant="outline" className="capitalize font-normal text-sm">
                                {classData.status}
                            </Badge>
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {classData.class_type} • {classData.time_slot}
                        </p>
                    </div>
                </div>
                <Button
                    variant={isEditMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="gap-2"
                >
                    <Edit2 className="h-4 w-4" />
                    {isEditMode ? "Done Editing" : "Edit Details"}
                </Button>
            </div>

            <Separator />

            {/* 1. Class Details (Only visible in edit mode) */}
            {isEditMode && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Configuration</h3>
                    <div className="max-w-2xl">
                        <ClassForm
                            initialData={{
                                name: classData.name,
                                class_type: classData.class_type,
                                start_date: classData.start_date,
                                end_date: classData.end_date,
                                time_slot: classData.time_slot,
                                instructor_id: classData.instructor_id || "",
                                status: classData.status,
                                classification: classData.classification
                            }}
                            instructors={instructors}
                            onSubmit={handleUpdate}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            )}

            {/* 2. Students & Grading (Primary) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Students & Grading</h3>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <AddStudentForm classId={classData.id} isEditMode={isEditMode} />
                </div>
            </div>
        </div>
    )
}
