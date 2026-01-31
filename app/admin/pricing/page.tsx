import { getClassPricingSummary, getServicePricingSummary } from "@/app/actions/pricingActions"
import { ClassPricingCard } from "./components/ClassPricingCard"
import { ServicePricingCard } from "./components/ServicePricingCard"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Package } from "lucide-react"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

async function ClassPricingSection() {
    const classPricing = await getClassPricingSummary()

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50">
                    <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">Scheduled Classes</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Updates apply to all upcoming sessions
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {classPricing.map((classData) => (
                    <ClassPricingCard
                        key={classData.class_type}
                        classData={classData}
                        onUpdate={() => {
                            // Force page refresh to get updated data
                            window.location.reload()
                        }}
                    />
                ))}

                {classPricing.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-sm text-slate-500">No upcoming classes found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

async function ServicePricingSection() {
    const services = await getServicePricingSummary()

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50">
                    <Package className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">Service Packages</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        On-demand practice sessions and add-ons
                    </p>
                </div>
            </div>

            <div className="grid gap-3">
                {services.map((service) => (
                    <ServicePricingCard
                        key={service.id}
                        service={service}
                        onUpdate={() => {
                            // Force page refresh to get updated data
                            window.location.reload()
                        }}
                    />
                ))}

                {services.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-sm text-slate-500">No services found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="py-8">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                        <div className="h-10 bg-slate-200 rounded" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default async function PricingPage() {
    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]">
                        <DollarSign className="h-3 w-3" />
                        Pricing Management
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        Manage <span className="text-emerald-600">Pricing</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl">
                        Update prices for scheduled classes and service packages. Changes are applied instantly across your platform.
                    </p>
                </div>

                <Badge variant="outline" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border-2 border-slate-200 font-bold text-sm">
                    Real-time Sync
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                </Badge>
            </div>

            {/* Dual-Pane Layout */}
            <div className="grid lg:grid-cols-2 gap-8 px-2">
                {/* Left Pane: Scheduled Classes */}
                <Suspense fallback={<LoadingSkeleton />}>
                    <ClassPricingSection />
                </Suspense>

                {/* Right Pane: Service Packages */}
                <Suspense fallback={<LoadingSkeleton />}>
                    <ServicePricingSection />
                </Suspense>
            </div>
        </div>
    )
}
