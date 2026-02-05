"use client"

import { MoreHorizontal, Calendar, Clipboard, Users, UserRound, Clock } from "lucide-react"
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
import { toast } from "sonner"

interface DrivingServicesTableProps {
    services: any[]
    onShowAvailability: (service: any) => void
    onAddStudent: (service: any) => void
}

const formatPrice = (service: any) => {
    if (typeof service?.price === "number") return `$${service.price.toFixed(2)}`
    if (typeof service?.price_cents === "number") return `$${(service.price_cents / 100).toFixed(2)}`
    return "—"
}

export function DrivingServicesTable({ services, onShowAvailability, onAddStudent }: DrivingServicesTableProps) {
    const handleCopyBaseLink = async (planKey?: string) => {
        if (!planKey) {
            toast.error("Missing plan key for this service")
            return
        }
        const url = `${window.location.origin}/api/availability?plan_key=${planKey}&date=YYYY-MM-DD`
        await navigator.clipboard.writeText(url)
        toast.success("Availability link template copied")
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-blue-50/60 border-b border-slate-200">
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Service</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Price</TableHead>
                        <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Schedule</TableHead>
                        <TableHead className="py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                                No driving services found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        services.map(service => (
                            <TableRow key={service.id} className="border-b border-slate-100 last:border-0">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 text-sm">
                                                {service.display_name || service.name || "Untitled Service"}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                                                    {service.plan_key || service.slug || "service"}
                                                </Badge>
                                                {service.instructors?.full_name && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <UserRound className="h-3 w-3" />
                                                        {service.instructors.full_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="text-sm font-semibold text-slate-800">{formatPrice(service)}</div>
                                    {service.duration_minutes && (
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {Math.round(service.duration_minutes / 60)} hr session
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="py-4">
                                    <Button
                                        variant="link"
                                        className="px-0 text-blue-600"
                                        onClick={() => onShowAvailability(service)}
                                    >
                                        Show Availability
                                    </Button>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl p-1">
                                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Actions
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-slate-100" />
                                            <DropdownMenuItem
                                                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
                                                onClick={() => onAddStudent(service)}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Add Student
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
                                                onClick={() => handleCopyBaseLink(service.plan_key)}
                                            >
                                                <Clipboard className="h-4 w-4 mr-2" />
                                                Copy Availability Link
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
