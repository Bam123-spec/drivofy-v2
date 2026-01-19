"use client"

import { Search, Filter, LayoutGrid, List, Calendar as CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ClassesFilterBarProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    modeFilter: string
    onModeChange: (value: string) => void
    dateFilter: Date | undefined
    onDateChange: (date: Date | undefined) => void
    viewMode: 'card' | 'table'
    onViewModeChange: (mode: 'card' | 'table') => void
}

export function ClassesFilterBar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    modeFilter,
    onModeChange,
    dateFilter,
    onDateChange,
    viewMode,
    onViewModeChange
}: ClassesFilterBarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            {/* Search */}
            <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search classes, students, or sessions..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Filters & Toggles */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                {/* Mode Filter */}
                <Select value={modeFilter} onValueChange={onModeChange}>
                    <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[140px] justify-start text-left font-normal bg-gray-50 border-gray-200",
                                !dateFilter && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "MMM d, yyyy") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={onDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => onViewModeChange('card')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'card'
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                        )}
                        title="Card View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('table')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'table'
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                        )}
                        title="Table View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
