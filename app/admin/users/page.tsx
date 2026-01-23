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
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Users</h1>
                    <p className="text-slate-500 font-medium text-base mt-1">Manage your team, roles, and permissions.</p>
                </div>

                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                        <div className="flex items-center gap-4">
                            <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50/50 w-fit">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 px-3 rounded-lg font-semibold text-xs transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-3.5 w-3.5 mr-1.5" /> Table
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 px-3 rounded-lg font-semibold text-xs transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Grid
                                </Button>
                            </div>

                            <Button onClick={() => setInviteOpen(true)} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all">
                                <UserPlus className="h-4 w-4 mr-2" /> Invite Admin
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
                        <div className="bg-blue-600 px-6 py-8 text-white">
                            <DialogTitle className="text-xl font-bold mb-1">Invite New Admin</DialogTitle>
                            <DialogDescription className="text-blue-100 text-sm">
                                Send an invitation to a new staff member.
                            </DialogDescription>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 space-y-5">
                            <div className="grid gap-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Jane Doe"
                                        value={inviteData.name}
                                        onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jane@drivofy.com"
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="text-slate-700 font-semibold text-sm">System Role</Label>
                                    <Select
                                        value={inviteData.role}
                                        onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                                    >
                                        <SelectTrigger className="h-10 border-slate-200 bg-white rounded-lg">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="staff">Staff Member</SelectItem>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-lg font-semibold shadow-sm"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                    Send invitation
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
                    { label: "Administrators", value: stats.admins, icon: ShieldCheck, color: "indigo", trend: "High Access" },
                    { label: "Managers", value: stats.managers, icon: Activity, color: "emerald", trend: "Course Lead" },
                    { label: "Operations Staff", value: stats.staff, icon: Activity, color: "slate", trend: "Support Role" },
                ].map((stat, i) => (
                    <Card key={i} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <TrendingUp className="h-3 w-3" />
                                    Active
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mt-0.5">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Content Area */}
            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-white p-6 border-b border-slate-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50/50 w-fit">
                            {['all', 'admin', 'manager', 'staff', 'instructor'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={`
                                        px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                                        ${roleFilter === r
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                        }
                                    `}
                                >
                                    {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-9 border-slate-200 rounded-lg text-xs font-semibold bg-white">
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
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                                    <TableHead className="pl-6 font-semibold text-slate-900 uppercase text-[10px] tracking-wider py-4">User</TableHead>
                                    <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Role</TableHead>
                                    <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider text-center">Last Active</TableHead>
                                    <TableHead className="pr-6 text-right font-semibold text-slate-900 uppercase text-[10px] tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAdmins.map((admin) => (
                                    <TableRow key={admin.id} className="group hover:bg-slate-50/30 transition-colors border-slate-50">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold uppercase text-xs">
                                                        {admin.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{admin.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[150px]">{admin.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                                                <Shield className={`h-3 w-3 ${admin.role === 'owner' || admin.role === 'admin' ? 'text-indigo-600' :
                                                    admin.role === 'manager' ? 'text-emerald-600' : 'text-slate-400'
                                                    }`} />
                                                <span className="capitalize">{admin.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`
                                                capitalize font-semibold border-0 text-[10px] px-2 py-0.5 rounded
                                                ${admin.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                                    admin.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-rose-50 text-rose-700'}
                                            `}>
                                                {admin.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
                                                    <Activity className="h-2.5 w-2.5" />
                                                    Online
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium">
                                                    {formatDistanceToNow(new Date(admin.lastActive), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 shadow-xl p-1 bg-white">
                                                    <DropdownMenuLabel className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-0.5 px-2">User Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setEditUser(admin)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm">
                                                        <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => copyToClipboard(admin.email)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm">
                                                        <Copy className="h-3.5 w-3.5 mr-2 text-slate-400" /> Copy Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handlePasswordReset(admin.email)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm">
                                                        <Key className="h-3.5 w-3.5 mr-2 text-slate-400" /> Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                    <DropdownMenuItem
                                                        className="rounded-lg font-semibold py-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-sm"
                                                        onClick={() => setDeleteUser(admin)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Revoke Access
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin) => (
                                        <Card key={admin.id} className="border border-slate-200 bg-white hover:shadow-md transition-shadow rounded-2xl overflow-hidden group">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="relative">
                                                        <Avatar className="h-14 w-14 border-2 border-slate-100 shadow-sm">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                                                                {admin.name?.charAt(0) || "U"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center shadow-sm">
                                                            <Activity className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className={`border-0 px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wide ${admin.role === 'admin' || admin.role === 'owner'
                                                        ? 'bg-indigo-50 text-indigo-600'
                                                        : admin.role === 'manager'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-slate-50 text-slate-600'
                                                        }`}>
                                                        {admin.role}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{admin.name}</h3>
                                                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide truncate">{admin.email}</p>
                                                </div>

                                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Active</span>
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {admin.lastActive ? formatDistanceToNow(new Date(admin.lastActive), { addSuffix: true }) : 'Never'}
                                                        </span>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider">
                                                                Actions
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 shadow-xl p-1 bg-white">
                                                            <DropdownMenuLabel className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-0.5 px-2">Member Tools</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => setEditUser(admin)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm">
                                                                <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" /> Edit Member
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePasswordReset(admin.email)} className="rounded-lg font-semibold py-2 cursor-pointer text-sm">
                                                                <Key className="h-3.5 w-3.5 mr-2 text-slate-400" /> Reset Password
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                            <DropdownMenuItem
                                                                className="rounded-lg font-semibold py-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-sm"
                                                                onClick={() => {
                                                                    setDeleteUser(admin);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Revoke Access
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
                                        <p className="text-slate-500 font-semibold text-sm">No team members found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
                <DialogContent className="rounded-2xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
                    <div className="bg-slate-900 px-6 py-8 text-white">
                        <DialogTitle className="text-xl font-bold mb-1">Edit User</DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            Update profile for {editUser?.name}.
                        </DialogDescription>
                    </div>
                    {editUser && (
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
                            <div className="grid gap-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-name" className="text-slate-700 font-semibold text-sm">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                        value={editUser.name}
                                        onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-role" className="text-slate-700 font-semibold text-sm">Role</Label>
                                    <Select
                                        value={editUser.role}
                                        onValueChange={(val) => setEditUser({ ...editUser, role: val as AdminRole })}
                                    >
                                        <SelectTrigger className="h-10 border-slate-200 bg-white rounded-lg">
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
                            </div>
                            <DialogFooter className="gap-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setEditUser(null)} className="rounded-lg font-semibold h-10">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isActionLoading} className="bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold h-10 px-6 shadow-sm">
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
                <DialogContent className="rounded-2xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
                    <div className="bg-rose-600 px-6 py-8 text-white">
                        <DialogTitle className="text-xl font-bold mb-1">Delete User</DialogTitle>
                        <DialogDescription className="text-rose-100 text-sm">
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This will permanently remove their account and all associated access.
                        </p>
                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => setDeleteUser(null)} className="rounded-lg font-semibold h-10">
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteUser}
                                disabled={isActionLoading}
                                className="rounded-lg font-semibold h-10 px-6 shadow-sm bg-rose-600 hover:bg-rose-700"
                            >
                                {isActionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Delete Permanently
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
