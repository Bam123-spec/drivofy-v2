import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, Star, Calendar, Users, MessageSquare } from "lucide-react"

export default function Resources() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Resources for driving school owners</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Guides, tips, and best practices to help you run and grow a successful driving school business.
              </p>
            </div>
          </div>
        </section>

        {/* Why Drivofy Exists */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Why Drivofy exists</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We built Drivofy after talking to dozens of driving school owners who were spending 10-15 hours per
                  week just managing schedules, answering repetitive questions, and chasing down no-shows.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Most were juggling spreadsheets, paper logs, Google Calendar, and constant phone calls. Students were
                  confused about their schedules. Instructors didn't know where to be. Owners couldn't easily see what
                  was happening in their business.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Drivofy gives you back that time by automating the busy work, so you can focus on teaching great
                  drivers and growing your business. Every feature we build solves a real pain point we've heard
                  directly from driving school owners like you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guides Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Guides for driving school owners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Star className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">How to Reduce No-Shows at Your Driving School</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Learn proven strategies to reduce student no-shows by up to 40%. Discover the power of automated
                    reminders, confirmation workflows, and student accountability systems.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Calendar className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Digital Scheduling vs. Paper Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Why digital scheduling saves driving schools 10+ hours per week. Compare the real costs of manual
                    scheduling systems versus modern automation tools.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <TrendingUp className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Getting More Google Reviews from Happy Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Google Reviews are the #1 factor in new student enrollments. Learn when to ask, how to ask, and how
                    to automate the process for 3x more reviews.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Improving Student Retention and Completion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Keep students engaged and progressing through their programs. Strategies for tracking progress,
                    maintaining motivation, and reducing dropout rates.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <BookOpen className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Streamlining Behind-the-Wheel Session Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Best practices for scheduling BTW sessions efficiently. How to balance instructor workload, vehicle
                    availability, and student preferences without conflicts.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <MessageSquare className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-xl">Reducing Admin Calls and Texts by 50%</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    How to give students and instructors the information they need without constant communication.
                    Self-service portals, automated notifications, and clear expectations.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">More resources coming soon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Tutorials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Step-by-step video guides for setting up Drivofy, training your staff, and optimizing your
                      workflows.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Webinars</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Live Q&A sessions with driving school experts. Learn from other owners' experiences and get your
                      questions answered.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Templates & Checklists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Downloadable templates for student communications, instructor onboarding, and business operations.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Industry Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Data-driven insights about the driving school industry, trends, and what top-performing schools
                      are doing differently.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
