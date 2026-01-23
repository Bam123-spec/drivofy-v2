"use client"

import { useState, useEffect } from "react"
import { getOfferingsForPage, updateOffering } from "@/app/actions/website"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DollarSign,
    Save,
    Zap,
    CheckCircle2,
    Clock,
    Target,
    Sparkles,
    ArrowUpRight,
    MousePointer2,
    Shield,
    Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function PricingEditor() {
    const [offerings, setOfferings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedOffering, setSelectedOffering] = useState<any>(null)

    useEffect(() => {
        loadOfferings()
    }, [])

    const loadOfferings = async () => {
        try {
            const data = await getOfferingsForPage('drivers-ed-packages', 'pricing_cards')
            if (data && data.length > 0) {
                setOfferings(data)
                // Default to driver_ed_package for preview if available, else first one
                const de = data.find((o: any) => o.slug === 'driver_ed_package')
                setSelectedOffering(de || data[0])
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load pricing data")
        } finally {
            setLoading(false)
        }
    }

    const handlePriceChange = (slug: string, newPrice: string) => {
        setOfferings(prev => prev.map(item =>
            item.slug === slug ? { ...item, price_numeric: Number(newPrice) } : item
        ))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const promises = offerings.map(item => {
                // Simple logic to preserve "Starting at" prefix if it existed, strictly based on user requirement
                // If the old display string contained "Starting at", keep it.
                // Otherwise just use "$<price>"
                let newDisplay = `$${item.price_numeric}`
                if (item.price_display.toLowerCase().includes('starting')) {
                    newDisplay = `Starting at $${item.price_numeric}`
                }

                return updateOffering(item.id, {
                    price_numeric: item.price_numeric,
                    price_display: newDisplay
                })
            })

            await Promise.all(promises)
            toast.success("Pricing updated across all site pages!")

            // Refresh local state to ensure consistency
            await loadOfferings()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update pricing")
        } finally {
            setIsSaving(false)
        }
    }

    // Map fetched offerings to the specific inputs we expect
    const drivingSession = offerings.find(o => o.slug === 'individual_session')
    const driverEdPackage = offerings.find(o => o.slug === 'driver_ed_package')
    const premiumBundle = offerings.find(o => o.slug === 'premium_bundle')

    // Start with driverEdPackage for preview if no specific selection logic (simplified for MVP)
    const previewItem = driverEdPackage || { price_numeric: 0, price_display: '$0', title: 'Driver Education', description: 'Complete classroom and road training.', features: [] }

    // Icon mapping
    const IconMap: any = {
        CheckCircle2, Clock, Zap, Shield, Star, Target, Sparkles
    }

    if (loading) {
        return <div className="p-10 text-center text-slate-500 animate-pulse">Loading pricing data...</div>
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Design Banner */}
            <div className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-1">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-[1.9rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                            <Sparkles className="h-3 w-3 fill-current" />
                            Live Customization
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                            Global Pricing <br /><span className="text-white/60">Control Center</span>
                        </h2>
                        <p className="text-blue-100/80 text-sm font-medium max-w-sm leading-relaxed">
                            Changes here update your landing page, booking widgets, and student portals in real-time.
                        </p>
                    </div>
                    <div className="flex -space-x-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl rotate-12 -translate-y-4">
                            <Target className="h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs Section */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <Zap className="h-5 w-5 text-blue-500 fill-current" />
                                Pricing Tiers
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium pt-1">
                                Set the base price for your primary offerings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid gap-6">
                                {drivingSession && (
                                    <div className="space-y-2 group">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-blue-600 transition-colors">{drivingSession.title || 'Individual Session'}</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="number"
                                                value={drivingSession.price_numeric}
                                                onChange={(e) => handlePriceChange('individual_session', e.target.value)}
                                                className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all rounded-2xl text-lg font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                )}

                                {driverEdPackage && (
                                    <div className="space-y-2 group">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors">{driverEdPackage.title || 'Driver Ed Package (DE)'}</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="number"
                                                value={driverEdPackage.price_numeric}
                                                onChange={(e) => handlePriceChange('driver_ed_package', e.target.value)}
                                                className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all rounded-2xl text-lg font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                )}

                                {premiumBundle && (
                                    <div className="space-y-2 group">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-violet-600 transition-colors">{premiumBundle.title || 'Premium Bundle (DE + Extra Sessions)'}</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="number"
                                                value={premiumBundle.price_numeric}
                                                onChange={(e) => handlePriceChange('premium_bundle', e.target.value)}
                                                className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-violet-500/20 focus:ring-4 focus:ring-violet-500/5 transition-all rounded-2xl text-lg font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 font-bold text-lg group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {isSaving ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                        Updating Site...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Publish Prices
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-8 space-y-6">
                        <div className="px-2">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-4">
                                <MousePointer2 className="h-3 w-3" />
                                Live Preview
                            </h3>

                            {/* Card Preview */}
                            <div className="relative group transition-all duration-500 cursor-default">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
                                <Card className="relative border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                                    <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                                        <div className="flex justify-between items-start mb-6">
                                            {previewItem.popular && (
                                                <Badge className="bg-indigo-500 border-0 text-[10px] font-black px-3 py-1 uppercase tracking-widest text-white">Most Popular</Badge>
                                            )}
                                            <ArrowUpRight className="h-5 w-5 text-slate-300 ml-auto" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{previewItem.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{previewItem.description}</p>
                                    </div>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900 tracking-tight">${previewItem.price_numeric}</span>
                                            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total</span>
                                        </div>

                                        <div className="space-y-3">
                                            {previewItem.features?.map((feature: any, i: number) => {
                                                const Icon = IconMap[feature.icon || 'CheckCircle2'] || CheckCircle2
                                                return (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className={`p-1 rounded-full bg-slate-50 ${feature.color || 'text-slate-600'}`}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600">{feature.text}</span>
                                                    </div>
                                                )
                                            })}
                                            {(!previewItem.features || previewItem.features.length === 0) && (
                                                <div className="text-xs text-slate-400 italic">No features listed.</div>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <div className="w-full h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-black uppercase tracking-widest italic">
                                                Student View Preview
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Info Box */}
                            <div className="mt-8 p-6 rounded-[2rem] bg-amber-50 border border-amber-100 space-y-3 shadow-xl shadow-amber-900/5">
                                <div className="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase tracking-widest">
                                    <Sparkles className="h-3 w-3 fill-current" />
                                    Why it matters
                                </div>
                                <p className="text-xs text-amber-900/70 font-medium leading-relaxed">
                                    Visual consistency across your platform builds trust. These rates will appear on your homepage, enrollment forms, and even auto-generated PDF receipts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
