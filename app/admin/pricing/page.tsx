import { getAllOfferings } from "@/app/actions/website"
import { OfferingsTable } from "./components/OfferingsTable"
import { Badge } from "@/components/ui/badge"
import { Package, Sparkles } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
    const offerings = await getAllOfferings()

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Package className="h-3 w-3" />
                        CMS Management
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        Pricing & <span className="text-indigo-600">Offerings</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl">
                        Manage your core products, packages, and pricing tiers. Updates here are reflected globally across your website.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <Sparkles className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="text-xs font-bold text-slate-700">{offerings.length} Active Offerings</span>
                </div>
            </div>

            <OfferingsTable offerings={offerings} />
        </div>
    )
}
