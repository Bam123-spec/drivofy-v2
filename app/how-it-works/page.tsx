import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Settings, Users, Calendar, BarChart, Bell } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                From setup to success in 5 simple steps
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get your driving school online and automated in less than an hour. Here's exactly how it works.
              </p>
            </div>
          </div>
        </section>

        {/* Step-by-Step Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-20">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    1
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Onboard your school</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Set up your school profile with basic information. Add your driving school name, location, contact
                    details, and business hours.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Enter school details and branding</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Connect your Google Calendar</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Configure course packages (Driver's Ed, BTW, etc.)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Set up your vehicles and availability</span>
                    </div>
                  </div>
                </div>
                <Card className="bg-muted/30">
                  <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                    <Settings className="w-32 h-32 text-muted-foreground/30" />
                  </CardContent>
                </Card>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>

              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <Card className="bg-muted/30 md:order-2">
                  <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                    <Users className="w-32 h-32 text-muted-foreground/30" />
                  </CardContent>
                </Card>
                <div className="md:order-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    2
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Invite instructors and students</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Add your team and students with automated email invitations. They'll get instant access to their
                    personalized portals.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Send automatic email invites to instructors</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Invite students individually or in bulk</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Set up user roles and permissions</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Everyone gets instant portal access</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>

              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    3
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Students book and attend</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Students log into their portal to see their schedule, book BTW sessions, access Zoom links, and
                    track their progress through Driver's Ed.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">View full course schedule and upcoming classes</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Self-book their 3 included BTW sessions</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Click Zoom links to join online classes</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">See real-time progress through their program</span>
                    </div>
                  </div>
                </div>
                <Card className="bg-muted/30">
                  <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                    <Calendar className="w-32 h-32 text-muted-foreground/30" />
                  </CardContent>
                </Card>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>

              {/* Step 4 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <Card className="bg-muted/30 md:order-2">
                  <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                    <Bell className="w-32 h-32 text-muted-foreground/30" />
                  </CardContent>
                </Card>
                <div className="md:order-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    4
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Instructors run their day</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Your instructors see their complete daily schedule, mark attendance with one tap, view student
                    details, and know exactly which car they're using for each session.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">View clean daily schedule with all details</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">One-tap attendance marking (present/absent)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Submit quiz scores and session notes</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Get notified of schedule changes instantly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>

              {/* Step 5 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    5
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">You watch everything from one dashboard</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Get a complete overview of your driving school operations. Track revenue, monitor attendance, see
                    student progress, and let automations handle the repetitive work.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Real-time revenue and enrollment metrics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Class attendance summaries and trends</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Student progress tracking for all programs</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Automated reminders, reviews, and follow-ups</span>
                    </div>
                  </div>
                </div>
                <Card className="bg-muted/30">
                  <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                    <BarChart className="w-32 h-32 text-muted-foreground/30" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Summary */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Your journey with Drivofy</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              See how Drivofy transforms your driving school week by week
            </p>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

                <div className="space-y-8">
                  <div className="relative flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
                      Day 1
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Setup & Onboarding</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Complete initial setup, connect Google Calendar, configure packages, and invite your team.
                          Most schools finish this in under 30 minutes.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
                      Week 1
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">First Classes Running</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Students are booking sessions, instructors are marking attendance, and automated reminders are
                          reducing no-shows by 30-40%.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
                      Week 2
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Admin Time Reduced</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          You're spending 50% less time on scheduling calls and texts. The system handles most student
                          questions and booking requests automatically.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
                      Month 1
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Full Automation Active</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Complete workflow automation is in place. Review requests are generating 3x more Google
                          Reviews. You have clear visibility into revenue and attendance trends.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold z-10">
                      Month 3+
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Growth Mode</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          With admin work automated, you're focusing on business growth. More Google Reviews bring more
                          enrollments. Your team is happier and more efficient.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Start your 30-day free trial and see how Drivofy transforms your driving school operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link href="/pricing">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
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
