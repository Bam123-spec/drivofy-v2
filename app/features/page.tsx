import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  BotMessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MessageSquare,
  Smartphone,
  Star,
  Users,
  Shield,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Driving School Software Features | Drivofy",
  description:
    "Explore Drivofy features for student portals, instructor scheduling, automations, reporting, and AI add-ons.",
  keywords: [
    "driving school software",
    "driving school management software",
    "driving school software features",
    "student portal",
    "instructor scheduling",
    "driving school automation",
  ],
}

const featureSections = [
  {
    title: "Student Portal",
    description: "Give students a polished self-service portal to manage their learning journey.",
    icon: Smartphone,
    items: [
      { title: "View upcoming classes", text: "Students see all scheduled classes and BTW sessions in one clean view.", icon: Calendar },
      { title: "Track progress", text: "Real-time progress tracking for Driver's Ed programs and milestones.", icon: BookOpen },
      { title: "Self-service booking", text: "Students book sessions based on instructor availability without calling the office.", icon: Clock },
      { title: "Automated reminders", text: "Email and SMS reminders keep everyone on track and reduce no-shows.", icon: Bell },
      { title: "Zoom and materials", text: "Online links, course documents, quizzes, and certificates in one place.", icon: FileText },
      { title: "Mobile friendly", text: "A fast, responsive portal students can use from any device.", icon: Smartphone },
    ],
  },
  {
    title: "Instructor Portal",
    description: "A focused interface that helps instructors manage their day efficiently.",
    icon: Users,
    items: [
      { title: "Daily schedule view", text: "See the full day at a glance with students, times, and vehicles.", icon: Calendar },
      { title: "Mark attendance", text: "One-tap present/absent marking updates the office and student progress.", icon: CheckCircle2 },
      { title: "Student details", text: "Quick access to contact info and program status.", icon: Users },
      { title: "Submit quizzes and forms", text: "Instructors can submit scores and completion forms from the portal.", icon: FileText },
      { title: "Schedule notifications", text: "Stay informed about changes, cancellations, and new bookings.", icon: Bell },
      { title: "Mobile friendly", text: "Manage everything from phone or tablet while on the move.", icon: Smartphone },
    ],
  },
  {
    title: "Scheduling & Calendar",
    description: "Powerful scheduling tools that prevent conflicts and keep everyone organized.",
    icon: Calendar,
    items: [
      { title: "Google Calendar sync", text: "Two-way sync keeps instructor calendars current.", icon: Calendar },
      { title: "No double-booking", text: "Real-time availability checking prevents conflicts automatically.", icon: Shield },
      { title: "Real-time availability", text: "Students only see slots that are actually available.", icon: Clock },
      { title: "Multi-instructor management", text: "Manage schedules for every instructor from one place.", icon: Users },
      { title: "Automatic rescheduling", text: "Prompt students to book makeup sessions when they miss a class.", icon: Bell },
      { title: "Custom rules", text: "Set buffer times, break periods, and booking windows.", icon: FileText },
    ],
  },
  {
    title: "Automations & Communication",
    description: "Let Drivofy handle repetitive communication so you can focus on teaching.",
    icon: MessageSquare,
    items: [
      { title: "Class reminders", text: "Automated email and SMS reminders before each class.", icon: Bell },
      { title: "Absence notifications", text: "Students get automatic prompts to book makeup sessions.", icon: MessageSquare },
      { title: "Email and SMS support", text: "Reach students on their preferred channel.", icon: Smartphone },
      { title: "Progress updates", text: "Notify students and parents when milestones are reached.", icon: BookOpen },
      { title: "Follow-up sequences", text: "Re-engage inactive students automatically.", icon: Clock },
      { title: "Instructor notifications", text: "Instructors get instant alerts for bookings and changes.", icon: Users },
    ],
  },
  {
    title: "Reporting & Admin",
    description: "Get the insights you need to run and grow your driving school business.",
    icon: BarChart3,
    items: [
      { title: "Revenue overview", text: "Track monthly revenue, payment status, and outstanding balances.", icon: CreditCard },
      { title: "Enrollment analytics", text: "See package popularity and growth over time.", icon: BarChart3 },
      { title: "Attendance summaries", text: "Monitor attendance rates and identify no-show patterns.", icon: CheckCircle2 },
      { title: "Student progress tracking", text: "See who needs attention and where they are in the program.", icon: BookOpen },
      { title: "Export reports", text: "Download detailed reports for accounting or compliance.", icon: FileText },
      { title: "Owner dashboards", text: "Keep the business visible from one place.", icon: Users },
    ],
  },
  {
    title: "AI Add-ons",
    description: "Optional AI-powered features to save more time and grow your business.",
    icon: BotMessageSquare,
    items: [
      { title: "AI chatbot", text: "Answer common questions 24/7 using your school's own data.", icon: BotMessageSquare },
      { title: "Review automation", text: "Ask happy students for Google Reviews at the perfect moment.", icon: Star },
      { title: "FAQ support", text: "Answer pricing, schedules, and requirements automatically.", icon: Shield },
      { title: "Lead capture", text: "Turn more site visitors into conversations and enrollments.", icon: Sparkles },
      { title: "Reduced admin load", text: "Cut repetitive questions and manual follow-ups.", icon: Clock },
      { title: "Better conversions", text: "Keep leads warm with intelligent automation.", icon: MessageSquare },
    ],
  },
]

export default function Features() {
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
              Features
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
              Every part of your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                driving school, organized
              </span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed font-medium max-w-3xl mx-auto">
              From student bookings to instructor schedules to owner analytics, Drivofy handles it all in one
              integrated platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {[
              { label: "Student", value: "Self-service portal", icon: Smartphone },
              { label: "Instructor", value: "Clean daily workflow", icon: Users },
              { label: "Owner", value: "Full visibility", icon: BarChart3 },
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
          <div className="max-w-7xl mx-auto space-y-6">
            {featureSections.map((section, index) => {
              const SectionIcon = section.icon
              return (
                <Card
                  key={section.title}
                  className="border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden"
                >
                  <div className="p-8 md:p-10 lg:p-12 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="h-14 w-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <SectionIcon className="h-6 w-6 text-blue-300" />
                      </div>
                      <div>
                        <Badge className="mb-2 bg-blue-600/20 text-blue-200 border border-blue-500/30 uppercase tracking-[0.2em] text-[10px] font-black">
                          Section {String(index + 1).padStart(2, "0")}
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{section.title}</h2>
                      </div>
                    </div>
                    <p className="text-white/60 leading-relaxed text-lg max-w-3xl">{section.description}</p>
                  </div>

                  <CardContent className="p-8 md:p-10 lg:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <div
                            key={item.title}
                            className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <ItemIcon className="h-4 w-4 text-blue-300" />
                              </div>
                              <div>
                                <h3 className="font-black tracking-tight text-lg leading-tight">{item.title}</h3>
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed text-white/60">{item.text}</p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-5xl mx-auto text-center">
            <Card className="border-white/5 bg-gradient-to-br from-white/[0.03] to-blue-500/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 md:p-14">
                <Badge className="mb-4 bg-blue-600/20 text-blue-200 border border-blue-500/30 uppercase tracking-[0.25em] text-[10px] font-black">
                  Everything in one place
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">See Drivofy in action</h2>
                <p className="text-xl text-white/60 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Start your 30-day free trial or book a demo and see how Drivofy connects your student, instructor,
                  and owner workflows.
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
