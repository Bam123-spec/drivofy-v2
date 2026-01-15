'use client'

import { useState } from "react"
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
import { ShieldAlert, User, Calendar, Activity } from "lucide-react"

// Mock Data
type AuditActionType =
    | 'login'
    | 'logout'
    | 'create_class'
    | 'update_class'
    | 'delete_class'
    | 'create_student'
    | 'update_settings'
    | 'billing_change'

interface AuditLogEntry {
    id: string
    timestamp: string
    userName: string
    userEmail: string
    role: string
    actionType: AuditActionType
    actionDescription: string
    target: string
    ipAddress: string
}

const MOCK_LOGS: AuditLogEntry[] = [
    {
        id: "LOG-001",
        timestamp: new Date().toISOString(),
        userName: "Sarah Connor",
        userEmail: "sarah@drivofy.com",
        role: "owner",
        actionType: "update_settings",
        actionDescription: "Updated organization profile",
        target: "General Settings",
        ipAddress: "192.168.1.1"
    },
    {
        id: "LOG-002",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        userName: "John Wick",
        userEmail: "john@drivofy.com",
        role: "manager",
        actionType: "create_class",
        actionDescription: "Created new evening class",
        target: "Class: Evening Zoom Session",
        ipAddress: "10.0.0.42"
    },
    {
        id: "LOG-003",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        userName: "John Wick",
        userEmail: "john@drivofy.com",
        role: "manager",
        actionType: "create_student",
        actionDescription: "Enrolled new student",
        target: "Student: Michael Scott",
        ipAddress: "10.0.0.42"
    },
    {
        id: "LOG-004",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        userName: "Ellen Ripley",
        userEmail: "ellen@drivofy.com",
        role: "staff",
        actionType: "login",
        actionDescription: "User logged in",
        target: "System",
        ipAddress: "172.16.0.5"
    },
    {
        id: "LOG-005",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        userName: "Sarah Connor",
        userEmail: "sarah@drivofy.com",
        role: "owner",
        actionType: "billing_change",
        actionDescription: "Refunded invoice #INV-005",
        target: "Invoice: INV-005",
        ipAddress: "192.168.1.1"
    },
    {
        id: "LOG-006",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        userName: "System",
        userEmail: "system@drivofy.com",
        role: "system",
        actionType: "update_class",
        actionDescription: "Auto-archived completed classes",
        target: "Batch Job",
        ipAddress: "localhost"
    },
]

export default function AuditLogsPage() {
    const [dateFilter, setDateFilter] = useState<string>("24h")
    const [actionFilter, setActionFilter] = useState<string>("all")
    const [userFilter, setUserFilter] = useState<string>("all")

    const filteredLogs = MOCK_LOGS.filter(log => {
        // Date Filter (Simplified for mock)
        if (dateFilter === "24h") {
            const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24)
            if (new Date(log.timestamp) < oneDayAgo) return false
        }

        // Action Filter
        if (actionFilter !== "all" && log.actionType !== actionFilter) return false

        // User Filter
        if (userFilter !== "all" && log.userEmail !== userFilter) return false

        return true
    })

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
                        <Select value={userFilter} onValueChange={setUserFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Filter by User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="sarah@drivofy.com">Sarah Connor</SelectItem>
                                <SelectItem value="john@drivofy.com">John Wick</SelectItem>
                                <SelectItem value="ellen@drivofy.com">Ellen Ripley</SelectItem>
                                <SelectItem value="system@drivofy.com">System</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Filter by Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="login">Login / Logout</SelectItem>
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
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-gray-50/50">
                                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                    {log.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-gray-900">{log.userName}</div>
                                                    <div className="text-[10px] text-gray-500">{log.role}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white font-normal text-gray-700 border-gray-200">
                                                {log.actionType}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-0.5">{log.actionDescription}</div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-700 font-medium">
                                            {log.target}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-gray-400 font-mono">
                                            {log.ipAddress}
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
