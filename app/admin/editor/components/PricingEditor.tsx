"use client"

import { useState } from "react"
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
    MousePointer2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function PricingEditor() {
    const [prices, setPrices] = useState({
        drivingSession: 85,
        driverEdPackage: 495,
        premiumBundle: 595
    })
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500))
        setIsSaving(false)
        toast.success("Pricing updated across all site pages!")
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
                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-blue-600 transition-colors">Individual Session</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={prices.drivingSession}
                                            onChange={(e) => setPrices({ ...prices, drivingSession: Number(e.target.value) })}
                                            className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all rounded-2xl text-lg font-bold text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors">Driver Ed Package (DE)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={prices.driverEdPackage}
                                            onChange={(e) => setPrices({ ...prices, driverEdPackage: Number(e.target.value) })}
                                            className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all rounded-2xl text-lg font-bold text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-violet-600 transition-colors">Premium Bundle (DE + Extra Sessions)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={prices.premiumBundle}
                                            onChange={(e) => setPrices({ ...prices, premiumBundle: Number(e.target.value) })}
                                            className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:border-violet-500/20 focus:ring-4 focus:ring-violet-500/5 transition-all rounded-2xl text-lg font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
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
                                            <Badge className="bg-indigo-500 border-0 text-[10px] font-black px-3 py-1 uppercase tracking-widest text-white">Most Popular</Badge>
                                            <ArrowUpRight className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Driver Education</h4>
                                        <p className="text-xs text-slate-500 font-medium">Complete classroom and road training.</p>
                                    </div>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900 tracking-tight">${prices.driverEdPackage}</span>
                                            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total</span>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { icon: CheckCircle2, text: "30 Hours Classroom", color: "text-green-500" },
                                                { icon: Clock, text: "6 Hours Behind-the-Wheel", color: "text-blue-500" },
                                                { icon: Zap, text: "Instant Certificate", color: "text-amber-500" }
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className={`p-1 rounded-full bg-slate-50 ${feature.color}`}>
                                                        <feature.icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{feature.text}</span>
                                                </div>
                                            ))}
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
