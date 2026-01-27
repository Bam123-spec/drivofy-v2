"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import {
    Loader2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    Users,
    Clock,
    Award,
    Shield,
    Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { InstructorScheduling } from "./InstructorScheduling"

export default function AdminInstructorProfile() {
    const params = useParams()
    const [instructor, setInstructor] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchInstructor = async () => {
        try {
            const { data, error } = await supabase
                .from('instructors')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) throw error
            setInstructor(data)
        } catch (error) {
            console.error("Error fetching instructor:", error)
            toast.error("Failed to load instructor details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchInstructor()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!instructor) {
        return <div className="p-8 text-center text-gray-500">Instructor not found</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden group">
                {/* Dynamic Banner */}
                <div className="h-48 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700" />
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 gap-6">
                        <div className="flex items-end gap-6">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl bg-white ring-1 ring-gray-100">
                                    <AvatarImage src={instructor.avatar_url} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-medium">
                                        {instructor.full_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-[3px] border-white ${instructor.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                                    } shadow-sm`} />
                            </div>

                            <div className="mb-2 space-y-2">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{instructor.full_name}</h1>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className={`px-3 py-1 text-sm font-medium capitalize shadow-sm ${instructor.type === 'driving' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        instructor.type === 'theory' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {instructor.type} Instructor
                                    </Badge>
                                    <span className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                        <div className={`h-1.5 w-1.5 rounded-full ${instructor.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                        {instructor.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto pb-2">
                            <Button variant="outline" className="flex-1 md:flex-none border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                Edit Profile
                            </Button>
                            <Button className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Contact Instructor
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-default">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="truncate font-medium">{instructor.email}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-default">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div className="font-medium">{instructor.phone || "No phone"}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-default">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div className="font-mono font-medium">{instructor.license_number || "N/A"}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 group cursor-default">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div className="font-medium">Joined {new Date(instructor.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="schedule" className="space-y-8">
                <TabsList className="bg-white border border-gray-200 p-1.5 h-14 w-full justify-start rounded-2xl shadow-sm">
                    <TabsTrigger value="schedule" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none h-11 px-6 rounded-xl font-medium transition-all">Schedule</TabsTrigger>
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none h-11 px-6 rounded-xl font-medium transition-all">Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2 border-none shadow-md bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">About Instructor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    {instructor.bio || "No bio available for this instructor."}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md bg-white h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">Assigned Vehicle</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-default">
                                    <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Car className="h-7 w-7 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Toyota Corolla</p>
                                        <p className="text-sm text-gray-500 font-mono">License: ABC-123</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="schedule" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <InstructorScheduling
                        instructor={instructor}
                        onUpdate={fetchInstructor}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
