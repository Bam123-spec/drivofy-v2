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
    const [userProfile, setUserProfile] = useState<{ name: string, email: string, role: string } | null>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email, role')
                    .eq('id', user.id)
                    .single()

                const role = profile?.role || "admin"

                setUserProfile({
                    name: profile?.full_name || "Admin User",
                    email: profile?.email || user.email || "",
                    role
                })

                // Role-based redirection: Staff shouldn't access dashboard root
                if (role === 'staff' && pathname === '/admin') {
                    router.push('/admin/students')
                }
            }
        }
        getUser()
    }, [pathname, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success("Logged out successfully")
        router.push("/login")
    }

    // Filtered Menu Structure based on Role
    const allMenuGroups = [
        {
            label: "Main Menu",
            items: [
                { href: "/admin", label: "Dashboard", icon: LayoutDashboard, placeholder: false },
                { href: "/admin/schedule", label: "Schedule", icon: CalendarDays, placeholder: false },
            ]
        },
        {
            label: "Operations",
            items: [
                { href: "/admin/students", label: "Students", icon: GraduationCap, placeholder: false },
                { href: "/admin/classes", label: "Classes", icon: BookOpen, placeholder: false },
                { href: "/admin/driving", label: "Driving Sessions", icon: Car, placeholder: false },
                { href: "/admin/instructors", label: "Instructors", icon: Users, placeholder: false },
                { href: "/admin/manage-class", label: "Manage Class", icon: CalendarDays, placeholder: false },
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
                { href: "/admin/settings/payments", label: "Payments Settings", icon: CreditCard, placeholder: false },
                { href: "/admin/users", label: "Admin Users", icon: UserCog, placeholder: false },
                { href: "/admin/audit", label: "Audit Logs", icon: History, placeholder: false },
                { href: "/admin/payments", label: "School Subscription", icon: CreditCard, placeholder: false },
            ]
        }
    ]

    const menuGroups = userProfile?.role === 'staff'
        ? allMenuGroups.filter(group => group.label === "Operations")
        : allMenuGroups

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
                fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border shadow-heavy lg:shadow-none transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                ${collapsed ? "lg:w-20" : "lg:w-72"}
                w-72
            `}>
                {/* Logo Area */}
                <div className={`h-20 flex items-center ${collapsed ? "justify-center px-0" : "px-8"} border-b border-sidebar-border shrink-0 transition-all duration-300`}>
                    <div className="flex items-center gap-3">
                        {/* Logo Image */}
                        <div className="relative h-10 w-auto flex items-center justify-center">
                            {collapsed ? (
                                <img src="/sidebar-logo-dark.png" alt="Selam" className="h-9 w-9 object-contain rounded-xl shadow-premium" />
                            ) : (
                                <img src="/logo.jpg" alt="Selam Driving School" className="h-9 w-auto object-contain" />
                            )}
                        </div>
                    </div>
                    <button
                        className="ml-auto lg:hidden p-2 rounded-full hover:bg-white/10 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 min-h-0 py-4">
                    <div className="px-4 space-y-8">
                        {menuGroups.map((group, i) => (
                            <div key={i} className="space-y-2">
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-[10px] font-bold text-sidebar-foreground/30 uppercase tracking-[0.2em] animate-in-fade">
                                        {group.label}
                                    </div>
                                )}
                                <nav className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href
                                        const targetHref = item.placeholder ? "/admin/coming-soon" : item.href

                                        return (
                                            <Link
                                                key={item.label}
                                                href={targetHref}
                                                className={`
                                                    group relative flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-4"} py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                                                    ${isActive
                                                        ? "bg-sidebar-primary/10 text-sidebar-primary shadow-[inset_0_0_0_1px_rgba(55,64,255,0.2)]"
                                                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                                                `}
                                                onClick={() => setSidebarOpen(false)}
                                                title={collapsed ? item.label : undefined}
                                            >
                                                <div className={`flex items-center ${collapsed ? "gap-0" : "gap-3.5"}`}>
                                                    <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? "text-sidebar-primary scale-110" : "text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground group-hover:scale-110"}`} />
                                                    {!collapsed && <span className="animate-in-fade">{item.label}</span>}
                                                </div>
                                                {!collapsed && isActive && (
                                                    <div className="absolute left-0 w-1 h-5 bg-sidebar-primary rounded-r-full animate-in-fade" />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="mt-auto shrink-0 px-4 pb-6 space-y-4">
                    {/* User Profile Footer */}
                    <div className={`p-1.5 rounded-2xl bg-sidebar-accent/30 border border-sidebar-border/50 ${collapsed ? "flex justify-center" : ""}`}>
                        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} p-2 rounded-xl hover:bg-sidebar-accent/50 transition-all cursor-pointer group relative`}>
                            <Avatar className="h-10 w-10 border-2 border-white/10 shadow-premium ring-2 ring-sidebar-primary/10">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email}`} />
                                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">AD</AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <div className="flex-1 min-w-0 animate-in-fade">
                                    <p className="text-sm font-bold text-sidebar-foreground truncate tracking-tight">
                                        {userProfile?.name || "Loading..."}
                                    </p>
                                    <p className="text-[11px] font-medium text-sidebar-foreground/40 truncate">
                                        {userProfile?.email || "admin@selamdriving.com"}
                                    </p>
                                </div>
                            )}
                            {!collapsed && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-sidebar-foreground/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
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

                    {/* Collapse Toggle (Desktop Only) */}
                    <div className="hidden lg:block">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-full h-10 justify-center gap-2 rounded-xl hover:bg-sidebar-accent/50 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all duration-300"
                        >
                            <ChevronRight className={`h-4 w-4 transition-transform duration-500 ${collapsed ? "" : "rotate-180"}`} />
                            {!collapsed && <span className="text-xs font-semibold uppercase tracking-wider animate-in-fade">Hide Sidebar</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`admin-light flex-1 flex flex-col min-w-0 bg-background text-foreground transition-all duration-500 ease-in-out ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
                {/* Top Header (Mobile & Desktop) */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-all shadow-sm">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:text-primary transition-colors">
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-bold text-lg text-foreground tracking-tight">Drivofy</span>
                    </div>

                    {/* Desktop Search & Actions */}
                    <div className="hidden lg:flex items-center flex-1 gap-8">
                        <div className="relative w-full max-w-lg group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                                placeholder="Search students, classes, or settings..."
                                className="pl-12 h-11 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-300 rounded-2xl text-sm shadow-premium text-gray-900 placeholder:text-gray-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live System
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 shadow-sm">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10 overflow-y-auto scroll-smooth bg-[#fbfbfc]">
                    <div className="max-w-7xl mx-auto space-y-10 animate-in-slide">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster />
        </div>
    )
}
