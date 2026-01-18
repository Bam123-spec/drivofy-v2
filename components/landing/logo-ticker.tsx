"use client"

import { motion } from "framer-motion"

const logos = [
    { name: "SafeDrive", icon: "🚗" },
    { name: "Elite Academy", icon: "🎓" },
    { name: "Metro Driving", icon: "🏙️" },
    { name: "RoadReady", icon: "🛣️" },
    { name: "Apex Driving", icon: "🏎️" },
    { name: "City Cruisers", icon: "🚕" },
    { name: "Learn2Drive", icon: "📚" },
    { name: "Pro Drivers", icon: "🏆" },
]

export function LogoTicker() {
    return (
        <section className="w-full bg-[#0A0A0B] py-12 border-y border-white/5 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Trusted by forward-thinking driving schools</p>
            </div>

            <div className="relative flex w-full overflow-hidden mask-linear-fade">
                {/* Gradient Masks for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10" />

                <motion.div
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex flex-nowrap gap-16 whitespace-nowrap px-8"
                >
                    {[...logos, ...logos, ...logos].map((logo, idx) => (
                        <div key={idx} className="flex items-center gap-2 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0 cursor-default">
                            <span className="text-2xl">{logo.icon}</span>
                            <span className="text-lg font-bold text-white">{logo.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
