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
import { UserPlus, MoreHorizontal, Shield, Mail, Clock, Loader2, Edit2, Trash2, Key, Ban, CheckCircle2, Copy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteAdminUser, updateAdminUser, sendPasswordReset } from "@/app/actions/adminUsers"

import { supabase } from "@/lib/supabaseClient"
import { useEffect } from "react"

// Real Roles & Statuses
type AdminRole = 'owner' | 'manager' | 'staff' | 'admin'
type AdminStatus = 'active' | 'suspended' | 'pending'

interface AdminUser {
    id: string
    name: string
    email: string
    role: AdminRole
    status: AdminStatus
    lastActive: string
}

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [inviteOpen, setInviteOpen] = useState(false)
    const [inviteData, setInviteData] = useState({ name: "", email: "", role: "staff" })

    // Action Dialogs State
    const [editUser, setEditUser] = useState<AdminUser | null>(null)
    const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .not('role', 'eq', 'student')
                .order('full_name', { ascending: true })

            if (error) throw error

            const formattedAdmins: AdminUser[] = (data || []).map(p => ({
                id: p.id,
                name: p.full_name || "Unknown",
                email: p.email || "",
                role: p.role as AdminRole,
                status: 'active', // Default for now as we don't have a status column in profiles
                lastActive: p.updated_at || p.created_at
            }))

            setAdmins(formattedAdmins)
        } catch (error) {
            console.error("Error fetching admins:", error)
            toast.error("Failed to load admin users")
        } finally {
            setLoading(false)
        }
    }

    const filteredAdmins = admins.filter(admin => {
        if (roleFilter !== "all" && admin.role !== roleFilter) return false
        if (statusFilter !== "all" && admin.status !== statusFilter) return false
        return true
    })

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsActionLoading(true)
        try {
            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteData.email,
                    full_name: inviteData.name,
                    role: inviteData.role,
                }),
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Failed to send invitation')

            toast.success(`Invitation sent to ${inviteData.email}`)
            setInviteOpen(false)
            setInviteData({ name: "", email: "", role: "staff" })
            fetchAdmins()
        } catch (error: any) {
            console.error("Invite error:", error)
            toast.error(error.message || "Failed to send invitation")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editUser) return
        setIsActionLoading(true)
        try {
            const res = await updateAdminUser(editUser.id, {
                full_name: editUser.name,
                role: editUser.role
            })
            if (!res.success) throw new Error(res.error)
            toast.success("User updated successfully")
            setEditUser(null)
            fetchAdmins()
        } catch (error: any) {
            toast.error(error.message || "Failed to update user")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!deleteUser) return
        setIsActionLoading(true)
        try {
            const res = await deleteAdminUser(deleteUser.id)
            if (!res.success) throw new Error(res.error)
            toast.success("User deleted successfully")
            setDeleteUser(null)
            fetchAdmins()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete user")
        } finally {
            setIsActionLoading(false)
        }
    }

    const handlePasswordReset = async (email: string) => {
        try {
            const res = await sendPasswordReset(email)
            if (!res.success) throw new Error(res.error)
            toast.success("Password reset link generated (see console for implementation)")
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset link")
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
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
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
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
                                            <Shield className={`h-3.5 w-3.5 ${admin.role === 'owner' || admin.role === 'admin' ? 'text-purple-600' :
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => setEditUser(admin)}>
                                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => copyToClipboard(admin.email)}>
                                                    <Copy className="h-4 w-4 mr-2" /> Copy Email
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePasswordReset(admin.email)}>
                                                    <Key className="h-4 w-4 mr-2" /> Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={() => setDeleteUser(admin)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update profile information for {editUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    {editUser && (
                        <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editUser.name}
                                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editUser.role}
                                    onValueChange={(val) => setEditUser({ ...editUser, role: val as AdminRole })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isActionLoading}>
                                    {isActionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action will permanently remove their account and access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={isActionLoading}
                        >
                            {isActionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
