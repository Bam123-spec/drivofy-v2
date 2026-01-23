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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    UserPlus, MoreHorizontal, Shield, Mail, Clock, Loader2, Edit2, Trash2, Key, Ban, CheckCircle2, Copy, ArrowUpRight, TrendingUp, ShieldCheck, Users, Activity,
    Search,
    Filter,
    LayoutGrid,
    List,
    Pencil
} from "lucide-react"
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
type AdminRole = 'owner' | 'manager' | 'staff' | 'admin' | 'instructor'
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
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
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
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <div className="relative h-16 w-16">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 absolute inset-0 opacity-20" />
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                </div>
                <p className="text-slate-500 font-medium animate-pulse">Loading staff records...</p>
            </div>
        )
    }

    const stats = {
        total: admins.length,
        managers: admins.filter(a => a.role === 'manager').length,
        staff: admins.filter(a => a.role === 'staff').length,
        admins: admins.filter(a => a.role === 'admin' || a.role === 'owner').length
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-1 bg-blue-600 rounded-full" />
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Users</h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Manage your team, roles, and permissions in one centralized dashboard.
                    </p>
                </div>

                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
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

                            <Button onClick={() => setInviteOpen(true)} className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                                <UserPlus className="h-4 w-4 mr-2" /> Invite Admin
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-900">Invite New Admin</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Send a welcome invitation to a new staff member.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-6 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Jane Doe"
                                        value={inviteData.name}
                                        onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                        className="h-11 border-slate-200 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jane@drivofy.com"
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                        className="h-11 border-slate-200 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-slate-700 font-medium">System Role</Label>
                                    <Select
                                        value={inviteData.role}
                                        onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                    >
                                        <SelectTrigger className="h-11 border-slate-200">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="staff">Staff Member</SelectItem>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-slate-400 mt-1 pl-1 italic">
                                        * Managers can manage classes. Staff have limited operational access.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-lg font-semibold shadow-md"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send invitation"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Team", value: stats.total, icon: Users, color: "blue", trend: "+2 this month" },
                    { label: "Administrators", value: stats.admins, icon: ShieldCheck, color: "purple", trend: "High Access" },
                    { label: "Managers", value: stats.managers, icon: Activity, iconColor: "blue", color: "blue", trend: "Course Lead" },
                    { label: "Operations Staff", value: stats.staff, icon: Activity, color: "slate", trend: "Support Role" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <TrendingUp className="h-3 w-3" />
                                    Active
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">{stat.trend}</span>
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-6 border-b border-slate-50 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {['all', 'admin', 'manager', 'staff', 'instructor'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={`
                                        px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                                        ${roleFilter === r
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-400 font-medium mr-2">Status:</div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-9 border-slate-200 text-xs bg-slate-50/50">
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
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {viewMode === 'table' ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="font-semibold text-slate-600 px-6 py-4">User</TableHead>
                                    <TableHead className="font-semibold text-slate-600 px-6 py-4">Role</TableHead>
                                    <TableHead className="font-semibold text-slate-600 px-6 py-4">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-600 px-6 py-4 text-center">Last Active</TableHead>
                                    <TableHead className="font-semibold text-slate-600 px-6 py-4 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAdmins.map((admin) => (
                                    <TableRow key={admin.id} className="hover:bg-gray-50/50">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-slate-100">
                                                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold uppercase text-xs">
                                                        {admin.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">{admin.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                        <Mail className="h-2.5 w-2.5" />
                                                        {admin.email}
                                                    </span>
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
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider mb-0.5">
                                                    <Activity className="h-2.5 w-2.5" />
                                                    Online
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(admin.lastActive), { addSuffix: true })}
                                                </div>
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
                    ) : (
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin) => (
                                        <Card key={admin.id} className="border-0 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden group">
                                            <CardContent className="p-8 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="relative">
                                                        <Avatar className="h-20 w-20 border-4 border-white shadow-2xl">
                                                            {/* AvatarImage src={admin.avatar_url} - avatar_url not in AdminUser */}
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-black text-2xl">
                                                                {admin.name?.charAt(0) || "U"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center shadow-lg">
                                                            <Activity className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>
                                                    <Badge className={`border-0 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase ${admin.role === 'admin' || admin.role === 'owner'
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : admin.role === 'manager'
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                        {admin.role}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{admin.name}</h3>
                                                    <p className="text-[11px] text-slate-400 font-black tracking-widest truncate">{admin.email}</p>
                                                </div>

                                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Active</span>
                                                        <span className="text-sm font-bold text-slate-600">
                                                            {admin.lastActive ? formatDistanceToNow(new Date(admin.lastActive), { addSuffix: true }) : 'Never'}
                                                        </span>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 transition-all">
                                                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-2xl p-2 bg-white ring-1 ring-slate-100">
                                                            <DropdownMenuLabel className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-1 px-3">Management</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => setEditUser(admin)} className="rounded-xl font-bold py-2.5 cursor-pointer">
                                                                <Pencil className="mr-3 h-4 w-4 text-blue-500" /> Edit Member
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePasswordReset(admin.email)} className="rounded-xl font-bold py-2.5 cursor-pointer">
                                                                <Key className="mr-3 h-4 w-4 text-slate-400" /> Reset Password
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                                            <DropdownMenuItem
                                                                className="rounded-xl font-bold py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                                onClick={() => {
                                                                    setDeleteUser(admin);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-3 h-4 w-4" /> Revoke Access
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
                                        <p className="text-slate-500 font-black text-base uppercase tracking-widest">No team members found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
