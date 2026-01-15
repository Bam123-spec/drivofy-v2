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
}

export function AddStudentForm({ classId }: AddStudentFormProps) {
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
    const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true)

    useEffect(() => {
        loadEnrolledStudents()
    }, [classId])

    const loadEnrolledStudents = async () => {
        setIsLoadingEnrolled(true)
        try {
            const students = await getEnrolledStudents(classId)
            setEnrolledStudents(students)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load enrolled students")
        } finally {
            setIsLoadingEnrolled(false)
        }
    }

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

    const handleEnroll = async (student: any) => {
        console.log("handleEnroll called for:", student)
        console.log("Class ID:", classId)
        try {
            toast.info("Enrolling...")
            const result = await enrollStudent(classId, student.id)
            console.log("Enrollment result:", result)

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
            </div>

            <Separator />

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
                        <div className="space-y-3">
                            {enrolledStudents.map((student) => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-gray-200 bg-white">
                                            <AvatarImage src={student.avatar_url} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{student.full_name}</div>
                                            <div className="text-gray-500 text-xs">{student.email}</div>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                        onClick={() => handleRemove(student.enrollmentId)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {enrolledStudents.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No students enrolled yet.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    )
}
