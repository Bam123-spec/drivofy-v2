import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Sparkles,
  Shield,
  CheckCircle2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Driving School Software Resources | Drivofy",
  description:
    "Guides and resources for driving school owners covering scheduling, automations, student retention, and growth.",
  keywords: [
    "driving school software",
    "driving school management software",
    "driving school resources",
    "driving school automation",
  ],
}

const insights = [
  {
    title: "How to Reduce No-Shows at Your Driving School",
    icon: Star,
    text: "Use automated reminders, confirmations, and simple attendance workflows to keep students showing up.",
  },
  {
    title: "Digital Scheduling vs. Paper Logs",
    icon: Calendar,
    text: "See how digital tools save hours each week and eliminate double-booking headaches.",
  },
  {
    title: "Getting More Google Reviews from Happy Students",
    icon: TrendingUp,
    text: "Turn completed milestones into review requests and grow your reputation automatically.",
  },
  {
    title: "Improving Student Retention and Completion Rates",
    icon: Users,
    text: "Keep students engaged with clearer progress tracking and timely communication.",
  },
  {
    title: "Streamlining Behind-the-Wheel Session Management",
    icon: BookOpen,
    text: "Balance instructor schedules, vehicle availability, and student bookings without conflicts.",
  },
  {
    title: "Reducing Admin Calls and Texts by 50%",
    icon: MessageSquare,
    text: "Give students and instructors the information they need without constant back-and-forth.",
  },
]

const resources = [
  {
    label: "Video Tutorials",
    icon: Sparkles,
    text: "Step-by-step walkthroughs for setup, team training, and workflow optimization.",
  },
  {
    label: "Webinars",
    icon: Shield,
    text: "Live sessions and Q&A with driving school operators and industry experts.",
  },
  {
    label: "Templates & Checklists",
    icon: CheckCircle2,
    text: "Reusable templates for onboarding, communications, and day-to-day operations.",
  },
  {
    label: "Industry Insights",
    icon: TrendingUp,
    text: "Practical guidance on what top-performing schools are doing differently.",
  },
]

export default function Resources() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white selection:bg-primary/30">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <section className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center pt-16 pb-20">
            <Badge
              variant="outline"
              className="mb-4 bg-white/5 border-white/10 text-white/60 uppercase tracking-widest text-[10px] font-black px-3 py-1"
            >
              Resources
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
              Resources for modern
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                driving school owners
              </span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed font-medium max-w-3xl mx-auto">
              Guides, tips, and operational ideas to help you run a smoother school and grow with less admin work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {[
              { label: "Automation", value: "Less manual work", icon: Sparkles },
              { label: "Reputation", value: "More reviews", icon: Star },
              { label: "Operations", value: "Cleaner workflows", icon: Shield },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.label} className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2rem]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-300" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">{item.label}</span>
                    </div>
                    <div className="text-2xl font-black tracking-tight">{item.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-center">Why Drivofy exists</h2>
            <p className="text-white/60 text-center max-w-3xl mx-auto leading-relaxed">
              We built Drivofy after seeing schools waste time on repetitive scheduling, calls, and manual follow-up.
              The resources below are the same thinking behind the product itself.
            </p>
          </div>
          <Card className="max-w-6xl mx-auto border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4">What we heard from schools</h3>
                  <div className="space-y-4 text-white/65 leading-relaxed">
                    <p>
                      Owners were spending 10-15 hours each week juggling spreadsheets, paper logs, Google Calendar,
                      and constant phone calls.
                    </p>
                    <p>
                      Students were confused about schedules. Instructors didn&apos;t know where to be. Owners couldn&apos;t
                      easily see what was happening in the business.
                    </p>
                    <p>
                      Drivofy gives that time back by automating the busy work, so schools can focus on teaching,
                      keeping students on track, and growing faster.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Setup guides",
                    "Workflow tips",
                    "Communication templates",
                    "Operations checklists",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm font-semibold text-white/75"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-6 mb-8 flex-col md:flex-row">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Guides for driving school owners</h2>
                <p className="text-white/60 max-w-2xl leading-relaxed">
                  Practical articles and ideas to help you automate the most repetitive parts of the business.
                </p>
              </div>
              <Button asChild className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                <Link href="/contact">
                  Ask a question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {insights.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.title}
                    className="relative border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2.25rem] overflow-hidden transition-all duration-300 hover:border-white/15 hover:translate-y-[-4px]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-70" />
                    <CardContent className="p-6 md:p-7">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                        <Icon className="h-5 w-5 text-blue-300" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight mb-3">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-white/60">{item.text}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">More resources coming soon</h2>
              <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
                We’re building a library of practical material to help schools onboard faster and run cleaner.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.label} className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2rem]">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">{item.label}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/60">{item.text}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-5xl mx-auto text-center">
            <Card className="border-white/5 bg-gradient-to-br from-white/[0.03] to-blue-500/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 md:p-14">
                <Badge className="mb-4 bg-blue-600/20 text-blue-200 border border-blue-500/30 uppercase tracking-[0.25em] text-[10px] font-black">
                  Want to see Drivofy in action?
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Turn these ideas into workflows</h2>
                <p className="text-xl text-white/60 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Start a trial or book a demo and see how Drivofy helps you use these resources in your day-to-day
                  operations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="text-lg h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                  >
                    <Link href="/pricing">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-lg h-12 px-8 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Link href="/contact">Book a Demo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
