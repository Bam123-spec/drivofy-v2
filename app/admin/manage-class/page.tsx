"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Calendar,
    Users,
    ChevronRight,
    GraduationCap,
    Clock,
    Plus,
    Search,
    BookOpen,
    Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { ManageClassSheet } from "@/app/admin/manage-class/components/ManageClassSheet"

export default function ManageClassPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    useEffect(() => {
        fetchUpcomingClasses()
    }, [])

    const fetchUpcomingClasses = async () => {
        try {
            setLoading(true)
            const today = new Date().toISOString().split('T')[0]

            // Fetch top 6 upcoming DE classes
            const { data, error } = await supabase
                .from('classes')
                .select(`
                    *,
                    instructors (full_name)
                `)
                .eq('class_type', 'DE')
                .eq('is_archived', false)
                .gte('start_date', today)
                .order('start_date', { ascending: true })
                .limit(6)

            if (error) throw error
            setClasses(data || [])
        } catch (error) {
            console.error("Error fetching classes:", error)
            toast.error("Failed to load upcoming classes")
        } finally {
            setLoading(false)
        }
    }

    const handleManageClass = (cls: any) => {
        setSelectedClass(cls)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Premium Feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div className="space-y-1">
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100 px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest mb-2">
                        Class Management
                    </Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Manage <span className="text-blue-600">Classes</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage students, track progress, and award certifications for upcoming DE courses.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 gap-2">
                        <Search className="h-4 w-4" />
                        Quick Search
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-[280px] rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => (
                        <Card
                            key={cls.id}
                            className="group relative h-full border-0 bg-white shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 rounded-[2rem] overflow-hidden cursor-pointer flex flex-col"
                            onClick={() => handleManageClass(cls)}
                        >
                            {/* Accent Background Glow */}
                            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

                            <CardContent className="relative p-8 flex flex-col h-full z-10">
                                {/* Top Badging */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                                        <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                                        Upcoming
                                    </Badge>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                                        {cls.name}
                                    </h3>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
                                            <Calendar className="h-4 w-4 text-slate-300" />
                                            <span>Starts {format(new Date(cls.start_date + 'T00:00:00'), "MMMM d, yyyy")}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
                                            <Clock className="h-4 w-4 text-slate-300" />
                                            <span>{cls.time_slot || "No time specified"}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-slate-500 font-medium text-sm">
                                            <Car className="h-4 w-4 text-slate-300" />
                                            <span className="truncate">{cls.instructors?.full_name || "Unassigned"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100" />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Active Roster</span>
                                    </div>

                                    <div className="flex items-center gap-1 font-bold text-blue-600 text-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        Manage
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <BookOpen className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Upcoming Classes</h3>
                        <p className="text-slate-500 font-medium">There are currently no Driver's Ed classes scheduled in the near future.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 h-12">
                            Create New Class
                        </Button>
                    </div>
                </div>
            )}

            <ManageClassSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                classData={selectedClass}
                onUpdate={fetchUpcomingClasses}
            />
        </div>
    )
}
