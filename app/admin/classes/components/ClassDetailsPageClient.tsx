"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
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
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
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
            setIsDetailsOpen(false)
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

            <Separator />

            {/* 1. Class Details (Collapsible) */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Collapsible
                    open={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    className="bg-gray-50/50"
                >
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex w-full items-center justify-between p-4 hover:bg-gray-100 h-auto">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900">Class Details</span>
                                {!isDetailsOpen && (
                                    <span className="text-xs text-muted-foreground font-normal">
                                        (Click to edit)
                                    </span>
                                )}
                            </div>
                            {isDetailsOpen ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-6 border-t border-gray-100 bg-white">
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
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* 2. Students & Grading (Primary) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Students & Grading</h3>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <AddStudentForm classId={classData.id} />
                </div>
            </div>
        </div>
    )
}
