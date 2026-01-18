"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
    return (
        <section className="py-32 bg-[#0A0A0B] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                        Ready to modernize your <br />
                        <span className="text-gradient-primary">driving school?</span>
                    </h2>
                    <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                        Join 500+ driving schools that have switched to Drivofy.
                        Start your 30-day free trial today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="h-16 rounded-full bg-white text-black px-10 text-lg font-bold hover:bg-white/90 shadow-xl shadow-white/10 transition-all hover:scale-105" asChild>
                            <Link href="/pricing">
                                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="ghost" className="h-16 rounded-full text-white/70 hover:text-white hover:bg-white/5 px-10 text-lg" asChild>
                            <Link href="/contact">
                                Talk to Sales
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-8 text-sm text-white/30">
                        No credit card required. Cancel anytime.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
