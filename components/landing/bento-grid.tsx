"use client"

import { motion } from "framer-motion"
import { Calendar, CheckCircle, Users, BarChart, Clock, Shield, Smartphone, Zap } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

const features = [
    {
        title: "Smart Scheduling",
        description: "AI-powered calendar that prevents conflicts and optimizes routes.",
        icon: Calendar,
        className: "md:col-span-2",
        gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
        title: "Student Portal",
        description: "Self-service booking for students.",
        icon: Smartphone,
        className: "md:col-span-1",
        gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
        title: "Real-time Tracking",
        description: "Know exactly where your cars are.",
        icon: Clock,
        className: "md:col-span-1",
        gradient: "from-orange-500/20 to-red-500/20"
    },
    {
        title: "Automated Payments",
        description: "Collect payments instantly via Stripe integration.",
        icon: Zap,
        className: "md:col-span-2",
        gradient: "from-pink-500/20 to-rose-500/20"
    },
]

export function BentoGrid() {
    return (
        <section className="bg-[#0A0A0B] py-32 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to scale.</h2>
                    <p className="text-lg text-white/60">
                        Replace your fragmented tools with one cohesive operating system.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={feature.className}
                        >
                            <GlassCard className="h-full p-8 group overflow-hidden">
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="h-6 w-6" />
                                    </div>

                                    <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
