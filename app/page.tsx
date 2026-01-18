import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { LogoTicker } from "@/components/landing/logo-ticker"
import { BentoGrid } from "@/components/landing/bento-grid"
import { FeatureSection } from "@/components/landing/feature-section"
import { CTA } from "@/components/landing/cta"

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
