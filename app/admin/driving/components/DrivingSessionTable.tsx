'use client'

import { format } from "date-fns"
import { MoreHorizontal, Calendar, CheckCircle2, XCircle, Car } from "lucide-react"
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

interface DrivingSessionTableProps {
    sessions: any[]
    onSelectSession: (session: any) => void
}

export function DrivingSessionTable({ sessions, onSelectSession }: DrivingSessionTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead>Student</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <TableRow
                                key={session.id}
                                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                onClick={() => onSelectSession(session)}
                            >
                                <TableCell>
                                    <div className="font-medium text-gray-900">{session.profiles?.full_name}</div>
                                    <div className="text-xs text-gray-500">{session.profiles?.phone}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-700">{session.instructors?.full_name}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">
                                            {format(new Date(session.start_time), "MMM d, yyyy")}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {session.slotCapacity ? (
                                        <Badge
                                            variant="outline"
                                            className={
                                                session.slotCapacity.booked >= 2
                                                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                                                    : session.slotCapacity.booked === 1
                                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        : 'bg-green-100 text-green-800 border-green-200'
                                            }
                                        >
                                            {session.slotCapacity.booked}/{session.slotCapacity.capacity}
                                            {session.slotCapacity.isFull && ' (Full)'}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {session.vehicles ? (
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Car className="h-3 w-3 mr-1" />
                                            {session.vehicles.name}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        session.status === 'scheduled' ? 'secondary' :
                                            session.status === 'completed' ? 'outline' :
                                                session.status === 'cancelled' ? 'destructive' : 'outline'
                                    } className={
                                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                            session.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' :
                                                session.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''
                                    }>
                                        {session.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectSession(session) }}>
                                                View Details
                                            </DropdownMenuItem>
                                            {session.status === 'scheduled' && (
                                                <DropdownMenuItem
                                                    className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Cancel this session?')) {
                                                            // TODO: implement cancel
                                                            console.log('Cancel session', session.id)
                                                        }
                                                    }}
                                                >
                                                    Cancel Session
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Permanently delete this session?')) {
                                                        // TODO: implement delete
                                                        console.log('Delete session', session.id)
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
                            <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                No driving sessions found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
