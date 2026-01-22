"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { ClassForm } from "./ClassForm"
import { Class, Instructor, ClassFormData } from "./types"

interface ClassDetailSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    classData: Class | null
    instructors: Instructor[]
    onUpdate: (data: ClassFormData) => Promise<void>
    defaultTab?: "details" | "students"
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddStudentForm } from "./AddStudentForm"

export function ClassDetailSheet({
    open,
    onOpenChange,
    classData,
    instructors,
    onUpdate,
    defaultTab = "details"
}: ClassDetailSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto bg-white text-gray-900">
                <SheetHeader className="mb-6">
                    <SheetTitle>Edit Class</SheetTitle>
                    <SheetDescription>
                        Manage class details and enrolled students.
                    </SheetDescription>
                </SheetHeader>

                {classData && (
                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="students">Students</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
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
                                onSubmit={onUpdate}
                            />
                        </TabsContent>

                        <TabsContent value="students">
                            <AddStudentForm classId={classData.id} />
                        </TabsContent>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    )
}
