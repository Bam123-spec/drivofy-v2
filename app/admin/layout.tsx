"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Car,
    LogOut,
    Menu,
    X,
    Settings,
    Bell,
    Search,
    ChevronRight,
    CreditCard,
    BarChart3,
    MessageSquare,
    FileText,
    Shield,
    GraduationCap,
    CalendarDays,
    Mail,
    MessageCircle,
    Bot,
    FileBarChart,
    PieChart,
    UserCog,
    History,
    Truck,
    Puzzle,
    Server,
    LayoutTemplate
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [userProfile, setUserProfile] = useState<{ name: string, email: string } | null>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', user.id)
                    .single()

                setUserProfile({
                    name: profile?.full_name || "Admin User",
                    email: profile?.email || user.email || ""
                })
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success("Logged out successfully")
        router.push("/login")
    }

    // Enterprise Menu Structure
    const menuGroups = [
        {
            label: "Main Menu",
            items: [
                { href: "/admin", label: "Dashboard", icon: LayoutDashboard, placeholder: false },
            ]
        },
        {
            label: "Operations",
            items: [
                { href: "/admin/schedule", label: "Schedule", icon: CalendarDays, placeholder: false },
                { href: "/admin/students", label: "Students", icon: GraduationCap, placeholder: false },
                { href: "/admin/classes", label: "Classes", icon: BookOpen, placeholder: false },
                { href: "/admin/driving", label: "Driving Sessions", icon: Car, placeholder: false },
                { href: "/admin/instructors", label: "Instructors", icon: Users, placeholder: false },
                { href: "/admin/attendance", label: "Attendance", icon: CalendarDays, placeholder: false },
            ]
        },
        {
            label: "Website",
            items: [
                { href: "/admin/hosting", label: "Hosting", icon: Server, placeholder: false },
                { href: "/admin/editor", label: "Edit Site", icon: LayoutTemplate, placeholder: false },
            ]
        },
        {
            label: "System",
            items: [
                { href: "/admin/settings", label: "General Settings", icon: Settings, placeholder: false },
                { href: "/admin/users", label: "Admin Users", icon: UserCog, placeholder: false },
                { href: "/admin/audit", label: "Audit Logs", icon: History, placeholder: false },
                { href: "/admin/payments", label: "Billing", icon: CreditCard, placeholder: false },
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50/50 flex font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border shadow-xl lg:shadow-none transform transition-all duration-300 ease-in-out flex flex-col
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                ${collapsed ? "lg:w-20" : "lg:w-72"}
                w-72
            `}>
                {/* Logo Area */}
                <div className={`h-16 flex items-center ${collapsed ? "justify-center px-0" : "px-6"} border-b border-sidebar-border shrink-0 transition-all duration-300`}>
                    <div className="flex items-center gap-2.5">
                        {/* Logo Image */}
                        <div className="relative h-8 w-auto flex items-center justify-center">
                            {collapsed ? (
                                <img src="/sidebar-logo-dark.png" alt="Drivofy" className="h-8 w-8 object-contain rounded-md" />
                            ) : (
                                <img src="/logo.jpg" alt="Drivofy" className="h-8 w-auto object-contain" />
                            )}
                        </div>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-6 px-3">
                    <div className="space-y-6">
                        {menuGroups.map((group, i) => (
                            <div key={i}>
                                {!collapsed && (
                                    <div className="px-3 mb-2 text-[11px] font-bold text-sidebar-foreground/40 uppercase tracking-wider animate-in fade-in duration-300">
                                        {group.label}
                                    </div>
                                )}
                                <nav className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href
                                        const targetHref = item.placeholder ? "/admin/coming-soon" : item.href

                                        return (
                                            <Link
                                                key={item.label}
                                                href={targetHref}
                                                className={`
                                                    group flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-3"} py-2 rounded-md text-sm font-medium transition-all duration-200
                                                    ${isActive
                                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                                                `}
                                                onClick={() => setSidebarOpen(false)}
                                                title={collapsed ? item.label : undefined}
                                            >
                                                <div className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}>
                                                    <Icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"}`} />
                                                    {!collapsed && <span className="animate-in fade-in duration-300">{item.label}</span>}
                                                </div>
                                                {!collapsed && isActive && <div className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Collapse Toggle (Desktop Only) */}
                <div className="hidden lg:flex items-center justify-center p-2 border-t border-sidebar-border bg-sidebar-accent/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/50"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <div className="flex items-center gap-2"><ChevronRight className="h-4 w-4 rotate-180" /> <span className="text-xs">Collapse Sidebar</span></div>}
                    </Button>
                </div>

                {/* User Profile Footer */}
                <div className={`p-4 border-t border-sidebar-border bg-sidebar-accent/10 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
                    <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} p-2 rounded-xl hover:bg-sidebar-accent/50 transition-all cursor-pointer group`}>
                        <Avatar className="h-9 w-9 border-2 border-sidebar-primary/20 shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email}`} />
                            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">AD</AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                                    {userProfile?.name || "Loading..."}
                                </p>
                                <p className="text-xs text-sidebar-foreground/50 truncate">
                                    {userProfile?.email || "admin@drivofy.com"}
                                </p>
                            </div>
                        )}
                        {!collapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleLogout()
                                }}
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`admin-light flex-1 flex flex-col min-w-0 bg-background text-foreground transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
                {/* Top Header (Mobile & Desktop) */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className="font-bold text-sm text-foreground">Dashboard</span>
                    </div>

                    {/* Desktop Search & Actions */}
                    <div className="hidden lg:flex items-center flex-1 gap-8">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search students, classes, or settings..."
                                className="pl-10 h-9 bg-gray-100 border-transparent focus:bg-white focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all rounded-full text-sm shadow-sm text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
                            <Bell className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster />
        </div>
    )
}
