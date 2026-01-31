"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Target, Sparkles, Calendar, Package, ArrowUpRight } from "lucide-react"
import {
    getClassPricingSummary,
    getServicePricingSummary,
    type ClassPricingSummary,
    type ServicePricingSummary
} from "@/app/actions/pricingActions"
import { ClassPricingCard } from "@/app/admin/pricing/components/ClassPricingCard"
import { ServicePricingCard } from "@/app/admin/pricing/components/ServicePricingCard"

export function PricingEditor() {
    const [classPricing, setClassPricing] = useState<ClassPricingSummary[]>([])
    const [servicePricing, setServicePricing] = useState<ServicePricingSummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPricingData()
    }, [])

    const loadPricingData = async () => {
        try {
            const [classes, services] = await Promise.all([
                getClassPricingSummary(),
                getServicePricingSummary()
            ])
            setClassPricing(classes)
            setServicePricing(services)
        } catch (error) {
            console.error('[PRICING EDITOR] Error loading pricing:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = () => {
        // Reload data after any update
        loadPricingData()
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-48 bg-slate-100 rounded-[2rem] w-full mb-8" />
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="h-8 bg-slate-100 rounded w-1/3" />
                        <div className="h-64 bg-slate-100 rounded-3xl" />
                        <div className="h-64 bg-slate-100 rounded-3xl" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-8 bg-slate-100 rounded w-1/3" />
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Hero Section */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 p-1 shadow-2xl shadow-indigo-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-violet-800 opacity-90" />

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl mix-blend-overlay animate-pulse" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl mix-blend-overlay animate-pulse duration-1000" />

                <div className="relative bg-white/5 backdrop-blur-2xl rounded-[2.4rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/10">
                    <div className="space-y-6 max-w-xl">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-900/20 backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 fill-indigo-200 text-indigo-200" />
                            Global Configuration
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[0.9]">
                            Pricing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Control Center</span>
                        </h2>
                        <p className="text-blue-100/90 text-lg font-medium leading-relaxed">
                            Manage your class schedules and service packages from one central hub. Updates sync globally in real-time.
                        </p>
                    </div>

                    {/* Floating 3D-ish Elements */}
                    <div className="relative hidden lg:block">
                        <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-40 rounded-full" />
                        <div className="relative z-10 flex -space-x-6 hover:-space-x-4 transition-all duration-500">
                            <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                                <DollarSign className="h-10 w-10 text-emerald-300" />
                            </div>
                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transform rotate-12 hover:rotate-0 transition-transform duration-500 translate-y-4">
                                <Target className="h-10 w-10 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid xl:grid-cols-12 gap-10">
                {/* Left Pane: Scheduled Classes (5 columns) */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-1">
                            <h3 className="text-base font-black uppercase tracking-[0.1em] text-slate-800 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                Scheduled Classes
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                                Batch updates for all sessions
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {classPricing.map((classData) => (
                            <ClassPricingCard
                                key={classData.class_type}
                                classData={classData}
                                onUpdate={handleUpdate}
                            />
                        ))}

                        {classPricing.length === 0 && (
                            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
                                <CardContent className="py-16 text-center space-y-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 mx-auto flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">No scheduled classes found</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Right Pane: Service Packages (7 columns) */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-1">
                            <h3 className="text-base font-black uppercase tracking-[0.1em] text-slate-800 flex items-center gap-2">
                                <Package className="h-4 w-4 text-indigo-500" />
                                Service Packages
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                                Individual package configuration
                            </p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200/60 uppercase tracking-widest text-[10px] font-black px-3 py-1.5 flex items-center gap-2 shadow-sm">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Real-time Sync Active
                        </Badge>
                    </div>

                    <div className="grid gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                        {servicePricing.map((service) => (
                            <ServicePricingCard
                                key={service.id}
                                service={service}
                                onUpdate={handleUpdate}
                            />
                        ))}

                        {servicePricing.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-sm font-semibold text-slate-400">No service packages available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
