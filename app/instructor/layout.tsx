"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Car,
    Bell,
    Search,
    BookOpen,
    MapPin,
    ChevronRight,
    ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [userProfile, setUserProfile] = useState<{ name: string, email: string, type?: 'driving' | 'theory' | 'both' } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Fetch Profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, email')
                        .eq('id', user.id)
                        .single()

                    // Fetch Instructor Details (for type)
                    const { data: instructor } = await supabase
                        .from('instructors')
                        .select('type')
                        .eq('profile_id', user.id)
                        .single()

                    setUserProfile({
                        name: profile?.full_name || "Instructor",
                        email: profile?.email || user.email || "",
                        type: instructor?.type || 'both' // Default to both if not set
                    })
                }
            } catch (error) {
                console.error("Error fetching user:", error)
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success("Logged out successfully")
        router.push("/login")
    }

    // Dynamic Navigation Logic
    const getNavSections = () => {
        if (!userProfile) return []

        const type = userProfile.type || 'both'
        const canDriving = type === 'driving' || type === 'both'
        const canTheory = type === 'theory' || type === 'both'

        const sections = [
            {
                label: "Main Menu",
                items: [
                    { href: "/instructor", label: "Dashboard", icon: LayoutDashboard },
                ]
            },
            {
                label: "Teaching",
                items: [
                    ...(canTheory ? [{ href: "/instructor/lessons", label: "Classes", icon: BookOpen }] : []),
                    ...(canDriving ? [{ href: "/instructor/driving", label: "Driving Sessions", icon: Car }] : []),
                    { href: "/instructor/schedule", label: "My Schedule", icon: Calendar },
                ]
            },
            {
                label: "Students & Profile",
                items: [
                    { href: "/instructor/students", label: "My Students", icon: Users },
                    { href: "/instructor/profile", label: "Profile & Settings", icon: Settings }
                ]
            }
        ]

        return sections
    }

    const navSections = getNavSections()

    return (
        <div className="instructor-light min-h-screen bg-background flex font-sans text-foreground">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transform transition-all duration-300 ease-in-out flex flex-col
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                ${collapsed ? "w-20" : "w-72"}
            `}>
                {/* Logo Area */}
                <div className={`h-16 flex items-center ${collapsed ? 'justify-center px-0' : 'px-6'} border-b border-gray-200 shrink-0 transition-all`}>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                            <Car className="h-4 w-4 fill-current" />
                        </div>
                        {!collapsed && (
                            <span className="text-lg font-bold tracking-tight text-gray-900 animate-in fade-in duration-300">
                                Drivofy<span className="text-blue-600">.</span>
                            </span>
                        )}
                    </div>
                    <button
                        className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-6">
                    <div className="space-y-6 px-3">
                        {loading ? (
                            // Skeleton Loader
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                            ))
                        ) : (
                            navSections.map((section, idx) => (
                                <div key={idx} className="space-y-1">
                                    {!collapsed && (
                                        <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 animate-in fade-in duration-300">
                                            {section.label}
                                        </h3>
                                    )}
                                    {section.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== "/instructor")

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`
                                                    group flex items-center ${collapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                                                    ${isActive
                                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                                                `}
                                                onClick={() => setSidebarOpen(false)}
                                                title={collapsed ? item.label : undefined}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                                                    {!collapsed && <span>{item.label}</span>}
                                                </div>
                                                {!collapsed && isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                                            </Link>
                                        )
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Collapse Toggle */}
                <div className="hidden lg:flex items-center justify-center p-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                {/* User Profile Footer */}
                <div className={`p-4 border-t border-gray-200 bg-gray-50/50 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
                    <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-gray-200 ${collapsed ? 'justify-center' : ''}`}>
                        <Avatar className="h-9 w-9 border border-gray-200">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email}`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">IN</AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {userProfile?.name || "Loading..."}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {userProfile?.email || "instructor@drivofy.com"}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLogout()
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 bg-muted/40 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
                {/* Top Header (Mobile & Desktop) */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className="font-bold text-sm text-gray-900">Instructor Portal</span>
                    </div>

                    {/* Desktop Search & Actions */}
                    <div className="hidden lg:flex items-center flex-1 gap-8">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                                placeholder="Search students or schedule..."
                                className="pl-10 h-9 bg-gray-100 border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all rounded-full text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full border border-white"></span>
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto scroll-smooth">
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
