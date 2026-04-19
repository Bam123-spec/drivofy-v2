import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { LogoTicker } from "@/components/landing/logo-ticker"
import { BentoGrid } from "@/components/landing/bento-grid"
import { FeatureSection } from "@/components/landing/feature-section"
import { CTA } from "@/components/landing/cta"

export const metadata: Metadata = {
  title: "Drivofy - Driving School Management Software",
  description:
    "Drivofy helps driving schools manage scheduling, student bookings, instructors, and automation in one platform.",
  keywords: [
    "driving school software",
    "driving school management software",
    "driving school booking software",
    "student portal",
    "instructor scheduling",
  ],
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white selection:bg-primary/30">
      <Header />

      <main className="flex-1">
        <Hero />
        <LogoTicker />
        <BentoGrid />
        <FeatureSection />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}
