"use client"

import { MoreHorizontal, Calendar, Clipboard, Users, UserRound, Clock, Settings } from "lucide-react"
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
import Link from "next/link"

interface DrivingServicesTableProps {
    services: any[]
    onShowAvailability: (service: any) => void
    onAddStudent: (service: any) => void
    onEditService: (service: any) => void
}

const formatPrice = (service: any) => {
    if (typeof service?.price === "number") return `$${service.price.toFixed(2)}`
    if (typeof service?.price_cents === "number") return `$${(service.price_cents / 100).toFixed(2)}`
    return "—"
}

export function DrivingServicesTable({ services, onShowAvailability, onAddStudent, onEditService }: DrivingServicesTableProps) {
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
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Service Details</TableHead>
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Pricing</TableHead>
                        <TableHead className="h-14 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Scheduling</TableHead>
                        <TableHead className="h-14 px-6 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="py-20 text-center text-sm text-slate-400 font-medium">
                                No driving services found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        services.map(service => (
                            <TableRow key={service.id} className="group hover:bg-slate-50/40 transition-colors border-b border-slate-50 last:border-0">
                                <TableCell className="py-6 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-base tracking-tight">
                                                    {service.display_name || service.name || "Untitled Service"}
                                                </span>
                                                <Badge
                                                    variant={service.category === 'package' ? 'default' : 'secondary'}
                                                    className={`text-[9px] font-black uppercase px-2 py-0.5 h-auto border-0 tracking-wider ${service.category === 'package' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'bg-blue-500/10 text-primary hover:bg-blue-500/20'}`}
                                                >
                                                    {service.category === 'package' ? 'Package' : 'Standard'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-1 opacity-70">
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{service.plan_key || "N/A"}</span>
                                                </div>
                                                {service.credits_granted > 0 && (
                                                    <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                                                        <Clipboard className="h-3.5 w-3.5 opacity-70" />
                                                        {service.credits_granted} Sessions
                                                    </div>
                                                )}
                                                {service.service_package_instructors?.length > 0 && (
                                                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                                                        <UserRound className="h-3.5 w-3.5" />
                                                        {service.service_package_instructors.length} Instructors
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-lg font-black text-slate-900 tracking-tight">{formatPrice(service)}</div>
                                        {service.duration_minutes && (
                                            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
                                                <Clock className="h-3.5 w-3.5 opacity-60" />
                                                {Math.round(service.duration_minutes / 60)} Hr Session
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200 hover:bg-white hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                                        onClick={() => onShowAvailability(service)}
                                    >
                                        Manage Window
                                    </Button>
                                </TableCell>
                                <TableCell className="py-6 px-6 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                <Settings className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-heavy p-2 animate-in slide-in-from-top-2 duration-300">
                                            <div className="px-3 py-2.5 mb-1.5 border-b border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Controls</p>
                                            </div>
                                            <DropdownMenuItem
                                                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors gap-3"
                                                onClick={() => onAddStudent(service)}
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                {service.category === 'package' ? 'Enroll Student' : 'Add Student'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors gap-3"
                                                onClick={() => onEditService(service)}
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                                    <Settings className="h-4 w-4" />
                                                </div>
                                                Edit Configuration
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                            {service?.service_package_instructors?.length > 0 ? (
                                                <div className="space-y-1">
                                                    {service.service_package_instructors.map((entry: any) => (
                                                        <DropdownMenuItem
                                                            key={entry.instructor_id}
                                                            asChild
                                                            className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors gap-3"
                                                        >
                                                            <Link href={`/admin/instructors/${entry.instructor_id}`}>
                                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                                    <UserRound className="h-4 w-4" />
                                                                </div>
                                                                Manage {entry.instructors?.full_name?.split(' ')[0] || "Staff"}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-3 py-2 text-[10px] font-bold text-slate-300 italic">No assigned staff</div>
                                            )}
                                            <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                            <DropdownMenuItem
                                                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors gap-3"
                                                onClick={() => handleCopyBaseLink(service.plan_key)}
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                                    <Clipboard className="h-4 w-4" />
                                                </div>
                                                Copy Template Link
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
