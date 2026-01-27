"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Trash2, User, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { searchStudents, enrollStudent, getEnrolledStudents, removeStudentFromClass } from "@/app/actions/admin"
import { Separator } from "@/components/ui/separator"

interface AddStudentFormProps {
    classId: string
    isEditMode?: boolean
}

import { adminUpdateStudentGrade } from "@/app/actions/admin"

// ... imports remain the same

export function AddStudentForm({ classId, isEditMode = false }: AddStudentFormProps) {
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
    const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true)

    // Local state for grading inputs: { [enrollmentId]: "85" }
    const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({})
    const [initialGrades, setInitialGrades] = useState<Record<string, string>>({})
    const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({})

    useEffect(() => {
        loadEnrolledStudents()
    }, [classId])

    const loadEnrolledStudents = async () => {
        setIsLoadingEnrolled(true)
        try {
            const students = await getEnrolledStudents(classId)
            setEnrolledStudents(students)
            // Initialize inputs
            const initialInputs: Record<string, string> = {}
            students.forEach((s: any) => {
                if (s.grade) initialInputs[s.enrollmentId] = s.grade
            })
            setGradeInputs(initialInputs)
            setInitialGrades(initialInputs)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load enrolled students")
        } finally {
            setIsLoadingEnrolled(false)
        }
    }

    // ... search/enroll handlers remain same

    const handleSaveGrade = async (enrollmentId: string) => {
        const grade = gradeInputs[enrollmentId]
        if (!grade) return

        if (isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
            toast.error("Please enter a valid grade (0-100)")
            return
        }

        try {
            setSavingGrades(prev => ({ ...prev, [enrollmentId]: true }))
            const result = await adminUpdateStudentGrade(enrollmentId, grade)
            if (result.success) {
                toast.success(`Grade updated to ${grade}`)
                // Update initial grade to new value so button disables again
                setInitialGrades(prev => ({ ...prev, [enrollmentId]: grade }))
                // Optionally reload to see status/credits updates
                loadEnrolledStudents()
            } else if (result.error) {
                toast.error(result.error)
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to update grade")
        } finally {
            setSavingGrades(prev => ({ ...prev, [enrollmentId]: false }))
        }
    }

    // ... handleEnroll/handleRemove remain same ...
    const handleEnroll = async (student: any) => {
        // ... same existing code ...
        console.log("handleEnroll called for:", student)
        console.log("Class ID:", classId)
        try {
            toast.info("Enrolling...")
            const result = await enrollStudent(classId, student.id)

            if (result.error) {
                setError(result.error)
                toast.error(result.error)
                return
            }
            toast.success(`${student.full_name} added to class`)
            setQuery("")
            setSearchResults([])
            loadEnrolledStudents()
        } catch (error) {
            console.error("handleEnroll error:", error)
            toast.error("Failed to enroll student")
        }
    }

    const handleRemove = async (enrollmentId: string) => {
        if (!confirm("Are you sure you want to remove this student?")) return
        try {
            const result = await removeStudentFromClass(enrollmentId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success("Student removed")
            loadEnrolledStudents()
        } catch (error) {
            toast.error("Failed to remove student")
        }
    }

    // ... search handlers ...
    const handleSearch = async (value: string) => {
        setQuery(value)
        if (value.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const results = await searchStudents(value)
            // Filter out already enrolled students
            const filtered = results.filter((r: any) =>
                !enrolledStudents.some(e => e.id === r.id)
            )
            setSearchResults(filtered)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Search UI only visible in edit mode */}
            {
                isEditMode && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Add Students</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border rounded-md divide-y bg-white shadow-sm max-h-[200px] overflow-y-auto">
                                {searchResults.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={student.avatar_url} />
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{student.full_name}</div>
                                                <div className="text-gray-500 text-xs">{student.email}</div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleEnroll(student)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Plus className="h-4 w-4 mr-1" /> Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Separator />
                    </div>
                )
            }

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Enrolled Students ({enrolledStudents.length})</h3>
                </div>

                {isLoadingEnrolled ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        {/* Header Row */}
                        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="flex-1">Student</div>
                            <div className="w-24 text-center">Grade</div>
                            <div className="w-10"></div>
                        </div>
                        <div className="space-y-3">
                            {enrolledStudents.map((student) => {
                                // Re-parse grade to check passing status locally for UI flair
                                const gradeNum = parseFloat(gradeInputs[student.enrollmentId] || "0")
                                const isPassed = gradeNum >= 80

                                return (
                                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <Avatar className="h-9 w-9 border border-gray-200 bg-white">
                                                <AvatarImage src={student.avatar_url} />
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            <div className="text-sm truncate">
                                                <div className="font-medium text-gray-900 truncate">{student.full_name}</div>
                                                <div className="text-gray-500 text-xs truncate">{student.email}</div>
                                                {student.btw_credits_granted && (
                                                    <div className="text-[10px] text-green-600 font-medium flex items-center gap-1 mt-0.5">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Graduated
                                                    </div>
                                                )}
                                                {!student.btw_credits_granted && isPassed && (
                                                    <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        Passing (pending)
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Grade Input */}
                                        <div className="flex items-center gap-2 w-32 justify-end">
                                            <div className="relative">
                                                <Input
                                                    className={`w-16 text-center h-8 text-sm ${isPassed ? "text-green-700 border-green-200 bg-green-50" : ""}`}
                                                    placeholder="-"
                                                    value={gradeInputs[student.enrollmentId] || ""}
                                                    onChange={(e) => setGradeInputs(prev => ({ ...prev, [student.enrollmentId]: e.target.value }))}
                                                    maxLength={3}
                                                />
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={savingGrades[student.enrollmentId] || (gradeInputs[student.enrollmentId] || "") === (initialGrades[student.enrollmentId] || "")}
                                                onClick={() => handleSaveGrade(student.enrollmentId)}
                                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {savingGrades[student.enrollmentId] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                            </Button>
                                        </div>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 ml-2 ${!isEditMode && 'invisible'}`}
                                            onClick={() => handleRemove(student.enrollmentId)}
                                            disabled={!isEditMode}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                            {enrolledStudents.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No students enrolled yet.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div >
    )
}
