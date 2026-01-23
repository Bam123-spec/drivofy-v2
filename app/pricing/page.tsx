import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, Clock, Star, Shield, Target, Sparkles, ArrowUpRight, DollarSign } from "lucide-react"
import { getOfferingsForPage } from "@/app/actions/website"

export const metadata = {
  title: "Pricing | Drivofy",
  description: "Simple, transparent pricing for all our driving packages.",
}

// Icon mapping
const IconMap: any = {
  CheckCircle2, Clock, Zap, Shield, Star, Target, Sparkles
}

export default async function Pricing() {
  // Fetch dynamic data from CMS
  const offerings = await getOfferingsForPage('drivers-ed-packages', 'pricing_cards')

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100">
      {/* 
                Header Note: The current global header is dark/transparent. 
                It will sit on top of our light page or blue banner. 
                Ideally, we'd have a light-mode header variant, but for now 
                we keep the global header.
            */}
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">

          {/* Blue Gradient Hero Banner - Matching Admin Editor Style */}
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-1 shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

            <div className="relative bg-white/5 backdrop-blur-xl rounded-[2.4rem] px-8 py-16 md:py-20 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12 border border-white/20">
              <div className="space-y-6 max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mx-auto md:mx-0">
                  <Sparkles className="h-3 w-3 fill-current" />
                  Simple & Transparent
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                  Investment in <br /><span className="text-blue-200">Safety & Skills</span>
                </h1>
                <p className="text-blue-100/90 text-lg font-medium leading-relaxed max-w-lg">
                  Choose the package that fits your goals. Whether you need a full driver education course or just a refresher session.
                </p>
              </div>

              {/* Decorative Icon Cluster */}
              <div className="hidden md:flex -space-x-6">
                <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <DollarSign className="h-10 w-10" />
                </div>
                <div className="h-24 w-24 rounded-3xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl rotate-12 -translate-y-6 border border-white/20 transform hover:rotate-6 transition-transform duration-500 z-10">
                  <Target className="h-10 w-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start pt-8">
            {offerings?.map((offering: any) => (
              <div key={offering.id} className="relative group transition-all duration-500 hover:-translate-y-2">
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${offering.popular ? 'from-indigo-500 to-purple-500' : 'from-slate-200 to-slate-300'} rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-1000`} />

                <Card className="relative border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white h-full flex flex-col ring-1 ring-slate-100">
                  <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex justify-between items-start mb-6">
                      {offering.popular ? (
                        <Badge className="bg-indigo-500 border-0 text-[10px] font-black px-3 py-1 uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30">Most Popular</Badge>
                      ) : (
                        <div className="h-6"></div> /* Spacer */
                      )}
                      {offering.popular && <ArrowUpRight className="h-5 w-5 text-indigo-500" />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{offering.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{offering.description}</p>
                  </div>
                  <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${offering.popular ? 'text-indigo-600' : 'text-slate-900'}`}>{offering.price_display}</span>
                    </div>

                    <div className="space-y-4 flex-1">
                      {offering.features?.map((feature: any, i: number) => {
                        const Icon = IconMap[feature.icon || 'CheckCircle2'] || CheckCircle2
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`p-1 mt-0.5 rounded-full bg-slate-50 border border-slate-100 ${feature.color || 'text-slate-600'}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-bold text-slate-600 leading-snug">{feature.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    <Button
                      asChild
                      size="lg"
                      className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 ${offering.popular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-500/30'
                          : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'
                        }`}
                    >
                      <Link href={offering.enroll_link || '/contact'}>
                        Enroll Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}

            {(!offerings || offerings.length === 0) && (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-2xl bg-white border border-slate-100 shadow-xl">
                  <p className="text-slate-500 font-medium">No pricing packages found.</p>
                  <p className="text-xs text-slate-400 mt-2">Configure them in the <Link href="/admin/pricing" className="text-indigo-600 hover:underline">Admin Dashboard</Link>.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
