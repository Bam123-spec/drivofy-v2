"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    ExternalLink,
    Github,
    GitBranch,
    CheckCircle2,
    Clock,
    Globe,
    Terminal,
    Shield,
    Activity,
    BarChart3
} from "lucide-react"
import Link from "next/link"

export default function HostingPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hosting</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>drivofy-v2</span>
                        <span className="text-gray-300">/</span>
                        <span className="font-medium text-gray-900">Production</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white hover:bg-gray-50">
                        <Github className="mr-2 h-4 w-4" />
                        Repository
                    </Button>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Deployment Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Preview Image (Left) */}
                <div className="lg:col-span-1 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 relative group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
                        <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg translate-y-2 group-hover:translate-y-0 duration-300">
                            View Deployment
                        </Button>
                    </div>
                    <img
                        src="/site-preview.png"
                        alt="Deployment Preview"
                        className="w-full h-full object-cover object-top min-h-[250px]"
                    />
                </div>

                {/* Deployment Details (Right) */}
                <div className="lg:col-span-2 p-6 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Production Deployment</h3>
                                <p className="text-sm text-gray-500">The latest deployment of your application.</p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Ready
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deployment</p>
                                <a href="#" className="text-sm text-gray-900 hover:underline hover:text-blue-600 truncate block font-mono">
                                    portifol-v2-akr78okos.vercel.app
                                </a>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Domains</p>
                                <div className="flex items-center gap-2">
                                    <a href="#" className="text-sm text-gray-900 hover:underline hover:text-blue-600 font-medium">
                                        portifol.com
                                    </a>
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Primary</Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>Ready</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">2m ago</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Source</p>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <GitBranch className="h-4 w-4 text-gray-400" />
                                    <span className="font-mono text-xs">main</span>
                                    <span className="text-gray-400 px-1"></span>
                                    <span className="truncate max-w-[150px] text-gray-500">fix: update favicon to use user-provided source</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                            <Terminal className="mr-2 h-3 w-3" />
                            Build Logs
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                            <Activity className="mr-2 h-3 w-3" />
                            Runtime Logs
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Firewall
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">Active</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">All systems normal</p>
                        <div className="mt-4 h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Observability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">99.99%</span>
                            <span className="text-sm text-emerald-600 font-medium">Uptime</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Avg. response time: 45ms</p>
                        <div className="mt-4 flex gap-0.5 h-6 items-end">
                            {[40, 60, 45, 70, 50, 65, 55, 45, 60, 50, 75, 60].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gray-200 group-hover:bg-blue-500 transition-colors rounded-sm"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">2.4k</span>
                            <span className="text-sm text-emerald-600 font-medium">+12%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Visitors (Last 24h)</p>
                        <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
