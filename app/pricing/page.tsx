"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CTA } from "@/components/landing/cta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOfferingsForPage, type Offering } from "@/app/actions/website"
import {
    CheckCircle2,
    Clock,
    Zap,
    Shield,
    Star,
    Target,
    Sparkles,
    ArrowRight,
    Loader2
} from "lucide-react"
import Link from "next/link"

const IconMap: any = {
    CheckCircle2, Clock, Zap, Shield, Star, Target, Sparkles
}

export default function PricingPage() {
    const [offerings, setOfferings] = useState<Offering[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                // Fetch packages for the pricing page
                const data = await getOfferingsForPage('drivers-ed-packages', 'pricing_cards')
                setOfferings(data || [])
            } catch (error) {
                console.error("Failed to load pricing:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white selection:bg-primary/30">
            <Header />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="max-w-3xl mx-auto text-center mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <Badge variant="outline" className="mb-4 bg-white/5 border-white/10 text-white/60 uppercase tracking-widest text-[10px] font-black px-3 py-1">
                            Pricing Plans
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
                            Transparent Pricing for <br />
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Every Journey</span>
                        </h1>
                        <p className="text-xl text-white/60 leading-relaxed font-medium">
                            Choose the package that fits your goals. No hidden fees, just value-packed driving education.
                        </p>
                    </div>

                    {/* Pricing Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-white/40 font-medium">Loading packages...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {offerings.map((offering, idx) => (
                                <div
                                    key={offering.id}
                                    className="relative group transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Glow Effect */}
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${offering.popular ? 'from-blue-600 to-indigo-600' : 'from-white/5 to-white/5'} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition duration-1000`} />

                                    <Card className={`relative h-full flex flex-col border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:translate-y-[-4px] ${offering.popular ? 'ring-2 ring-blue-500/50' : ''}`}>
                                        <div className="p-8 pb-6 border-b border-white/5">
                                            <div className="flex justify-between items-start mb-6">
                                                {offering.popular ? (
                                                    <Badge className="bg-blue-600 border-0 text-[10px] font-black px-3 py-1 uppercase tracking-widest text-white shadow-xl shadow-blue-500/20">Most Popular</Badge>
                                                ) : (
                                                    <div className="h-6"></div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{offering.title}</h3>
                                            <p className="text-sm text-white/50 font-medium leading-relaxed min-h-[40px] italic">{offering.description}</p>
                                        </div>

                                        <CardContent className="p-8 flex-1 flex flex-col">
                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-5xl font-black tracking-tighter text-white">
                                                    {offering.price_display || `$${offering.price_numeric}`}
                                                </span>
                                            </div>

                                            <div className="space-y-4 mb-10 flex-1">
                                                {offering.features?.map((feature: any, i: number) => {
                                                    const Icon = IconMap[feature.icon || 'CheckCircle2'] || CheckCircle2
                                                    return (
                                                        <div key={i} className="flex items-start gap-4">
                                                            <div className={`p-1 mt-0.5 rounded-full bg-white/5 border border-white/10 ${feature.color || 'text-blue-400'}`}>
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="text-sm font-bold text-white/70 leading-snug">{feature.text}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <Button
                                                asChild
                                                className={`w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 ${offering.popular
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 active:scale-95'
                                                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95'
                                                    }`}
                                            >
                                                <Link href={offering.enroll_link || "/signup"}>
                                                    Get Started
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}

                    {offerings.length === 0 && !loading && (
                        <div className="text-center py-40 border border-dashed border-white/10 rounded-[3rem]">
                            <p className="text-white/40 font-medium text-xl">No packages available at the moment.</p>
                        </div>
                    )}
                </div>

                <div className="mt-40">
                    <CTA />
                </div>
            </main>

            <Footer />
        </div>
    )
}
