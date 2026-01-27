"use client"

import { useState, useEffect } from "react"
import {
    X,
    Search,
    Plus,
    Trash2,
    User,
    Users,
    Loader2,
    Check,
    GraduationCap,
    Clock,
    UserPlus,
    Award,
    ShieldCheck,
    AlertCircle
} from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    searchStudents,
    enrollStudent,
    getEnrolledStudents,
    removeStudentFromClass,
    adminUpdateStudentGrade
} from "@/app/actions/admin"

interface ManageClassSheetProps {
    isOpen: boolean
    onClose: () => void
    classData: any
    onUpdate: () => void
}

export function ManageClassSheet({ isOpen, onClose, classData, onUpdate }: ManageClassSheetProps) {
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
    const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true)

    // Grading states
    const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({})
    const [initialGrades, setInitialGrades] = useState<Record<string, string>>({})
    const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (isOpen && classData?.id) {
            loadEnrolledStudents()
        }
    }, [isOpen, classData])

    const loadEnrolledStudents = async () => {
        setIsLoadingEnrolled(true)
        try {
            const students = await getEnrolledStudents(classData.id)
            setEnrolledStudents(students)

            const initialInputs: Record<string, string> = {}
            students.forEach((s: any) => {
                if (s.grade) initialInputs[s.enrollmentId] = s.grade
            })
            setGradeInputs(initialInputs)
            setInitialGrades(initialInputs)
        } catch (error) {
            toast.error("Failed to load students")
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
        try {
            const result = await enrollStudent(classData.id, student.id)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success(`${student.full_name} enrolled`)
            setQuery("")
            setSearchResults([])
            loadEnrolledStudents()
            onUpdate()
        } catch (error) {
            toast.error("Enrollment failed")
        }
    }

    const handleRemove = async (enrollmentId: string) => {
        if (!confirm("Remove this student from class?")) return
        try {
            const result = await removeStudentFromClass(enrollmentId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success("Student removed")
            loadEnrolledStudents()
            onUpdate()
        } catch (error) {
            toast.error("Removal failed")
        }
    }

    const handleSaveGrade = async (enrollmentId: string) => {
        const grade = gradeInputs[enrollmentId]
        if (!grade) return

        const g = Number(grade)
        if (isNaN(g) || g < 0 || g > 100) {
            toast.error("Invalid grade (0-100)")
            return
        }

        try {
            setSavingGrades(prev => ({ ...prev, [enrollmentId]: true }))
            const result = await adminUpdateStudentGrade(enrollmentId, grade)
            if (result.success) {
                toast.success("Grade saved")
                setInitialGrades(prev => ({ ...prev, [enrollmentId]: grade }))
                loadEnrolledStudents()
                onUpdate()
            } else {
                toast.error(result.error || "Failed to save grade")
            }
        } catch (error) {
            toast.error("Grading failed")
        } finally {
            setSavingGrades(prev => ({ ...prev, [enrollmentId]: false }))
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl p-0 h-full flex flex-col border-l border-slate-100 shadow-2xl overflow-hidden rounded-l-[3rem]">
                <SheetHeader className="p-8 pb-0 shrink-0">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg px-2 text-[10px] font-black tracking-widest uppercase">
                                Class Roster
                            </Badge>
                            <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-2">
                                {classData?.name || "Class Management"}
                            </SheetTitle>
                            <SheetDescription className="text-slate-500 font-medium">
                                Enrolling and grading students for {classData?.instructors?.full_name}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="px-8 mt-6 space-y-6 flex-1 flex flex-col min-h-0">
                    {/* Search & Add Section */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                            placeholder="Search students by name or email..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium text-slate-900 shadow-inner"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                            </div>
                        )}

                        {/* Search Results Popper */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto animate-in slide-in-from-top-2">
                                {searchResults.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleEnroll(s)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-slate-50 shadow-sm">
                                                <AvatarImage src={s.avatar_url} />
                                                <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">
                                                    {s.full_name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-900 text-sm leading-none">{s.full_name}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-1">{s.email}</div>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <UserPlus className="h-4 w-4" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="bg-slate-50" />

                    {/* Roster List */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Enrolled Students ({enrolledStudents.length})</h4>
                        </div>

                        {isLoadingEnrolled ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500/20" />
                            </div>
                        ) : enrolledStudents.length > 0 ? (
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4 pb-12">
                                    {enrolledStudents.map((s) => {
                                        const grade = gradeInputs[s.enrollmentId] || ""
                                        const isModified = grade !== (initialGrades[s.enrollmentId] || "")
                                        const numGrade = parseFloat(grade)
                                        const isPassing = !isNaN(numGrade) && numGrade >= 80

                                        return (
                                            <div key={s.id} className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border-2 border-slate-50 shadow-sm shrink-0">
                                                        <AvatarImage src={s.avatar_url} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{s.full_name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-black text-slate-900 tracking-tight truncate">{s.full_name}</div>
                                                        <div className="text-xs text-slate-400 font-medium truncate mb-2">{s.email}</div>

                                                        {s.btw_credits_granted ? (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black tracking-widest uppercase">
                                                                <Award className="h-2.5 w-2.5 mr-1" />
                                                                Certified
                                                            </Badge>
                                                        ) : isPassing ? (
                                                            <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg text-[9px] font-black tracking-widest uppercase">
                                                                Passing (Pending)
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-slate-50 text-slate-400 border-none rounded-lg text-[9px] font-black tracking-widest uppercase">
                                                                In Progress
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative group/input">
                                                                <Input
                                                                    className={`w-14 h-10 text-center font-black rounded-xl border-slate-100 transition-all ${isPassing ? "text-emerald-600 bg-emerald-50/30 border-emerald-100" : "text-slate-900 bg-slate-50"}`}
                                                                    value={grade}
                                                                    onChange={(e) => setGradeInputs(prev => ({ ...prev, [s.enrollmentId]: e.target.value }))}
                                                                    placeholder="-"
                                                                />
                                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/input:opacity-100 transition-opacity">Grade</div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={!isModified || savingGrades[s.enrollmentId]}
                                                                onClick={() => handleSaveGrade(s.enrollmentId)}
                                                                className={`h-10 rounded-xl px-3 font-bold transition-all ${isModified ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20" : "text-slate-300"}`}
                                                            >
                                                                {savingGrades[s.enrollmentId] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemove(s.enrollmentId)}
                                                            className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-100 mb-8">
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                    <Users className="h-8 w-8 text-slate-200" />
                                </div>
                                <h5 className="font-bold text-slate-900">No Students Enrolled</h5>
                                <p className="text-sm text-slate-500 font-medium">Use the search bar above to add students to this course.</p>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
