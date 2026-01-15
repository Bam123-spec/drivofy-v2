"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Calendar,
    Users,
    Clock,
    Trash2,
    Archive,
    X,
    User,
    Edit,
    CheckCircle2,
    Copy
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CreateClassDialog } from "./components/CreateClassDialog"
import { ClassDetailSheet } from "./components/ClassDetailSheet"
import { toast } from "sonner"
import { ClassFormData } from "./components/types"

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [instructors, setInstructors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    // Edit / Detail State
    const [selectedClass, setSelectedClass] = useState<any | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"details" | "students">("details")

    // Bulk Actions State
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [showArchived, setShowArchived] = useState(false)
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchClasses()
        fetchInstructors()
    }, [showArchived])

    const fetchInstructors = async () => {
        const { data } = await supabase
            .from('instructors')
            .select('id, full_name')
            .order('full_name')
        if (data) setInstructors(data)
    }

    const fetchClasses = async () => {
        try {
            setLoading(true)
            // Check User Role
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                const userIsAdmin = profile?.role === 'admin'
                setIsAdmin(userIsAdmin)
            }

            let query = supabase
                .from('classes')
                .select(`
                    *,
                    instructors (
                        full_name
                    ),
                    enrollments (count)
                `)
                .eq('is_archived', showArchived)
                .order('start_date', { ascending: false })

            const { data, error } = await query

            if (error) throw error
            setClasses(data || [])
            setSelectedIds([]) // Clear selection on refetch
        } catch (error: any) {
            console.error("Error fetching classes:", JSON.stringify(error, null, 2))
            toast.error(error?.message || "Failed to load classes")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (data: ClassFormData) => {
        if (!selectedClass) return
        try {
            const { data: updatedClass, error } = await supabase
                .from('classes')
                .update(data)
                .eq('id', selectedClass.id)
                .select('*, instructors(full_name)')
                .single()

            if (error) throw error

            setClasses(classes.map(c => c.id === updatedClass.id ? { ...updatedClass, enrollments: c.enrollments } : c))
            setIsDetailOpen(false)
            toast.success("Class updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update class")
        }
    }

    // Selection Logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredClasses.map(c => c.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
        }
    }

    // Bulk Actions Logic
    const handleBulkArchive = async () => {
        try {
            setActionLoading(true)
            const { error } = await supabase
                .from('classes')
                .update({ is_archived: true })
                .in('id', selectedIds)

            if (error) throw error

            toast.success(`Archived ${selectedIds.length} classes`)
            setIsArchiveDialogOpen(false)
            fetchClasses()
        } catch (error: any) {
            toast.error("Failed to archive classes")
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleBulkDelete = async () => {
        try {
            setActionLoading(true)
            const { error } = await supabase
                .from('classes')
                .delete()
                .in('id', selectedIds)

            if (error) throw error

            toast.success(`Deleted ${selectedIds.length} classes`)
            setIsDeleteDialogOpen(false)
            fetchClasses()
        } catch (error: any) {
            toast.error("Failed to delete classes")
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || cls.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading && classes.length === 0) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classes</h1>
                    <p className="text-gray-500 mt-1">Manage theory sessions and schedules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg mr-2">
                        <button
                            onClick={() => setShowArchived(false)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!showArchived ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setShowArchived(true)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${showArchived ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Archived
                        </button>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/25">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Class
                        </Button>
                    )}
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="sticky top-4 z-10 bg-white border border-gray-200 shadow-lg rounded-xl p-2 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-4 px-2">
                        <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md text-sm">
                            {selectedIds.length} selected
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-gray-900">
                            Clear Selection
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showArchived && (
                            <Button variant="outline" size="sm" onClick={() => setIsArchiveDialogOpen(true)} className="text-gray-700 hover:bg-gray-50">
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                            </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search classes..."
                            className="pl-10 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={filteredClasses.length > 0 && selectedIds.length === filteredClasses.length}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Enrolled</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClasses.length > 0 ? (
                            filteredClasses.map((cls) => (
                                <TableRow
                                    key={cls.id}
                                    className={`group transition-colors cursor-pointer ${selectedIds.includes(cls.id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50/50'}`}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(cls.id)}
                                            onCheckedChange={(checked) => handleSelectRow(cls.id, checked as boolean)}
                                            aria-label={`Select ${cls.name}`}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-gray-900">{cls.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {cls.daily_start_time?.slice(0, 5)} - {cls.daily_end_time?.slice(0, 5)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>
                                                {format(new Date(cls.start_date), "MMM d")} - {format(new Date(cls.end_date), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-900">
                                            {cls.instructors?.full_name || "Unassigned"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {cls.enrollments?.[0]?.count || 0}
                                                <span className="text-gray-400 font-normal"> / {cls.capacity}</span>
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            cls.status === 'active' ? 'default' :
                                                cls.status === 'completed' ? 'secondary' :
                                                    cls.status === 'cancelled' ? 'destructive' : 'outline'
                                        } className="capitalize">
                                            {cls.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedClass(cls)
                                                        setActiveTab("students")
                                                        setIsDetailOpen(true)
                                                    }}>
                                                        <User className="mr-2 h-4 w-4" /> Add Student
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedClass(cls)
                                                        setActiveTab("details")
                                                        setIsDetailOpen(true)
                                                    }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Class
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>View Attendance</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">Cancel Class</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                    No classes found. {showArchived ? "No archived classes." : "Create one to get started."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateClassDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchClasses}
            />

            <ClassDetailSheet
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                classData={selectedClass}
                instructors={instructors}
                onUpdate={handleUpdate}
                defaultTab={activeTab}
            />

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive classes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            These classes will be moved to the archive and hidden from the active list. You can restore them later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkArchive} disabled={actionLoading}>
                            {actionLoading ? "Archiving..." : "Archive"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete classes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedIds.length} classes. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                            {actionLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
