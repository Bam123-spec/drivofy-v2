"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CTA } from "@/components/landing/cta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    CheckCircle2,
    Clock,
    Zap,
    Shield,
    Star,
    Target,
    Sparkles,
    ArrowRight,
    Users,
    Car,
    BookOpen
} from "lucide-react"
import Link from "next/link"

const IconMap: any = {
    CheckCircle2, Clock, Zap, Shield, Star, Target, Sparkles
}

const PLANS = [
    {
        id: "core",
        title: "Core Plan",
        description: "Essential tools for independent instructors and small schools.",
        price_numeric: 34,
        price_display: "$34",
        unit: "/mo",
        popular: false,
        features: [
            { text: "Up to 50 Students", icon: "Users", color: "text-blue-400" },
            { text: "Basic Scheduling", icon: "Calendar", color: "text-blue-400" },
            { text: "Student Progress Tracking", icon: "Target", color: "text-blue-400" },
            { text: "Email Notifications", icon: "Zap", color: "text-blue-400" },
            { text: "Mobile Dashboard", icon: "Sparkles", color: "text-blue-400" }
        ],
        enroll_link: "/signup?plan=core"
    },
    {
        id: "standard",
        title: "Standard Plan",
        description: "Perfect for growing schools needing advanced automation.",
        price_numeric: 59,
        price_display: "$59",
        unit: "/mo",
        popular: true,
        features: [
            { text: "Unlimited Students", icon: "Users", color: "text-blue-400" },
            { text: "Advanced Scheduling Engine", icon: "Zap", color: "text-blue-400" },
            { text: "Multi-Instructor Support", icon: "Car", color: "text-blue-400" },
            { text: "Auto-Billing & Payments", icon: "Shield", color: "text-blue-400" },
            { text: "Theory Class Management", icon: "BookOpen", color: "text-blue-400" },
            { text: "Automated Reminders", icon: "Clock", color: "text-blue-400" }
        ],
        enroll_link: "/signup?plan=standard"
    },
    {
        id: "premium",
        title: "Premium Plan",
        description: "The complete solution for large-scale operations.",
        price_numeric: 89,
        price_display: "$89",
        unit: "/mo",
        popular: false,
        features: [
            { text: "Everything in Standard", icon: "CheckCircle2", color: "text-blue-400" },
            { text: "Advanced Analytics", icon: "Target", color: "text-blue-400" },
            { text: "White-label Portal", icon: "Sparkles", color: "text-blue-400" },
            { text: "Priority 24/7 Support", icon: "Shield", color: "text-blue-400" },
            { text: "Custom API Access", icon: " Zap", color: "text-blue-400" },
            { text: "Dedicated Success Manager", icon: "Star", color: "text-blue-400" }
        ],
        enroll_link: "/signup?plan=premium"
    }
]

export default function PricingPage() {
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
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Every School</span>
                        </h1>
                        <p className="text-xl text-white/60 leading-relaxed font-medium">
                            Choose the package that fits your business. Scale your driving school with our powerful management tools.
                        </p>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {PLANS.map((plan, idx) => (
                            <div
                                key={plan.id}
                                className="relative group transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Glow Effect */}
                                <div className={`absolute -inset-1 bg-gradient-to-r ${plan.popular ? 'from-blue-600 to-indigo-600' : 'from-white/5 to-white/5'} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition duration-1000`} />

                                <Card className={`relative h-full flex flex-col border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:translate-y-[-4px] ${plan.popular ? 'ring-2 ring-blue-500/50' : ''}`}>
                                    <div className="p-8 pb-6 border-b border-white/5">
                                        <div className="flex justify-between items-start mb-6">
                                            {plan.popular ? (
                                                <Badge className="bg-blue-600 border-0 text-[10px] font-black px-3 py-1 uppercase tracking-widest text-white shadow-xl shadow-blue-500/20">Most Popular</Badge>
                                            ) : (
                                                <div className="h-6"></div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{plan.title}</h3>
                                        <p className="text-sm text-white/50 font-medium leading-relaxed min-h-[40px] italic">{plan.description}</p>
                                    </div>

                                    <CardContent className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-5xl font-black tracking-tighter text-white">
                                                {plan.price_display}
                                            </span>
                                            {plan.unit && (
                                                <span className="text-white/40 font-bold">{plan.unit}</span>
                                            )}
                                        </div>

                                        <div className="space-y-4 mb-10 flex-1">
                                            {plan.features?.map((feature: any, i: number) => {
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
                                            className={`w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 ${plan.popular
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 active:scale-95'
                                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95'
                                                }`}
                                        >
                                            <Link href={plan.enroll_link || "/signup"}>
                                                Get Started
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-40">
                    <CTA />
                </div>
            </main>

            <Footer />
        </div>
    )
}
