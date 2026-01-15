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

export default function InstructorProfilePage() {
    const params = useParams()
    const [instructor, setInstructor] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                <AvatarImage src={instructor.avatar_url} />
                                <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                                    {instructor.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{instructor.full_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="capitalize">
                                        {instructor.type} Instructor
                                    </Badge>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${instructor.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${instructor.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {instructor.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">Edit Profile</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">Contact</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="truncate">{instructor.email}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>{instructor.phone || "No phone"}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div className="font-mono">{instructor.license_number || "N/A"}</div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>Joined {new Date(instructor.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border border-gray-200 p-1 h-12 w-full justify-start rounded-xl">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 h-10 px-6 rounded-lg">Overview</TabsTrigger>
                    <TabsTrigger value="schedule" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 h-10 px-6 rounded-lg">Schedule</TabsTrigger>
                    <TabsTrigger value="students" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 h-10 px-6 rounded-lg">Students</TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 h-10 px-6 rounded-lg">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Star className="h-6 w-6 fill-current" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Rating</p>
                                    <h3 className="text-2xl font-bold text-gray-900">4.9</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Students</p>
                                    <h3 className="text-2xl font-bold text-gray-900">12</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Hours Taught</p>
                                    <h3 className="text-2xl font-bold text-gray-900">145</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                    <Award className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                                    <h3 className="text-2xl font-bold text-gray-900">92%</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed">
                                    {instructor.bio || "No bio available for this instructor."}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Vehicle</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Car className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Toyota Corolla</p>
                                        <p className="text-sm text-gray-500">License: ABC-123</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>Upcoming lessons and availability.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center text-gray-500">
                            Calendar view coming soon...
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Students</CardTitle>
                            <CardDescription>Students currently learning with this instructor.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center text-gray-500">
                            Student list coming soon...
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Detailed analytics and feedback.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center text-gray-500">
                            Charts coming soon...
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
