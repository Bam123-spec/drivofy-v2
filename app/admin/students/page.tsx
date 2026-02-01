"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Search,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    User,
    FileText,
    Trash2,
    Pencil,
    Users,
    TrendingUp,
    UserPlus,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    Filter,
    LayoutGrid,
    List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { updateStudent, deleteStudent } from "@/app/actions/student"

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<'all' | 'registered' | 'leads'>('all')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

    // Add Student State
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newStudent, setNewStudent] = useState({
        email: "",
        full_name: "",
        phone: ""
    })

    // Edit Student State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<any>(null)
    const [editForm, setEditForm] = useState({
        full_name: "",
        email: "",
        phone: ""
    })

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            setLoading(true)

            // 1. Fetch Registered Students
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('created_at', { ascending: false })

            if (profileError) throw profileError

            // 2. Fetch Website Enrollments (Leads)
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('*')
                .order('enrolled_at', { ascending: false })

            if (enrollError) throw enrollError

            setStudents(profiles || [])
            setLeads(enrollments || [])
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    const handleAddStudent = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newStudent.email,
                    full_name: newStudent.full_name,
                    phone: newStudent.phone,
                    role: 'student'
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to add student')
            }

            toast.success("Student added successfully!")
            setIsAddOpen(false)
            setNewStudent({ email: "", full_name: "", phone: "" })
            fetchAllData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const openEditDialog = (student: any) => {
        setEditingStudent(student)
        setEditForm({
            full_name: student.full_name || student.first_name + ' ' + student.last_name || "",
            email: student.email || "",
            phone: student.phone || ""
        })
        setIsEditOpen(true)
    }

    const handleUpdateStudent = async () => {
        if (!editingStudent) return

        try {
            setLoading(true)
            const result = await updateStudent(editingStudent.id, editForm)

            if (result.error) throw new Error(result.error)

            toast.success("Student updated successfully")
            setIsEditOpen(false)
            fetchAllData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteStudent = async (studentId: string, type: 'registered' | 'lead') => {
        if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return

        try {
            setLoading(true)
            const result = await deleteStudent(studentId, type)

            if (result.error) throw new Error(result.error)

            toast.success("Student deleted successfully")
            fetchAllData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Merge logic: Combine profiles and enrollments uniquely by email
    const unifiedData = () => {
        const profileEmails = new Set(students.map(s => s.email.toLowerCase()))

        const combined = [
            ...students.map(s => ({ ...s, type: 'registered' })),
            ...leads
                .filter(l => !profileEmails.has(l.email?.toLowerCase()))
                .map(l => ({
                    ...l,
                    full_name: `${l.first_name} ${l.last_name}`,
                    created_at: l.enrolled_at,
                    type: 'lead'
                }))
        ]

        return combined
            .filter(item =>
                (filter === 'all') ||
                (filter === 'registered' && item.type === 'registered') ||
                (filter === 'leads' && item.type === 'lead')
            )
            .filter(item =>
                item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    const displayData = unifiedData()
    const stats = {
        total: students.length + leads.filter(l => !students.some(s => s.email === l.email)).length,
        registered: students.length,
        leads: leads.filter(l => !students.some(s => s.email === l.email)).length,
        recent: displayData.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    }

    if (loading && students.length === 0) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <div className="relative h-16 w-16">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 absolute inset-0 opacity-20" />
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                </div>
                <p className="text-slate-500 font-medium animate-pulse">Loading students and leads...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Students & Leads</h1>
                    <p className="text-slate-500 font-medium text-base mt-1">Manage registrations and website enrollment inquiries.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-0 overflow-hidden max-w-md text-slate-900">
                        <div className="bg-white px-6 py-8 border-b border-slate-100">
                            <DialogTitle className="text-xl font-bold text-slate-900 mb-1">New Student</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm">
                                Invite a new student to the platform.
                            </DialogDescription>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">Full Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500 text-slate-900 placeholder:text-slate-500 font-medium"
                                        value={newStudent.full_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">Email Address</Label>
                                    <Input
                                        placeholder="john@example.com"
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500 text-slate-900 placeholder:text-slate-500 font-medium"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">Phone Number</Label>
                                    <Input
                                        placeholder="(555) 000-0000"
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500 text-slate-900 placeholder:text-slate-500 font-medium"
                                        value={newStudent.phone}
                                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-lg font-semibold h-10">Cancel</Button>
                                <Button onClick={handleAddStudent} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold h-10 px-6 shadow-sm">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    Create Account
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Main Content Area - Flattened */}
            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search by name, email..."
                            className="h-11 pl-11 pr-4 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-blue-500 font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex border border-slate-200 p-1 rounded-xl bg-white shadow-sm w-fit">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setViewMode('table')}
                            >
                                <List className="h-3.5 w-3.5 mr-1.5" /> Table
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Grid
                            </Button>
                        </div>

                        <div className="flex border border-slate-200 p-1 rounded-xl bg-white shadow-sm w-fit">
                            {(['all', 'registered', 'leads'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === t
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={viewMode === 'table' ? "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" : ""}>
                    {viewMode === 'table' ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-200">
                                    <TableHead className="pl-6 font-semibold text-slate-900 uppercase text-[10px] tracking-wider py-4">Student Info</TableHead>
                                    <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Contact</TableHead>
                                    <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Type</TableHead>
                                    <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Added Date</TableHead>
                                    <TableHead className="pr-6 text-right font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayData.length > 0 ? (
                                    displayData.map((student) => (
                                        <TableRow key={student.id} className="group hover:bg-slate-50/30 transition-colors border-slate-200 even:bg-slate-50/50">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={student.avatar_url} />
                                                            <AvatarFallback className={`bg-${student.type === 'registered' ? 'blue' : 'orange'}-100 text-${student.type === 'registered' ? 'blue' : 'orange'}-600 font-bold text-sm`}>
                                                                {student.full_name?.charAt(0) || "S"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border border-white ${student.type === 'registered' ? 'bg-blue-500' : 'bg-orange-500'} flex items-center justify-center`}>
                                                            {student.type === 'registered' ? <CheckCircle2 className="h-2 w-2 text-white" /> : <TrendingUp className="h-2 w-2 text-white" />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{student.full_name}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium tracking-tight">ID: {student.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center text-slate-600 text-xs font-medium">
                                                        <Mail className="h-3 w-3 text-slate-400 mr-2" />
                                                        {student.email}
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center text-slate-600 text-xs font-medium">
                                                            <Phone className="h-3 w-3 text-slate-400 mr-2" />
                                                            {student.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={`border-0 px-2.5 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wide ${student.type === 'registered'
                                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-50'
                                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-50'
                                                    }`}>
                                                    {student.type === 'registered' ? 'Registered' : 'Lead'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-slate-500 text-xs font-medium">
                                                    <Calendar className="h-3.5 w-3.5 mr-2 text-slate-300" />
                                                    {new Date(student.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 shadow-xl p-1 bg-white">
                                                        <DropdownMenuLabel className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-0.5 px-2">Management</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditDialog(student)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
                                                            <Pencil className="mr-2 h-3.5 w-3.5 text-blue-500" /> Edit Info
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg font-semibold py-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
                                                            <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" /> Message
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                        <DropdownMenuItem
                                                            className="rounded-lg font-semibold py-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-sm"
                                                            onClick={() => handleDeleteStudent(student.id, student.type)}
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Terminate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-slate-200" />
                                                </div>
                                                <p className="text-slate-500 font-semibold text-sm">No students or leads found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayData.length > 0 ? (
                                    displayData.map((student) => (
                                        <Card key={student.id} className="border border-slate-200 bg-white hover:shadow-md transition-shadow rounded-2xl overflow-hidden group">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="relative">
                                                        <Avatar className="h-14 w-14 border-2 border-slate-100 shadow-sm">
                                                            <AvatarImage src={student.avatar_url} />
                                                            <AvatarFallback className={`bg-${student.type === 'registered' ? 'blue' : 'orange'}-100 text-${student.type === 'registered' ? 'blue' : 'orange'}-600 font-bold text-lg`}>
                                                                {student.full_name?.charAt(0) || "S"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-white ${student.type === 'registered' ? 'bg-blue-500' : 'bg-orange-500'} flex items-center justify-center shadow-sm`}>
                                                            {student.type === 'registered' ? <CheckCircle2 className="h-3 w-3 text-white" /> : <TrendingUp className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className={`border-0 px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wide ${student.type === 'registered'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {student.type === 'registered' ? 'Student' : 'Lead'}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-0.5">
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{student.full_name}</h3>
                                                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">ID: {student.id.slice(0, 8)}</p>
                                                </div>

                                                <div className="space-y-2.5 pt-1">
                                                    <div className="flex items-center text-slate-600 font-semibold text-xs">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400 mr-2.5 shrink-0" />
                                                        <span className="truncate">{student.email}</span>
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center text-slate-600 font-semibold text-xs">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400 mr-2.5 shrink-0" />
                                                            <span className="truncate">{student.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="flex items-center text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                                                        <Calendar className="h-3 w-3 mr-1.5" />
                                                        {new Date(student.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider">
                                                                Actions
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 shadow-xl p-1 bg-white">
                                                            <DropdownMenuItem onClick={() => openEditDialog(student)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
                                                                <Pencil className="mr-2 h-3.5 w-3.5 text-blue-500" /> Edit Info
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-lg font-semibold py-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
                                                                <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" /> Message
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                            <DropdownMenuItem
                                                                className="rounded-lg font-semibold py-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-sm"
                                                                onClick={() => handleDeleteStudent(student.id, student.type)}
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Terminate
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <Users className="h-6 w-6 text-slate-200" />
                                        </div>
                                        <p className="text-slate-500 font-semibold text-sm">No results found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Dialog - Reused and restyled */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-0 overflow-hidden max-w-md text-slate-900">
                    <div className="bg-white px-6 py-8 border-b border-slate-100">
                        <DialogTitle className="text-xl font-bold text-slate-900 mb-1">Edit Record</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            Modify the student information.
                        </DialogDescription>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-sm">Full Name</Label>
                                <Input
                                    className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500 text-slate-900 font-medium"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-sm">Email</Label>
                                <Input
                                    className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500 text-slate-900 font-medium"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-sm">Phone</Label>
                                <Input
                                    className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500 text-slate-900 font-medium"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-lg font-semibold h-10">Discard</Button>
                            <Button onClick={handleUpdateStudent} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold h-10 px-6 shadow-sm">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
