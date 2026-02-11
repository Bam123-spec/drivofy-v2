'use client'

import { format } from "date-fns"
import { MoreHorizontal, Calendar, CheckCircle2, XCircle, Car, User, Clock, Settings, Clipboard } from "lucide-react"
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
    const getServiceName = (slug: string | null) => {
        if (!slug) return 'N/A'
        const serviceMap: Record<string, string> = {
            'driving-practice-1hr': 'Driving Practice (1hr)',
            'driving-practice-2hr': 'Driving Practice (2hr)',
            'road-test-1hr': 'Road Test',
            'btw': 'BTW Session',
            'driving-practice-5hr': '5 Hour Class',
            'road_test': 'Road Test Session',
            'ten_hour_package': '10 Hour Package Session',
            'TEN_HOUR': '10 Hour Package Session'
        }
        return serviceMap[slug] || slug
    }

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
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Student</TableHead>
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Instructor</TableHead>
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Schedule</TableHead>
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Service & Vehicle</TableHead>
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Status</TableHead>
                        <TableHead className="h-14 px-6 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.length > 0 ? (
                        sessions.map((session) => {
                            const isReadOnlySource = !!session.source_table && session.source_table !== 'driving_sessions'
                            return (
                            <TableRow
                                key={`${session.source_table || 'driving_sessions'}-${session.id}`}
                                className="group hover:bg-slate-50/40 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                                onClick={() => onSelectSession(session)}
                            >
                                <TableCell className="py-5 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                <AvatarFallback className="bg-slate-900 text-white font-black text-xs">
                                                    {session.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                                <div className={`h-2.5 w-2.5 rounded-full ${session.status === 'scheduled' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-base tracking-tight group-hover:text-primary transition-colors">
                                                {session.profiles?.full_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
                                                {session.student_id?.slice(0, 8)}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 tracking-tight">{session.instructors?.full_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 px-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <Calendar className="h-4 w-4 text-primary opacity-70" />
                                            <span className="text-sm tracking-tight">
                                                {format(new Date(session.start_time), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                                            <Clock className="h-4 w-4 opacity-60" />
                                            <span className="text-[11px] uppercase tracking-wider">
                                                {format(new Date(session.start_time), "h:mm a")} – {format(new Date(session.end_time), "h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 px-6">
                                    <div className="flex flex-col gap-2">
                                        <Badge variant="outline" className="w-fit bg-white text-[10px] font-black uppercase px-2 py-0.5 border-slate-200 tracking-[0.05em] h-auto shadow-sm">
                                            {getServiceName(session.plan_key || session.service_slug)}
                                        </Badge>
                                        {isReadOnlySource && (
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.08em]">
                                                Synced from package flow
                                            </span>
                                        )}
                                        {session.vehicles ? (
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 opacity-80">
                                                <Car className="h-3.5 w-3.5" />
                                                {session.vehicles.name}
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-slate-300 italic font-medium">Unassigned</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 px-6">
                                    <Badge variant="outline" className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.1em] border-0 shadow-sm transition-all ${getStatusStyle(session.status)}`}>
                                        {session.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-5 px-6 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all" onClick={(e) => e.stopPropagation()}>
                                                <Settings className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-heavy p-2 animate-in slide-in-from-top-2 duration-300">
                                            <div className="px-3 py-2.5 mb-1.5 border-b border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Control</p>
                                            </div>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectSession(session) }} className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                                                    <Clipboard className="h-4 w-4" />
                                                </div>
                                                View Summary
                                            </DropdownMenuItem>
                                            {!isReadOnlySource && session.status === 'scheduled' && (
                                                <>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-3 py-2.5 text-sm font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer transition-colors gap-3"
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
                                                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                        Complete Session
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-3 py-2.5 text-sm font-bold text-amber-600 focus:bg-amber-50 focus:text-amber-700 cursor-pointer transition-colors gap-3"
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
                                                        <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">!</div>
                                                        Mark as No-Show
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 focus:bg-slate-50 focus:text-slate-700 cursor-pointer transition-colors gap-3"
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
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                                            <XCircle className="h-4 w-4" />
                                                        </div>
                                                        Cancel Session
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            {!isReadOnlySource ? (
                                                <>
                                                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer transition-colors gap-3"
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
                                                        <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black">×</div>
                                                        Erase History
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.1em] text-slate-400 px-3 py-2">
                                                        Manage this session from package bookings
                                                    </DropdownMenuLabel>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-72 text-center bg-slate-50/20">
                                <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
                                    <div className="h-20 w-20 rounded-[2rem] bg-slate-50 shadow-inner border border-slate-100 flex items-center justify-center text-slate-200">
                                        <Calendar className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No records found</p>
                                        <p className="text-xs text-slate-300 font-medium">Any scheduled or past sessions will appear here.</p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
