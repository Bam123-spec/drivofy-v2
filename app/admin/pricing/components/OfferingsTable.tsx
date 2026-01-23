"use client"

import { useState } from "react"
import { Offering } from "@/app/actions/website"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, MoreHorizontal, ExternalLink, Calendar, CheckCircle2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OfferingSheet } from "./OfferingSheet"
import { useRouter } from "next/navigation"

interface OfferingsTableProps {
    offerings: Offering[]
}

export function OfferingsTable({ offerings }: OfferingsTableProps) {
    const router = useRouter()
    const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleEdit = (offering: Offering) => {
        setSelectedOffering(offering)
        setIsSheetOpen(true)
    }

    const handleSaved = () => {
        router.refresh()
    }

    return (
        <>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="pl-6 w-[300px]">Offering Details</TableHead>
                            <TableHead>Pricing</TableHead>
                            <TableHead>Features</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offerings.map((offering) => (
                            <TableRow key={offering.id} className="group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="pl-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{offering.title}</span>
                                            {offering.category && (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-slate-500 bg-slate-50 border-slate-200">
                                                    {offering.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 line-clamp-1 max-w-[250px]">
                                            {offering.description || "No description provided."}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400">
                                            {offering.slug}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">${offering.price_numeric}</span>
                                        <span className="text-xs text-slate-500">{offering.price_display}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="font-medium">{offering.features?.length || 0} inclusions</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {offering.popular ? (
                                        <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 shadow-sm">
                                            Most Popular
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium px-2">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 hover:text-blue-600"
                                            onClick={() => handleEdit(offering)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(offering)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-xs text-slate-400" disabled>
                                                    <ExternalLink className="mr-2 h-4 w-4" /> View on Site (Soon)
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {offerings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                    No offerings found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <OfferingSheet
                offering={selectedOffering}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onSaved={handleSaved}
            />
        </>
    )
}
