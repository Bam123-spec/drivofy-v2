'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UserPlus, MoreHorizontal, Shield, Mail, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

// Mock Data
type AdminRole = 'owner' | 'manager' | 'staff'
type AdminStatus = 'active' | 'suspended' | 'pending'

interface AdminUser {
    id: string
    name: string
    email: string
    role: AdminRole
    status: AdminStatus
    lastActive: string
}

const MOCK_ADMINS: AdminUser[] = [
    { id: "ADM-001", name: "Sarah Connor", email: "sarah@drivofy.com", role: "owner", status: "active", lastActive: new Date().toISOString() },
    { id: "ADM-002", name: "John Wick", email: "john@drivofy.com", role: "manager", status: "active", lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString() }, // 45 mins ago
    { id: "ADM-003", name: "Ellen Ripley", email: "ellen@drivofy.com", role: "staff", status: "active", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }, // 2 hours ago
    { id: "ADM-004", name: "James Bond", email: "james@drivofy.com", role: "staff", status: "suspended", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }, // 5 days ago
    { id: "ADM-005", name: "Marty McFly", email: "marty@drivofy.com", role: "staff", status: "pending", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }, // 1 day ago (invite sent)
]

export default function AdminUsersPage() {
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [inviteOpen, setInviteOpen] = useState(false)
    const [inviteData, setInviteData] = useState({ name: "", email: "", role: "staff" })

    const filteredAdmins = MOCK_ADMINS.filter(admin => {
        if (roleFilter !== "all" && admin.role !== roleFilter) return false
        if (statusFilter !== "all" && admin.status !== statusFilter) return false
        return true
    })

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Inviting admin:", inviteData)
        toast.success(`Invitation sent to ${inviteData.email}`)
        setInviteOpen(false)
        setInviteData({ name: "", email: "", role: "staff" })
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Users</h1>
                    <p className="text-gray-500 mt-1">Manage staff access and permissions.</p>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                            <UserPlus className="h-4 w-4 mr-2" /> Invite Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite New Admin</DialogTitle>
                            <DialogDescription>
                                Send an invitation to a new staff member to join the admin portal.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Jane Doe"
                                    value={inviteData.name}
                                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="e.g. jane@drivofy.com"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={inviteData.role}
                                    onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                    Managers can manage classes and students. Staff have limited view-only access.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Send Invite</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters & Table */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex flex-wrap gap-3">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="font-semibold text-gray-600">User</TableHead>
                                <TableHead className="font-semibold text-gray-600">Role</TableHead>
                                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                <TableHead className="font-semibold text-gray-600">Last Active</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAdmins.map((admin) => (
                                <TableRow key={admin.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{admin.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {admin.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Shield className={`h-3.5 w-3.5 ${admin.role === 'owner' ? 'text-purple-600' :
                                                    admin.role === 'manager' ? 'text-blue-600' : 'text-gray-500'
                                                }`} />
                                            <span className="capitalize text-sm text-gray-700">{admin.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`
                                            capitalize font-semibold border-0
                                            ${admin.status === 'active' ? 'bg-green-100 text-green-700' :
                                                admin.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}
                                        `}>
                                            {admin.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            {formatDistanceToNow(new Date(admin.lastActive), { addSuffix: true })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
