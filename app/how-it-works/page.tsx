import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Settings,
  Users,
  Sparkles,
  Shield,
  ClipboardCheck,
} from "lucide-react"

export const metadata: Metadata = {
  title: "How Drivofy Works | Driving School Software",
  description:
    "See how Drivofy helps driving schools onboard staff, manage students, automate scheduling, and run daily operations.",
  keywords: [
    "driving school software",
    "driving school management software",
    "how driving school software works",
    "student portal",
    "driving school automation",
  ],
}

const steps = [
  {
    number: "01",
    title: "Onboard your school",
    description:
      "Set up your school profile, connect the tools you already use, and prepare your packages and availability.",
    icon: Settings,
    bullets: [
      "Add school details, branding, and locations",
      "Connect Google Calendar and business hours",
      "Configure course packages and pricing",
      "Set up instructors, vehicles, and schedules",
    ],
  },
  {
    number: "02",
    title: "Invite instructors and students",
    description:
      "Send clean, branded invitations so your staff and students can access the right portal instantly.",
    icon: Users,
    bullets: [
      "Invite instructors with their own portal access",
      "Add students one-by-one or in bulk",
      "Assign roles and permissions automatically",
      "Let everyone land in the right workflow",
    ],
  },
  {
    number: "03",
    title: "Students book and stay updated",
    description:
      "Students see their schedule, book sessions, and track progress without calling the office.",
    icon: Calendar,
    bullets: [
      "View upcoming classes and driving sessions",
      "Book behind-the-wheel credits when available",
      "Join classes through direct links and reminders",
      "See progress in real time from the portal",
    ],
  },
  {
    number: "04",
    title: "Instructors run their day",
    description:
      "Your instructors get a clean daily view of who they’re teaching, where they’re going, and what comes next.",
    icon: Bell,
    bullets: [
      "Review the full daily schedule at a glance",
      "Mark attendance and record session notes",
      "See assigned vehicles and student details",
      "Get notified when schedules change",
    ],
  },
  {
    number: "05",
    title: "You manage everything from one dashboard",
    description:
      "Owners and admins can track revenue, attendance, enrollments, and automation from a single place.",
    icon: BarChart3,
    bullets: [
      "Monitor revenue, bookings, and enrollments",
      "Track attendance and completion trends",
      "Automate reminders and review requests",
      "Keep every moving part visible in one view",
    ],
  },
]

const summary = [
  { label: "Day 1", title: "Setup & branding", text: "Get the school online, configure packages, and connect calendars." },
  { label: "Week 1", title: "Live bookings", text: "Students start booking, reminders go out, and staff see their schedules." },
  { label: "Week 2", title: "Less admin work", text: "Your team spends less time on calls, texts, and manual coordination." },
  { label: "Month 1", title: "Automation active", text: "Reviews, follow-ups, and progress workflows start running on autopilot." },
]

export default function HowItWorks() {
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
              How It Works
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
              From setup to success
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                in 5 simple steps
              </span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed font-medium max-w-3xl mx-auto">
              Get your driving school online and automated with a workflow that feels as polished as our pricing and
              home pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {[
              { label: "Setup time", value: "Under 1 hour", icon: Sparkles },
              { label: "Admin saved", value: "Hours each week", icon: Shield },
              { label: "Student access", value: "Instant portals", icon: ClipboardCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.label}
                  className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] overflow-hidden"
                >
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
          <div className="max-w-7xl mx-auto space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const reverse = index % 2 === 1

              return (
                <Card
                  key={step.number}
                  className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${reverse ? "lg:[direction:rtl]" : ""}`}>
                    <div className={`p-8 md:p-10 lg:p-12 ${reverse ? "lg:[direction:ltr]" : ""}`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black tracking-widest text-white/80">
                          {step.number}
                        </div>
                        <Badge className="bg-blue-600/20 text-blue-200 border border-blue-500/30 uppercase tracking-[0.2em] text-[10px] font-black">
                          Step
                        </Badge>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{step.title}</h2>
                      <p className="text-white/60 leading-relaxed text-lg mb-8 max-w-xl">{step.description}</p>

                      <div className="space-y-4">
                        {step.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                            <span className="text-white/75 leading-relaxed font-medium">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`p-8 md:p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/5 ${
                        reverse ? "lg:[direction:ltr]" : ""
                      }`}
                    >
                      <div className="h-full min-h-[320px] rounded-[2rem] bg-gradient-to-br from-white/5 via-white/[0.03] to-blue-500/10 border border-white/10 shadow-[0_0_60px_-20px_rgba(59,130,246,0.35)] flex items-center justify-center">
                        <div className="text-center px-8">
                          <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Icon className="h-10 w-10 text-blue-300" />
                          </div>
                          <p className="text-sm uppercase tracking-[0.3em] text-white/30 font-black mb-2">Visual Flow</p>
                          <h3 className="text-2xl font-black tracking-tight mb-3">{step.title}</h3>
                          <p className="text-white/55 leading-relaxed max-w-sm mx-auto">
                            {step.number === "01" &&
                              "School setup, packages, and integrations all start here."}
                            {step.number === "02" &&
                              "A clean invite flow gets instructors and students into the right portal."}
                            {step.number === "03" &&
                              "Students can book, view class schedules, and stay on track without back-and-forth."}
                            {step.number === "04" &&
                              "Instructors manage attendance and daily sessions from one simple view."}
                            {step.number === "05" &&
                              "Owners see metrics, automation, and progress across the whole business."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Your journey with Drivofy</h2>
              <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
                A simple rollout that moves from setup to full automation without a long implementation cycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {summary.map((item) => (
                <Card key={item.label} className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2rem]">
                  <CardContent className="p-6">
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-blue-300 mb-3">
                      {item.label}
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-3">{item.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-5xl mx-auto text-center">
            <Card className="border-white/5 bg-gradient-to-br from-white/[0.03] to-blue-500/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 md:p-14">
                <Badge className="mb-4 bg-blue-600/20 text-blue-200 border border-blue-500/30 uppercase tracking-[0.25em] text-[10px] font-black">
                  Ready to move faster?
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">See the workflow in action</h2>
                <p className="text-xl text-white/60 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Start your 30-day free trial or book a demo and see how Drivofy simplifies operations for your
                  driving school.
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
