"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Instructor } from "./types"

interface ClassesFiltersProps {
    search: string
    setSearch: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    instructorFilter: string
    setInstructorFilter: (value: string) => void
    instructors: Instructor[]
}

export function ClassesFilters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    instructorFilter,
    setInstructorFilter,
    instructors,
}: ClassesFiltersProps) {
    const hasFilters = search || statusFilter !== "all" || instructorFilter !== "all"

    const clearFilters = () => {
        setSearch("")
        setStatusFilter("all")
        setInstructorFilter("all")
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Instructor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Instructors</SelectItem>
                        {instructors.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                                {inst.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
