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
    Pencil
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
import { toast } from "sonner"
import { updateStudent, deleteStudent } from "@/app/actions/student"

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

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
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('created_at', { ascending: false })

            if (error) throw error
            setStudents(data || [])
        } catch (error) {
            console.error("Error fetching students:", error)
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
            fetchStudents()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const openEditDialog = (student: any) => {
        setEditingStudent(student)
        setEditForm({
            full_name: student.full_name || "",
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
            fetchStudents()
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
            fetchStudents()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading && students.length === 0) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Students</h1>
                    <p className="text-gray-500 mt-1">Manage all registered students.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg shadow-primary/25">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>
                                    Add a new student to the system. No email will be sent automatically.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={newStudent.full_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        placeholder="john@example.com"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        placeholder="(555) 123-4567"
                                        value={newStudent.phone}
                                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddStudent} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Add Student
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Student</DialogTitle>
                                <DialogDescription>
                                    Update student information.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateStudent} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search students..."
                            className="pl-10 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead>Student</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-gray-100">
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {student.full_name?.charAt(0) || "S"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-gray-900">{student.full_name}</div>
                                                <div className="text-xs text-gray-500">ID: {student.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                                {student.email}
                                            </div>
                                            {student.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                                    {student.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(student.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openEditDialog(student)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Student
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Mail className="mr-2 h-4 w-4" /> Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
