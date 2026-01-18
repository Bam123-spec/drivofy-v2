"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Play, Star } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

export function Hero() {
    return (
        <section className="relative min-h-[110vh] w-full overflow-hidden bg-[#0A0A0B] pt-32 pb-20 md:pt-48">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-30 pointer-events-none" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container relative mx-auto px-4">
                <div className="flex flex-col items-center text-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:border-primary/50"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#8b5cf6]" />
                        <span className="text-gradient">The #1 Platform for Modern Driving Schools</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="max-w-5xl text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
                    >
                        Run your driving school <br />
                        <span className="text-gradient-primary">on autopilot.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed"
                    >
                        Streamline scheduling, automate payments, and give your students a premium mobile experience.
                        The all-in-one operating system designed for growth.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-10 flex flex-col gap-4 sm:flex-row"
                    >
                        <Button size="lg" className="h-14 rounded-full bg-primary px-8 text-lg font-semibold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:bg-primary/90 hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.6)] transition-all duration-300" asChild>
                            <Link href="/pricing">
                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 rounded-full border-white/10 bg-white/5 px-8 text-lg font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all" asChild>
                            <Link href="/contact">
                                <Play className="mr-2 h-4 w-4 fill-current" /> Watch Demo
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-12 flex items-center gap-4 text-sm text-white/40"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0A0A0B] bg-white/10" />
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                                ))}
                            </div>
                            <span className="font-medium text-white/80">4.9/5 from 500+ schools</span>
                        </div>
                    </motion.div>
                </div>

                {/* Dashboard Mockup - 3D Tilt Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 100, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
                    className="relative mt-20 mx-auto max-w-6xl perspective-[2000px]"
                >
                    <div className="relative rounded-xl border border-white/10 bg-[#121214] p-2 shadow-2xl shadow-primary/20 backdrop-blur-sm">
                        {/* Browser Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5 rounded-t-lg">
                            <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-red-500/20" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                                <div className="h-3 w-3 rounded-full bg-green-500/20" />
                            </div>
                            <div className="mx-auto flex h-6 w-full max-w-md items-center justify-center rounded-md bg-black/20 text-[10px] text-white/30 font-mono">
                                drivofy.com/dashboard
                            </div>
                        </div>

                        {/* Mockup Content Image (Placeholder for now, or we can build a CSS UI) */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-lg bg-[#0A0A0B]">
                            {/* Abstract UI Representation */}
                            <div className="absolute inset-0 flex">
                                {/* Sidebar */}
                                <div className="w-64 border-r border-white/5 bg-white/[0.02] p-6 hidden md:block">
                                    <div className="h-8 w-32 rounded-lg bg-white/10 mb-8" />
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-4 w-full rounded bg-white/5" />
                                        ))}
                                    </div>
                                </div>
                                {/* Main Content */}
                                <div className="flex-1 p-8">
                                    <div className="flex justify-between mb-8">
                                        <div className="h-8 w-48 rounded-lg bg-white/10" />
                                        <div className="h-8 w-24 rounded-lg bg-primary/20" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                                <div className="h-8 w-8 rounded-lg bg-primary/20 mb-4" />
                                                <div className="h-6 w-24 rounded bg-white/10 mb-2" />
                                                <div className="h-4 w-16 rounded bg-white/5" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-64 rounded-xl border border-white/5 bg-white/[0.02]" />
                                </div>
                            </div>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-12 top-20 hidden lg:block"
                    >
                        <GlassCard className="p-4 w-64">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">New Booking</div>
                                    <div className="text-xs text-white/50">Just now</div>
                                </div>
                            </div>
                            <div className="text-xs text-white/70">
                                <span className="text-white font-medium">Sarah J.</span> booked a driving lesson for tomorrow at 2 PM.
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -left-12 bottom-40 hidden lg:block"
                    >
                        <GlassCard className="p-4 w-56">
                            <div className="text-sm font-semibold text-white mb-2">Revenue Today</div>
                            <div className="text-3xl font-bold text-white mb-1">$1,240</div>
                            <div className="flex items-center gap-1 text-xs text-green-400">
                                <span>+12%</span>
                                <span className="text-white/40">vs last week</span>
                            </div>
                        </GlassCard>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    )
}
