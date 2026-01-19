'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ShieldAlert, User, Calendar, Activity, Loader2 } from "lucide-react"
import { getAuditLogs } from "@/app/actions/audit"
import { toast } from "sonner"

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState<string>("24h")
    const [actionFilter, setActionFilter] = useState<string>("all")
    const [userFilter, setUserFilter] = useState<string>("all")

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true)
            try {
                const data = await getAuditLogs({
                    dateRange: dateFilter,
                    action: actionFilter,
                    userId: userFilter
                })
                setLogs(data || [])
            } catch (error) {
                console.error("Error fetching logs:", error)
                toast.error("Failed to load audit logs")
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [dateFilter, actionFilter, userFilter])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
                <p className="text-gray-500 mt-1">Track important actions taken by admins and instructors across the platform.</p>
            </div>

            {/* Filters & Table */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex flex-wrap gap-3">
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">Last 24 Hours</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* User Filter - Simplified for now as we need to fetch users to populate this dynamically */}
                        {/* <Select value={userFilter} onValueChange={setUserFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Filter by User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                            </SelectContent>
                        </Select> */}
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Filter by Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="login">Login</SelectItem>
                                <SelectItem value="create_class">Create Class</SelectItem>
                                <SelectItem value="create_student">Create Student</SelectItem>
                                <SelectItem value="update_settings">Settings Change</SelectItem>
                                <SelectItem value="billing_change">Billing Action</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="font-semibold text-gray-600 w-[180px]">Timestamp</TableHead>
                                <TableHead className="font-semibold text-gray-600">User</TableHead>
                                <TableHead className="font-semibold text-gray-600">Action</TableHead>
                                <TableHead className="font-semibold text-gray-600">Target</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-right">IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading logs...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-gray-50/50">
                                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                    {log.user?.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-gray-900">{log.user?.full_name || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-500">{log.user?.role || 'user'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white font-normal text-gray-700 border-gray-200">
                                                {log.action}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-0.5">{log.details?.description || ''}</div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-700 font-medium">
                                            {log.target_resource || '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-gray-400 font-mono">
                                            {log.ip_address || 'unknown'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No audit logs found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
