import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { ClassForm } from "./ClassForm"
import { Class, Instructor, ClassFormData } from "./types"
import { AddStudentForm } from "./AddStudentForm"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ClassDetailSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    classData: Class | null
    instructors: Instructor[]
    onUpdate: (data: ClassFormData) => Promise<void>
    defaultTab?: "details" | "students" // Deprecated but kept for compat
}

export function ClassDetailSheet({
    open,
    onOpenChange,
    classData,
    instructors,
    onUpdate,
}: ClassDetailSheetProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto bg-white text-gray-900 w-full">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center justify-between">
                        <span>Edit Class</span>
                        {classData && (
                            <Badge variant="outline" className="ml-2 capitalize">
                                {classData.status}
                            </Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Manage class details and enrolled students.
                    </SheetDescription>
                </SheetHeader>

                {classData && (
                    <div className="space-y-6">
                        {/* 1. Collapsible Class Details */}
                        <Collapsible
                            open={isDetailsOpen}
                            onOpenChange={setIsDetailsOpen}
                            className="border rounded-md bg-gray-50/50"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex w-full items-center justify-between p-4 hover:bg-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">Class Details</span>
                                        {!isDetailsOpen && (
                                            <span className="text-xs text-muted-foreground font-normal">
                                                ({classData.name} • {classData.class_type})
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
                            <CollapsibleContent className="p-4 pt-0 border-t border-gray-100 bg-white">
                                <div className="pt-4">
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
                                        onSubmit={async (data) => {
                                            await onUpdate(data)
                                            setIsDetailsOpen(false)
                                        }}
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* 2. Students Section (Primary) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-gray-900">Students & Grading</h3>
                            </div>
                            <AddStudentForm classId={classData.id} />
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
