"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Search,
    UserPlus,
    Trash2,
    Loader2,
    Check,
    Users,
    Award,
    Calendar,
    Clock,
    BookOpen,
    Car,
    AlertCircle,
    MoreVertical,
    Save,
    RefreshCcw,
    ShieldCheck,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"
import {
    searchStudents,
    enrollStudent,
    getEnrolledStudents,
    removeStudentFromClass,
    adminUpdateStudentGrade
} from "@/app/actions/admin"

interface ManageClassClientProps {
    classData: any
    instructors: any[]
}

export function ManageClassClient({ classData: initialClassData, instructors }: ManageClassClientProps) {
    const router = useRouter()
    const [classData] = useState(initialClassData)
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
        loadEnrolledStudents()
    }, [classData.id])

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
            toast.success(`${student.full_name} added to roster`)
            setQuery("")
            setSearchResults([])
            loadEnrolledStudents()
        } catch (error) {
            toast.error("Enrollment failed")
        }
    }

    const handleRemove = async (enrollmentId: string) => {
        if (!confirm("Are you sure you want to remove this student? All grading data will be lost.")) return
        try {
            const result = await removeStudentFromClass(enrollmentId)
            if (result.error) {
                toast.error(result.error)
                return
            }
            toast.success("Student removed")
            loadEnrolledStudents()
        } catch (error) {
            toast.error("Removal failed")
        }
    }

    const handleSaveGrade = async (enrollmentId: string) => {
        const grade = gradeInputs[enrollmentId]
        if (!grade) return

        const g = Number(grade)
        if (isNaN(g) || g < 0 || g > 100) {
            toast.error("Enter a valid grade (0-100)")
            return
        }

        try {
            setSavingGrades(prev => ({ ...prev, [enrollmentId]: true }))
            const result = await adminUpdateStudentGrade(enrollmentId, grade)
            if (result.success) {
                toast.success("Grade updated & certified")
                setInitialGrades(prev => ({ ...prev, [enrollmentId]: grade }))
                loadEnrolledStudents()
            } else {
                toast.error(result.error || "Grade update failed")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setSavingGrades(prev => ({ ...prev, [enrollmentId]: false }))
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Navigation & Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/admin/manage-class')}
                    className="rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Button>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <span className="hover:text-slate-600 cursor-pointer" onClick={() => router.push('/admin/manage-class')}>Manage Class</span>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">Class Details</span>
                </div>
            </div>

            {/* Premium Header Card */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-blue-600/20 text-blue-300 border-none rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
                                Driver's Ed
                            </Badge>
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                <Clock className="h-4 w-4" />
                                {classData.time_slot}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase italic">
                            {classData.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                <Car className="h-5 w-5 text-blue-400" />
                                <div className="text-left">
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider leading-none">Instructor</div>
                                    <div className="text-sm font-bold">{classData.instructors?.full_name || "Unassigned"}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                <Calendar className="h-5 w-5 text-emerald-400" />
                                <div className="text-left">
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider leading-none">Start Date</div>
                                    <div className="text-sm font-bold">{format(new Date(classData.start_date + 'T00:00:00'), "MMM d, yyyy")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Student Roster & Grading */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">CLASS ROSTER</CardTitle>
                                    <CardDescription className="font-medium text-slate-500 mt-1">Manage enrollments and final grades.</CardDescription>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <Users className="h-6 w-6 text-slate-400" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {isLoadingEnrolled ? (
                                <div className="py-20 flex justify-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-blue-500/20" />
                                </div>
                            ) : enrolledStudents.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Table Header */}
                                    <div className="flex items-center px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl mb-4">
                                        <div className="flex-1">Student Particulars</div>
                                        <div className="w-24 text-center">Status</div>
                                        <div className="w-32 text-center">Grade</div>
                                        <div className="w-12"></div>
                                    </div>

                                    {enrolledStudents.map((s) => {
                                        const grade = gradeInputs[s.enrollmentId] || ""
                                        const isModified = grade !== (initialGrades[s.enrollmentId] || "")
                                        const numGrade = parseFloat(grade)
                                        const isPassing = !isNaN(numGrade) && numGrade >= 80

                                        return (
                                            <div key={s.id} className="group flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all duration-300">
                                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0">
                                                    <AvatarImage src={s.avatar_url} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{s.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 truncate">{s.full_name}</div>
                                                    <div className="text-xs text-slate-400 font-medium truncate">{s.email}</div>
                                                </div>

                                                <div className="w-24 text-center shrink-0">
                                                    {s.btw_credits_granted ? (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black tracking-widest uppercase">
                                                            Certified
                                                        </Badge>
                                                    ) : isPassing ? (
                                                        <Badge className="bg-indigo-50 text-indigo-600 border-none rounded-lg text-[9px] font-black tracking-widest uppercase">
                                                            Graduate
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-50 text-slate-300 border-none rounded-lg text-[9px] font-black tracking-widest uppercase">
                                                            Progress
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="w-32 flex items-center gap-2 shrink-0 justify-end">
                                                    <Input
                                                        className={`w-14 h-10 text-center font-black rounded-xl border-slate-100 focus:ring-4 focus:ring-blue-50 transition-all ${isPassing ? "text-emerald-600 bg-emerald-50/50" : "text-slate-900 bg-slate-50"}`}
                                                        value={grade}
                                                        onChange={(e) => setGradeInputs(prev => ({ ...prev, [s.enrollmentId]: e.target.value }))}
                                                        placeholder="-"
                                                        maxLength={3}
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={!isModified || savingGrades[s.enrollmentId]}
                                                        onClick={() => handleSaveGrade(s.enrollmentId)}
                                                        className={`h-10 w-10 rounded-xl transition-all ${isModified ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20" : "text-slate-200"}`}
                                                    >
                                                        {savingGrades[s.enrollmentId] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                </div>

                                                <div className="w-12 flex justify-center shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemove(s.enrollmentId)}
                                                        className="h-9 w-9 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                        <Users className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900">No Students Enrolled</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto">Search and add students using the panel on the right.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Search & Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-lg font-black text-slate-900 tracking-tight">ADD STUDENTS</CardTitle>
                            <CardDescription className="mt-1">Add new students to this course.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all font-medium text-slate-900"
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {searchResults.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                <AvatarImage src={s.avatar_url} />
                                                <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{s.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-900 text-sm truncate">{s.full_name}</div>
                                                <div className="text-[10px] text-slate-500 font-medium truncate">{s.email}</div>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={() => handleEnroll(s)}
                                            className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 shrink-0"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {query.length >= 2 && searchResults.length === 0 && !isSearching && (
                                    <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl">
                                        No students found matching "{query}"
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats / Info Card */}
                    <Card className="border-0 shadow-sm rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Completion Rules</h4>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                            <Award className="h-3 w-3 text-blue-300" />
                                        </div>
                                        <p className="text-sm font-medium leading-tight">Grade of <span className="text-blue-200 font-black">80% or higher</span> required for graduation.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="h-3 w-3 text-emerald-300" />
                                        </div>
                                        <p className="text-sm font-medium leading-tight">Graduation grants <span className="text-emerald-200 font-black">6 hours</span> of practice credits.</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                    <div className="text-3xl font-black">{enrolledStudents.filter(s => s.btw_credits_granted).length}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Certified</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center flex-1">
                                    <div className="text-3xl font-black">{enrolledStudents.length}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Total Roster</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

