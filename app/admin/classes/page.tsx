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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
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
import { format, isValid, isSameDay, addDays, isBefore } from "date-fns"
import { CreateClassDialog } from "./components/CreateClassDialog"

const formatDateSafe = (dateStr: string | null | undefined, formatStr: string) => {
    if (!dateStr) return "N/A"
    // Parse YYYY-MM-DD as local date to avoid UTC timezone shift
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    if (!isValid(date)) return "Invalid Date"
    return format(date, formatStr)
}
import { ClassDetailSheet } from "./components/ClassDetailSheet"
import { toast } from "sonner"
import { ClassFormData } from "./components/types"

import { ManageCategoriesDialog } from "./components/ManageCategoriesDialog"
import { useMemo } from "react"

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [instructors, setInstructors] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
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
        fetchData()
        fetchInstructors()
    }, [showArchived])

    const fetchInstructors = async () => {
        const { data } = await supabase
            .from('instructors')
            .select('id, full_name')
            .order('full_name')
        if (data) setInstructors(data)
    }

    const fetchData = async () => {
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

            const [clsRes, catRes] = await Promise.all([
                supabase
                    .from('classes')
                    .select(`
                        *,
                        instructors (
                            full_name
                        ),
                        enrollments (count)
                    `)
                    .eq('is_archived', showArchived)
                    .order('start_date', { ascending: true }),
                supabase
                    .from('class_categories')
                    .select('*')
                    .order('created_at', { ascending: true })
            ])

            if (clsRes.error) throw clsRes.error
            setClasses(clsRes.data || [])
            if (catRes.data) setCategories(catRes.data)
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
    const handleSelectAll = (checked: boolean, classIds: string[]) => {
        if (checked) {
            setSelectedIds([...new Set([...selectedIds, ...classIds])])
        } else {
            setSelectedIds(selectedIds.filter(id => !classIds.includes(id)))
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
            fetchData()
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
            fetchData()
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

    // Group Classes by Category
    const groupedClasses = useMemo(() => {
        const groups: { [key: string]: any[] } = {}

        // Initialize groups for all categories
        categories.forEach(cat => {
            groups[cat.id] = []
        })
        groups['uncategorized'] = []

        // Sort classes into groups
        filteredClasses.forEach(cls => {
            if (cls.category_id && groups[cls.category_id]) {
                groups[cls.category_id].push(cls)
            } else {
                groups['uncategorized'].push(cls)
            }
        })

        return groups
    }, [filteredClasses, categories])

    // Helper to render a table for a group of classes
    const renderClassTable = (groupClasses: any[], groupName: string, categoryId?: string) => {
        if (groupClasses.length === 0 && categoryId) return null

        return (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{groupName}</h3>
                    <Badge variant="outline" className="text-xs text-gray-500 bg-white border-gray-200">
                        {groupClasses.length} classes
                    </Badge>
                </div>

                {/* Clean Table Design - No Box/Shadow */}
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-gray-100">
                                <TableHead className="w-[40px] pl-0">
                                    <Checkbox
                                        checked={groupClasses.length > 0 && groupClasses.every(c => selectedIds.includes(c.id))}
                                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, groupClasses.map(c => c.id))}
                                    />
                                </TableHead>
                                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Class Name</TableHead>
                                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Type</TableHead>
                                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Schedule</TableHead>
                                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Instructor</TableHead>
                                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Enrolled</TableHead>
                                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupClasses.length > 0 ? (
                                groupClasses.map((cls) => (
                                    <TableRow
                                        key={cls.id}
                                        className={`group transition-colors cursor-pointer border-b border-gray-50 hover:bg-gray-50/50 ${selectedIds.includes(cls.id) ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                                    >
                                        <TableCell className="pl-0">
                                            <Checkbox
                                                checked={selectedIds.includes(cls.id)}
                                                onCheckedChange={(checked) => handleSelectRow(cls.id, checked as boolean)}
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
                                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-6 font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">
                                                {cls.class_type || 'DE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    {formatDateSafe(cls.start_date, "MMM d")} - {formatDateSafe(cls.end_date, "MMM d, yyyy")}
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
                                                    <span className="text-gray-400 font-normal"> / {cls.capacity || 30}</span>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    capitalize border-0
                                                    ${cls.status === 'active' ? 'bg-green-50 text-green-700' : ''}
                                                    ${cls.status === 'upcoming' ? 'bg-blue-50 text-blue-700' : ''}
                                                    ${cls.status === 'completed' ? 'bg-gray-100 text-gray-700' : ''}
                                                    ${cls.status === 'cancelled' ? 'bg-red-50 text-red-700' : ''}
                                                `}
                                            >
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
                                                        <DropdownMenuItem className="text-red-600">Cancel Class</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                        No classes found in this group.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    if (loading && classes.length === 0) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
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
                        <>
                            <Button variant="outline" onClick={() => setIsManageCategoriesOpen(true)}>
                                Create Row
                            </Button>
                            <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/25">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Class
                            </Button>
                        </>
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search classes..."
                        className="pl-10 bg-white border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-200">
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

            {/* Tabs for Categories */}
            <Tabs defaultValue={categories.length > 0 ? categories[0].id : "uncategorized"} className="w-full">
                <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                    <TabsList className="bg-gray-100/50 p-1 h-auto flex-wrap justify-start">
                        {categories.map(cat => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                {cat.name}
                                <Badge variant="secondary" className="ml-2 bg-gray-200/50 text-gray-500 text-[10px] px-1.5 h-4">
                                    {groupedClasses[cat.id]?.length || 0}
                                </Badge>
                            </TabsTrigger>
                        ))}
                        <TabsTrigger
                            value="uncategorized"
                            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Uncategorized
                            <Badge variant="secondary" className="ml-2 bg-gray-200/50 text-gray-500 text-[10px] px-1.5 h-4">
                                {groupedClasses['uncategorized']?.length || 0}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {categories.map(cat => (
                    <TabsContent key={cat.id} value={cat.id} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {renderClassTable(groupedClasses[cat.id] || [], cat.name, cat.id)}
                    </TabsContent>
                ))}
                <TabsContent value="uncategorized" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    {renderClassTable(groupedClasses['uncategorized'] || [], "Uncategorized")}
                </TabsContent>
            </Tabs>

            <CreateClassDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchData}
            />

            <ManageCategoriesDialog
                open={isManageCategoriesOpen}
                onOpenChange={setIsManageCategoriesOpen}
                onSuccess={fetchData}
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
