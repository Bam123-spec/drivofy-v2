import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Users, BarChart, MessageSquare, Star, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Trusted by driving schools
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                Run your entire driving school from one dashboard
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty leading-relaxed">
                Streamline scheduling, attendance, student progress tracking, and Google Calendar sync. Save hours every
                week with automated workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg h-12 px-8">
                  <Link href="/pricing">Start 30-Day Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                  <Link href="/contact">Book a Live Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why driving schools choose Drivofy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">No more double-booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Real-time calendar sync prevents scheduling conflicts and keeps instructors organized.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Students book themselves</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Self-service portal lets students schedule lessons, reducing admin calls and texts.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Instructors see their day</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Clear schedule view with student details, locations, and attendance tracking at a glance.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Real-time reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Track revenue, attendance, and student progress with instant dashboard insights.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How Drivofy works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Get your driving school online in three simple steps
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Set up your school</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Add your school details, connect Google Calendar, and configure your course packages.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Invite instructors & students</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Send automated email invitations to get everyone onboarded quickly.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Automate your daily work</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Let Drivofy handle scheduling, reminders, and tracking while you focus on teaching.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Teasers */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {/* Student Portal */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Portal</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Give your students a modern experience. They can view upcoming classes, access Zoom links, book
                    behind-the-wheel sessions, and track their Driver's Ed progress—all in one place.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Self-service lesson booking and rescheduling</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Real-time progress tracking for 10-day Driver's Ed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Instant access to class links and materials</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg bg-muted p-8 flex items-center justify-center min-h-[300px]">
                  <p className="text-muted-foreground text-center">Student Portal Preview</p>
                </div>
              </div>

              {/* Instructor Portal */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="md:order-2">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Instructor Portal</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Your instructors get a clean, simple view of their daily schedule. Mark attendance, see student
                    details, track which car they're using, and manage their workload effortlessly.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Daily schedule with student information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">One-tap attendance marking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Vehicle assignment and tracking</span>
                    </li>
                  </ul>
                </div>
                <div className="md:order-1 rounded-lg bg-muted p-8 flex items-center justify-center min-h-[300px]">
                  <p className="text-muted-foreground text-center">Instructor Portal Preview</p>
                </div>
              </div>

              {/* Admin Dashboard */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Admin Dashboard</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Get a bird's-eye view of your entire operation. Manage scheduling, track payments, view reports, and
                    configure automated workflows from one powerful dashboard.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Revenue and enrollment analytics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Complete attendance and progress summaries</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Automated communications and reminders</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg bg-muted p-8 flex items-center justify-center min-h-[300px]">
                  <p className="text-muted-foreground text-center">Admin Dashboard Preview</p>
                </div>
              </div>

              {/* AI Add-ons */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="md:order-2">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-Powered Add-ons</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Let AI handle repetitive questions and collect more reviews. Our intelligent chatbot answers student
                    FAQs 24/7, while review automation prompts happy students at the perfect moment.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">AI chatbot trained on your school's data</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Automated Google Review requests</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Smart timing for maximum response rates</span>
                    </li>
                  </ul>
                </div>
                <div className="md:order-1 rounded-lg bg-muted p-8 flex items-center justify-center min-h-[300px]">
                  <p className="text-muted-foreground text-center">AI Features Preview</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Loved by driving school owners</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="leading-relaxed">
                    "Drivofy cut our admin time in half. No more phone tag with students trying to book lessons.
                    Everything is automated and our instructors love the simple interface."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Sarah Martinez</p>
                  <p className="text-sm text-muted-foreground">Owner, Martinez Driving School</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="leading-relaxed">
                    "The Google Calendar sync is a game-changer. I used to spend hours managing schedules on
                    spreadsheets. Now it's all automatic and I've had zero double-bookings."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">James Chen</p>
                  <p className="text-sm text-muted-foreground">Director, Safe Drive Academy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="leading-relaxed">
                    "Since using Drivofy's review automation, we've gotten 3x more Google reviews. Students are happier
                    because they can track their progress in real-time."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Linda Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Founder, Elite Driving School</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Get your first month free</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Start your 30-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8">
                <Link href="/pricing">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg h-12 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/contact">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
