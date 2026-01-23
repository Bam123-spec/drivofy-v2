import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, Clock, Star, Shield, Target, Sparkles, ArrowUpRight } from "lucide-react"
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
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white selection:bg-primary/30">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
                Simple, transparent <span className="text-gradient-primary">pricing</span>
              </h1>
              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                Choose the package that fits your needs. No hidden fees.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
              {offerings?.map((offering: any) => (
                <div key={offering.id} className="relative group transition-all duration-500 hover:-translate-y-2">
                  {/* Glow Effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${offering.popular ? 'from-indigo-500 to-purple-500' : 'from-white/10 to-white/5'} rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000`} />

                  <Card className="relative border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white h-full flex flex-col">
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
                        {offering.price_display.startsWith('$') ? (
                          <>
                            <span className="text-4xl font-black text-slate-900 tracking-tight">{offering.price_display}</span>
                          </>
                        ) : (
                          <span className="text-3xl font-black text-slate-900 tracking-tight">{offering.price_display}</span>
                        )}
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
                          Example Enroll Link
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {(!offerings || offerings.length === 0) && (
                <div className="col-span-full text-center py-20 text-white/50">
                  No pricing packages found. Please configure them in the Admin Dashboard.
                </div>
              )}

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
