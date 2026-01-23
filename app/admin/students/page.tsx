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

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return

        try {
            setLoading(true)
            const result = await deleteStudent(studentId)

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
        <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-1 bg-blue-600 rounded-full" />
                        <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Students & Leads</h1>
                    <p className="text-slate-500 font-medium text-lg">Manage registrations and website enrollment inquiries in one place.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <UserPlus className="mr-2 h-5 w-5" />
                            Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden">
                        <div className="bg-blue-600 px-8 py-10 text-white">
                            <DialogTitle className="text-3xl font-black mb-2">New Student</DialogTitle>
                            <DialogDescription className="text-blue-100 text-base">
                                Manually invite a student to the Drivofy platform.
                            </DialogDescription>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">Full Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-medium"
                                        value={newStudent.full_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">Email Address</Label>
                                    <Input
                                        placeholder="john@example.com"
                                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-medium"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">Phone Number</Label>
                                    <Input
                                        placeholder="(555) 000-0000"
                                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-medium"
                                        value={newStudent.phone}
                                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="gap-3 sm:gap-0">
                                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold h-12 px-6">Cancel</Button>
                                <Button onClick={handleAddStudent} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold h-12 px-10 shadow-lg shadow-blue-500/10">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    Create Account
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Students", value: stats.total, icon: Users, color: "blue", trend: stats.recent },
                    { label: "Registered", value: stats.registered, icon: CheckCircle2, color: "green", trend: null },
                    { label: "Website Leads", value: stats.leads, icon: TrendingUp, color: "orange", trend: null },
                    { label: "Last 30 Days", value: stats.recent, icon: ArrowUpRight, color: "purple", trend: null },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-600 rounded-2xl group-hover:rotate-6 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                {stat.trend !== null && (
                                    <Badge className="bg-green-50 text-green-600 border-0 font-bold px-3 py-1 rounded-full text-[10px] tracking-wide">
                                        Active
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                <p className="text-slate-400 font-black text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-white p-8 border-b border-slate-50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-xl group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                className="h-14 pl-14 pr-6 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-blue-500 focus:border-blue-500 font-medium text-base shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex border-2 border-slate-100 p-1.5 rounded-2xl bg-slate-50/50 w-fit">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 px-4 rounded-xl font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4 mr-2" /> Table
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 px-4 rounded-xl font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                                </Button>
                            </div>

                            <div className="flex border-2 border-slate-100 p-1.5 rounded-2xl bg-slate-50/50 w-fit">
                                {(['all', 'registered', 'leads'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilter(t)}
                                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === t
                                            ? 'bg-white text-blue-600 shadow-xl shadow-slate-200'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {viewMode === 'table' ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 h-16 border-slate-100">
                                    <TableHead className="pl-8 font-black text-slate-900 uppercase text-[10px] tracking-widest">Student / Lead Info</TableHead>
                                    <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Contact Details</TableHead>
                                    <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Source / Type</TableHead>
                                    <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Added Date</TableHead>
                                    <TableHead className="pr-8 text-right font-black text-slate-900 uppercase text-[10px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayData.length > 0 ? (
                                    displayData.map((student) => (
                                        <TableRow key={student.id} className="group hover:bg-slate-50/30 transition-colors h-24 border-slate-50">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <Avatar className="h-14 w-14 border-4 border-white shadow-xl">
                                                            <AvatarImage src={student.avatar_url} />
                                                            <AvatarFallback className={`bg-${student.type === 'registered' ? 'blue' : 'orange'}-100 text-${student.type === 'registered' ? 'blue' : 'orange'}-600 font-black text-lg`}>
                                                                {student.full_name?.charAt(0) || "S"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${student.type === 'registered' ? 'bg-blue-500' : 'bg-orange-500'} flex items-center justify-center`}>
                                                            {student.type === 'registered' ? <CheckCircle2 className="h-3 w-3 text-white" /> : <TrendingUp className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{student.full_name}</div>
                                                        <div className="text-[10px] text-slate-400 font-black tracking-widest">UUID: {student.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-slate-600 font-medium">
                                                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                                                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                                                        </div>
                                                        {student.email}
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center text-slate-600 font-medium">
                                                            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                                                                <Phone className="h-3.5 w-3.5 text-slate-500" />
                                                            </div>
                                                            {student.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`border-0 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase ${student.type === 'registered'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {student.type === 'registered' ? 'Registered User' : 'Website Inquiry'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-slate-500 font-bold">
                                                    <Calendar className="h-4 w-4 mr-2 text-slate-300" />
                                                    {new Date(student.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-8 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 transition-all">
                                                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-2xl p-2 bg-white ring-1 ring-slate-100">
                                                        <DropdownMenuLabel className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-1 px-3">Management</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditDialog(student)} className="rounded-xl font-bold py-2.5 cursor-pointer">
                                                            <Pencil className="mr-3 h-4 w-4 text-blue-500" /> Edit Information
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer">
                                                            <Mail className="mr-3 h-4 w-4 text-slate-400" /> Message Student
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                                        <DropdownMenuItem
                                                            className="rounded-xl font-bold py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                            onClick={() => handleDeleteStudent(student.id)}
                                                        >
                                                            <Trash2 className="mr-3 h-4 w-4" /> Terminate Access
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-slate-200" />
                                                </div>
                                                <p className="text-slate-500 font-black text-base">No students or leads found match your criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {displayData.length > 0 ? (
                                    displayData.map((student) => (
                                        <Card key={student.id} className="border-0 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden group">
                                            <CardContent className="p-8 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="relative">
                                                        <Avatar className="h-20 w-20 border-4 border-white shadow-2xl">
                                                            <AvatarImage src={student.avatar_url} />
                                                            <AvatarFallback className={`bg-${student.type === 'registered' ? 'blue' : 'orange'}-100 text-${student.type === 'registered' ? 'blue' : 'orange'}-600 font-black text-2xl`}>
                                                                {student.full_name?.charAt(0) || "S"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-4 border-white ${student.type === 'registered' ? 'bg-blue-500' : 'bg-orange-500'} flex items-center justify-center shadow-lg`}>
                                                            {student.type === 'registered' ? <CheckCircle2 className="h-4 w-4 text-white" /> : <TrendingUp className="h-4 w-4 text-white" />}
                                                        </div>
                                                    </div>
                                                    <Badge className={`border-0 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase ${student.type === 'registered'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-orange-100 text-orange-600'
                                                        }`}>
                                                        {student.type === 'registered' ? 'Registered Student' : 'Website Lead'}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{student.full_name}</h3>
                                                    <p className="text-[11px] text-slate-400 font-black tracking-widest uppercase">ID: {student.id.slice(0, 12)}</p>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center text-slate-600 font-bold group/item">
                                                        <div className="h-10 w-10 min-w-10 rounded-xl bg-white flex items-center justify-center mr-4 shadow-sm group-hover/item:text-blue-600 transition-colors">
                                                            <Mail className="h-4 w-4" />
                                                        </div>
                                                        <span className="truncate text-sm">{student.email}</span>
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center text-slate-600 font-bold group/item">
                                                            <div className="h-10 w-10 min-w-10 rounded-xl bg-white flex items-center justify-center mr-4 shadow-sm group-hover/item:text-blue-600 transition-colors">
                                                                <Phone className="h-4 w-4" />
                                                            </div>
                                                            <span className="truncate text-sm">{student.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                    <div className="flex items-center text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                                        <Calendar className="h-3 w-3 mr-2" />
                                                        Joined {new Date(student.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-12 px-6 rounded-2xl hover:bg-slate-100 font-black text-xs uppercase tracking-widest transition-all">
                                                                Actions
                                                                <MoreHorizontal className="h-4 w-4 ml-2" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-2xl p-2 bg-white ring-1 ring-slate-100">
                                                            <DropdownMenuItem onClick={() => openEditDialog(student)} className="rounded-xl font-bold py-2.5 cursor-pointer">
                                                                <Pencil className="mr-3 h-4 w-4 text-blue-500" /> Edit Info
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 cursor-pointer">
                                                                <Mail className="mr-3 h-4 w-4 text-slate-400" /> Message
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                                            <DropdownMenuItem
                                                                className="rounded-xl font-bold py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                                onClick={() => handleDeleteStudent(student.id)}
                                                            >
                                                                <Trash2 className="mr-3 h-4 w-4" /> Terminate
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-[2.5rem]">
                                        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                                            <Users className="h-8 w-8 text-slate-200" />
                                        </div>
                                        <p className="text-slate-500 font-black text-base uppercase tracking-widest">No results found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog - Reused and restyled */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 px-8 py-10 text-white">
                        <DialogTitle className="text-3xl font-black mb-2">Edit Record</DialogTitle>
                        <DialogDescription className="text-slate-400 text-base">
                            Modify the student information below.
                        </DialogDescription>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-900 font-black pl-1">Full Name</Label>
                                <Input
                                    className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-900 font-black pl-1">Email</Label>
                                <Input
                                    className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-900 font-black pl-1">Phone</Label>
                                <Input
                                    className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-3 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl font-bold h-12 px-6">Discard</Button>
                            <Button onClick={handleUpdateStudent} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold h-12 px-10 shadow-lg shadow-blue-500/10">
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
