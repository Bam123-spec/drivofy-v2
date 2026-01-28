'use client'

import { format } from "date-fns"
import { MoreHorizontal, Calendar, CheckCircle2, XCircle, Car, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteDrivingSession, updateSessionStatus } from "@/app/actions/adminDriving"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface DrivingSessionTableProps {
    sessions: any[]
    onSelectSession: (session: any) => void
}

export function DrivingSessionTable({ sessions, onSelectSession }: DrivingSessionTableProps) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'scheduled':
                return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
            case 'completed':
                return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
            case 'cancelled':
                return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
            case 'no_show':
                return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
            default:
                return "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
        }
    }

    return (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Instructor</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date & Time</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vehicle</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                        <TableHead className="py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.length > 0 ? (
                        sessions.map((session, index) => (
                            <TableRow
                                key={session.id}
                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0"
                                onClick={() => onSelectSession(session)}
                            >
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-slate-200 dark:border-white/10 shadow-sm">
                                            <AvatarFallback className="bg-slate-950 text-white dark:bg-slate-900 text-xs font-bold">
                                                {session.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{session.profiles?.full_name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">ID: {session.student_id?.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            <User className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{session.instructors?.full_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="text-sm font-semibold tracking-tight">
                                                {format(new Date(session.start_time), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium">
                                                {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    {session.vehicles ? (
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                                            <Car className="h-3.5 w-3.5" />
                                            {session.vehicles.name}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${getStatusStyle(session.status)}`}>
                                        {session.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl p-1">
                                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Options</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectSession(session) }} className="rounded-lg px-3 py-2 text-sm font-medium focus:bg-slate-50 dark:focus:bg-slate-900 cursor-pointer">
                                                View Details
                                            </DropdownMenuItem>
                                            {session.status === 'scheduled' && (
                                                <>
                                                    <DropdownMenuItem
                                                        className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/30 cursor-pointer"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const promise = updateSessionStatus(session.id, 'completed');
                                                            toast.promise(promise, {
                                                                loading: 'Updating status...',
                                                                success: 'Session completed!',
                                                                error: 'Failed to update'
                                                            });
                                                        }}
                                                    >
                                                        Mark Completed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-lg px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-900/30 cursor-pointer"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const promise = updateSessionStatus(session.id, 'no_show');
                                                            toast.promise(promise, {
                                                                loading: 'Updating status...',
                                                                success: 'Marked as No-Show',
                                                                error: 'Failed to update'
                                                            });
                                                        }}
                                                    >
                                                        Mark No-Show
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Cancel this session?')) {
                                                                const promise = updateSessionStatus(session.id, 'cancelled');
                                                                toast.promise(promise, {
                                                                    loading: 'Cancelling...',
                                                                    success: 'Session cancelled',
                                                                    error: 'Failed to cancel'
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        Cancel Session
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                            <DropdownMenuItem
                                                className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-900/30 cursor-pointer"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Permanently delete this session?')) {
                                                        const promise = deleteDrivingSession(session.id);
                                                        toast.promise(promise, {
                                                            loading: 'Deleting...',
                                                            success: 'Session deleted',
                                                            error: 'Failed to delete'
                                                        });
                                                    }
                                                }}
                                            >
                                                Delete Session
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No driving sessions found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
