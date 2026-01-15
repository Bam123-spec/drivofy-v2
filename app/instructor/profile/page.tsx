'use client'

import { useEffect, useState } from "react"
import { Loader2, User, Mail, Phone, Shield, Save, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [instructor, setInstructor] = useState<any>(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const { data: instructorData } = await supabase
                .from('instructors')
                .select('*')
                .eq('profile_id', user.id)
                .single()

            setProfile(profileData)
            setInstructor(instructorData)
        } catch (error) {
            console.error("Failed to load profile", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone
                })
                .eq('id', profile.id)

            if (profileError) throw profileError

            // Update Instructor
            const { error: instructorError } = await supabase
                .from('instructors')
                .update({
                    full_name: profile.full_name, // Sync name
                    phone: profile.phone,
                    bio: instructor.bio
                })
                .eq('id', instructor.id)

            if (instructorError) throw instructorError

            toast.success("Profile updated successfully")
        } catch (error) {
            console.error("Failed to update profile", error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account details and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600" />
                        <CardContent className="pt-0 relative px-6 pb-6">
                            <div className="absolute -top-12 left-6">
                                <div className="relative group">
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                                            {profile.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors">
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-14">
                                <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                                <p className="text-sm text-gray-500">{profile.email}</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                        Instructor
                                    </Badge>
                                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 capitalize">
                                        {instructor?.type || 'Driving & Theory'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="fullName"
                                        className="pl-10"
                                        value={profile.full_name || ''}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        className="pl-10 bg-gray-50"
                                        value={profile.email || ''}
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Email cannot be changed. Contact admin for assistance.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        className="pl-10"
                                        value={profile.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio / Introduction</Label>
                                <textarea
                                    id="bio"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Tell students a bit about yourself..."
                                    value={instructor?.bio || ''}
                                    onChange={(e) => setInstructor({ ...instructor, bio: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full justify-start">
                                <Shield className="h-4 w-4 mr-2" /> Change Password
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
