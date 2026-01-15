'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react"

// Mock Data Interfaces
interface RevenuePoint {
    label: string
    revenue: number
}

interface ProgramBreakdown {
    name: string
    type: 'Theory' | 'Driving' | 'Bundle'
    students: number
    revenue: number
    share: number
}

// Mock Data
const REVENUE_HISTORY: RevenuePoint[] = [
    { label: 'Feb 25', revenue: 8500 },
    { label: 'Mar 25', revenue: 9200 },
    { label: 'Apr 25', revenue: 8800 },
    { label: 'May 25', revenue: 9500 },
    { label: 'Jun 25', revenue: 11200 },
    { label: 'Jul 25', revenue: 12500 },
    { label: 'Aug 25', revenue: 10800 },
    { label: 'Sep 25', revenue: 9800 },
    { label: 'Oct 25', revenue: 10200 },
    { label: 'Nov 25', revenue: 10500 },
    { label: 'Dec 25', revenue: 11800 },
    { label: 'Jan 26', revenue: 12400 },
]

const PROGRAM_DATA: ProgramBreakdown[] = [
    { name: "Full Driver's Ed Bundle", type: "Bundle", students: 84, revenue: 37800, share: 41 },
    { name: "Behind-the-Wheel Package (10h)", type: "Driving", students: 45, revenue: 13500, share: 15 },
    { name: "Theory Course (Online)", type: "Theory", students: 120, revenue: 18000, share: 19 },
    { name: "Winter Driving Special", type: "Bundle", students: 28, revenue: 11440, share: 13 },
    { name: "Road Test Service", type: "Driving", students: 56, revenue: 8400, share: 9 },
    { name: "Refresher Course", type: "Driving", students: 32, revenue: 3200, share: 3 },
]

export default function RevenueReportsPage() {
    const [dateRange, setDateRange] = useState("30d")
    const [programType, setProgramType] = useState("all")

    const maxRevenue = Math.max(...REVENUE_HISTORY.map(d => d.revenue))

    // Filter logic would go here in a real app
    const filteredPrograms = PROGRAM_DATA.filter(p =>
        programType === "all" || p.type.toLowerCase() === programType.toLowerCase()
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Revenue Reports</h1>
                <p className="text-gray-500 mt-1">Track student payments and financial performance.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Revenue (30d)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">$18,450</div>
                        <p className="text-xs text-green-600 font-medium mt-1">+12.5% vs last month</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Revenue (YTD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">$132,900</div>
                        <p className="text-xs text-gray-500 mt-1">Jan 1 - Present</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Payment Plans</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">42</div>
                        <p className="text-xs text-gray-500 mt-1">Students on installments</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg Revenue / Student</CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">$680</div>
                        <p className="text-xs text-gray-500 mt-1">Across all programs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-gray-900">Revenue Trend</CardTitle>
                        <div className="flex gap-2">
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">Last 7 Days</SelectItem>
                                    <SelectItem value="30d">Last 30 Days</SelectItem>
                                    <SelectItem value="90d">Last 90 Days</SelectItem>
                                    <SelectItem value="ytd">Year to Date</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={programType} onValueChange={setProgramType}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue placeholder="Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    <SelectItem value="theory">Theory Only</SelectItem>
                                    <SelectItem value="driving">Driving Only</SelectItem>
                                    <SelectItem value="bundle">Bundles</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px] w-full flex items-end justify-between gap-2 pt-8 pb-2">
                            {REVENUE_HISTORY.map((item) => (
                                <div key={item.label} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div
                                        className="w-full bg-blue-500/90 rounded-t-sm hover:bg-blue-600 transition-all relative group-hover:shadow-md"
                                        style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            ${item.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500 rotate-0 truncate w-full text-center">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Program Breakdown */}
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Revenue by Program</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="text-xs font-semibold text-gray-600 h-9">Program</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-600 h-9 text-right">Rev</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-600 h-9 text-right">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPrograms.map((program) => (
                                    <TableRow key={program.name} className="hover:bg-gray-50/50 border-gray-100">
                                        <TableCell className="py-3">
                                            <div className="font-medium text-sm text-gray-900 truncate max-w-[140px]" title={program.name}>
                                                {program.name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-normal text-gray-500 border-gray-200">
                                                    {program.type}
                                                </Badge>
                                                <span className="text-[10px] text-gray-400">{program.students} students</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-sm py-3 align-top">
                                            ${(program.revenue / 1000).toFixed(1)}k
                                        </TableCell>
                                        <TableCell className="text-right py-3 align-top">
                                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {program.share}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
