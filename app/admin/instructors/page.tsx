"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Search,
    Plus,
    LayoutGrid,
    List,
    Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { toast } from "sonner"
import { InstructorCard } from "./components/InstructorCard"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function AdminInstructorsPage() {
    const [instructors, setInstructors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState<string>("all")
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newInstructor, setNewInstructor] = useState({
        email: "",
        full_name: "",
        phone: "",
        license_number: "",
        type: "both"
    })

    useEffect(() => {
        fetchInstructors()
    }, [])

    const fetchInstructors = async () => {
        try {
            const { data, error } = await supabase
                .from('instructors')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setInstructors(data || [])
        } catch (error) {
            console.error("Error fetching instructors:", error)
            toast.error("Failed to load instructors")
        } finally {
            setLoading(false)
        }
    }

    const handleAddInstructor = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newInstructor.email,
                    full_name: newInstructor.full_name,
                    phone: newInstructor.phone,
                    license_number: newInstructor.license_number,
                    type: newInstructor.type,
                    role: 'instructor'
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to invite instructor')
            }

            toast.success("Instructor invited successfully! Check email.")
            setIsAddOpen(false)
            setNewInstructor({ email: "", full_name: "", phone: "", license_number: "", type: "both" })
            setTimeout(fetchInstructors, 1000)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredInstructors = instructors.filter(instructor => {
        const matchesSearch = instructor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            instructor.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = selectedType === "all" || instructor.type === selectedType
        return matchesSearch && matchesType
    })

    if (loading && instructors.length === 0) {
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Instructors</h1>
                    <p className="text-gray-500 mt-1">Manage your driving instructors and their schedules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 mr-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setViewMode('table')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg shadow-primary/25">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Instructor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Instructor</DialogTitle>
                                <DialogDescription>
                                    Invite a new instructor via email.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="Jane Smith"
                                        value={newInstructor.full_name}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        placeholder="jane@drivofy.com"
                                        value={newInstructor.email}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        placeholder="(555) 123-4567"
                                        value={newInstructor.phone}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>License Number</Label>
                                    <Input
                                        placeholder="LIC-123456"
                                        value={newInstructor.license_number}
                                        onChange={(e) => setNewInstructor({ ...newInstructor, license_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Instructor Type</Label>
                                    <Select value={newInstructor.type} onValueChange={(val) => setNewInstructor({ ...newInstructor, type: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="driving">Driving Instructor</SelectItem>
                                            <SelectItem value="theory">Theory Instructor</SelectItem>
                                            <SelectItem value="both">Both</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddInstructor} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Send Invite
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search instructors..."
                        className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full sm:w-[180px] border-none bg-gray-50">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="driving">Driving Only</SelectItem>
                            <SelectItem value="theory">Theory Only</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInstructors.map(instructor => (
                        <InstructorCard key={instructor.id} instructor={instructor} />
                    ))}
                    {filteredInstructors.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No instructors found matching your criteria.
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                <TableHead>Instructor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInstructors.map((instructor) => (
                                <TableRow key={instructor.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-gray-100">
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                    {instructor.full_name?.charAt(0) || "I"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-gray-900">{instructor.full_name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {instructor.type || 'both'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600">{instructor.email}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">
                                        {instructor.license_number || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'} className={instructor.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                                            {instructor.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
