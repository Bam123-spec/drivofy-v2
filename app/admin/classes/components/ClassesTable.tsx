"use client"

import { format } from "date-fns"
import {
    MoreHorizontal,
    Calendar,
    Clock,
    User,
    Users,
    CheckCircle2,
    Copy,
    Trash2,
    Edit
} from "lucide-react"
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
import { Class } from "./types"

interface ClassesTableProps {
    classes: Class[]
    onEdit: (cls: Class) => void
    onDuplicate: (cls: Class) => void
    onDelete: (cls: Class) => void
    onViewEnrollments: (cls: Class) => void
    onTakeAttendance: (cls: Class) => void
    onAddStudent: (cls: Class) => void
}

export function ClassesTable({
    classes,
    onEdit,
    onDuplicate,
    onDelete,
    onViewEnrollments,
    onTakeAttendance,
    onAddStudent
}: ClassesTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead>Class Name</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.length > 0 ? (
                        classes.map((cls) => (
                            <TableRow
                                key={cls.id}
                                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                onClick={() => onEdit(cls)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900">{cls.name}</div>
                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                            {cls.class_type}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {cls.time_slot}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {format(new Date(cls.start_date), "MMM d")} - {format(new Date(cls.end_date), "MMM d, yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">{cls.instructors?.full_name || "Unassigned"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`capitalize ${getStatusColor(cls.status)}`}>
                                        {cls.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onAddStudent(cls)}>
                                                    <User className="mr-2 h-4 w-4" /> Add Student
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(cls)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Class
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDuplicate(cls)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate Class
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onViewEnrollments(cls)}>
                                                    <Users className="mr-2 h-4 w-4" /> View Enrollments
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onTakeAttendance(cls)}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Take Attendance
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onDelete(cls)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Class
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                No classes found matching your filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
