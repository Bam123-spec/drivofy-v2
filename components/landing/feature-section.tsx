"use client"

import { motion } from "framer-motion"
import { CheckCircle, Calendar, MessageSquare, Star } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

export function FeatureSection() {
    return (
        <section className="bg-[#0A0A0B] py-32 relative overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Feature 1: Student Portal */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                            Student Experience
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            A portal your students <br />
                            <span className="text-gradient-primary">will actually love.</span>
                        </h2>
                        <p className="text-lg text-white/60 mb-8 leading-relaxed">
                            Give your students a modern, mobile-first experience. They can book lessons, track progress, and access study materials without ever calling you.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Self-service booking & rescheduling",
                                "Real-time progress tracking",
                                "Mobile-optimized interface",
                                "Automated lesson reminders"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/80">
                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Mobile App Mockup */}
                        <div className="relative mx-auto w-[300px] h-[600px] bg-[#121214] rounded-[3rem] border-8 border-[#27272a] shadow-2xl overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#27272a] rounded-b-2xl z-20" />

                            {/* Screen Content */}
                            <div className="h-full w-full bg-[#0A0A0B] pt-12 px-4 pb-4 overflow-hidden relative">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div className="text-xs text-white/50">Good morning,</div>
                                        <div className="text-lg font-bold text-white">Alex</div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/10" />
                                </div>

                                {/* Progress Card */}
                                <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-4 mb-6 shadow-lg shadow-primary/20">
                                    <div className="text-white/80 text-xs mb-1">Course Progress</div>
                                    <div className="text-2xl font-bold text-white mb-2">75%</div>
                                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-white rounded-full" />
                                    </div>
                                </div>

                                {/* Upcoming Lesson */}
                                <div className="mb-2 text-sm font-semibold text-white">Next Lesson</div>
                                <GlassCard className="p-4 mb-6">
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">Driving Session</div>
                                            <div className="text-xs text-white/50">Tomorrow, 2:00 PM</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Quick Actions Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                                        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="text-xs text-white/70">Book</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square">
                                        <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div className="text-xs text-white/70">Chat</div>
                                    </div>
                                </div>

                                {/* Bottom Nav */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#121214]/80 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-6">
                                    <div className="h-1 w-12 bg-white/20 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
                    </motion.div>
                </div>

                {/* Feature 2: Instructor Dashboard */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:order-2"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 mb-6">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Instructor Efficiency
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Tools that empower <br />
                            <span className="text-gradient">your best teachers.</span>
                        </h2>
                        <p className="text-lg text-white/60 mb-8 leading-relaxed">
                            Eliminate paperwork and confusion. Instructors get a clear daily schedule, one-tap attendance, and digital grading sheets.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Digital daily manifest",
                                "One-tap attendance & grading",
                                "Vehicle assignment tracking",
                                "Automated payroll reports"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/80">
                                    <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:order-1 relative"
                    >
                        {/* Desktop Dashboard Mockup */}
                        <GlassCard className="p-2 rounded-xl bg-[#121214] border border-white/10 shadow-2xl">
                            <div className="bg-[#0A0A0B] rounded-lg overflow-hidden aspect-[4/3] relative">
                                {/* Sidebar */}
                                <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-white/5 bg-white/[0.02] flex flex-col items-center py-4 gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500" />
                                    <div className="h-px w-8 bg-white/10" />
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-8 rounded-lg bg-white/5" />)}
                                </div>

                                {/* Content */}
                                <div className="ml-16 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="h-6 w-32 bg-white/10 rounded" />
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded-full bg-white/10" />
                                            <div className="h-8 w-24 rounded-lg bg-blue-500/20" />
                                        </div>
                                    </div>

                                    {/* Calendar Grid Mockup */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                                                <div className="w-12 text-center">
                                                    <div className="text-xs text-white/40">09:00</div>
                                                    <div className="text-xs text-white/40">AM</div>
                                                </div>
                                                <div className="h-12 w-1 bg-blue-500 rounded-full" />
                                                <div className="flex-1">
                                                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                                                    <div className="h-3 w-24 bg-white/5 rounded" />
                                                </div>
                                                <div className="h-8 w-20 bg-green-500/10 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Floating Stats Card */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-8 -bottom-8"
                        >
                            <GlassCard className="p-4 w-48 bg-[#18181b]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-white">4.9 Rating</span>
                                </div>
                                <div className="text-xs text-white/60">Based on 124 student reviews this month.</div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                </div>

            </div>
        </section>
    )
}
