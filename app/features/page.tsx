import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  BarChart,
  Bell,
  Smartphone,
  CheckCircle,
  BotMessageSquare,
  Star,
  Clock,
  CreditCard,
  FileText,
} from "lucide-react"

export default function Features() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                Every part of your driving school, organized
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From student bookings to instructor schedules to owner analytics—Drivofy handles it all in one
                integrated platform.
              </p>
            </div>
          </div>
        </section>

        {/* Student Portal */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Portal</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Give your students a professional self-service portal to manage their learning journey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Calendar className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>View Upcoming Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Students see all their scheduled Driver's Ed classes, behind-the-wheel sessions, and any makeup
                    classes in one clean calendar view.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Smartphone className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Instant Zoom Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Every online class shows the Zoom link right in their dashboard. No more hunting through emails or
                    texts.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Real-time progress tracking for 10-day Driver's Ed programs. Students know exactly which classes
                    they've completed and what's left.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Self-Service Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Students book their BTW sessions based on instructor availability. They can reschedule or book
                    makeup sessions without calling the office.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Bell className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Automated Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Students get email and SMS reminders before classes, reducing no-shows and keeping everyone on
                    track.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Course Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Access to course documents, quizzes, and completion certificates all in one place.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Instructor Portal */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Instructor Portal</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A simple, focused interface that helps instructors manage their day efficiently
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Calendar className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Daily Schedule View</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    See the entire day at a glance: which students, what time, where to meet, and which vehicle to use.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Mark Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    One-tap present/absent marking. The system automatically notifies the office and updates student
                    progress.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Quick access to student details, contact info, and their progress through the program.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Submit Quizzes & Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Instructors can submit quiz scores and completion forms directly from their portal.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Bell className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Schedule Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Get notified of schedule changes, cancellations, or new bookings in real-time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Smartphone className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Mobile Friendly</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Manage everything from a phone or tablet. Perfect for instructors on the go.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Scheduling & Calendar */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Scheduling & Calendar</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Powerful scheduling tools that prevent conflicts and keep everyone organized
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Calendar className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Google Calendar Sync</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Two-way sync with Google Calendar ensures instructors always have their schedule in their personal
                    calendar.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>No Double-Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Real-time availability checking prevents double bookings and scheduling conflicts automatically.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Real-Time Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Students only see available time slots, reducing back-and-forth scheduling communication.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Multi-Instructor Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Manage schedules for all instructors from one view. Balance workload across your team.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Bell className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Automatic Rescheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    When a student misses a class, they automatically get prompted to book a makeup session.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Custom Scheduling Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Set buffer times, break periods, and availability windows that fit your school's needs.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Automations & Communication */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Automations & Communication</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Let Drivofy handle repetitive communications so you can focus on teaching
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Bell className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Class Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Automated email and SMS reminders sent 24 hours and 1 hour before each class.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Absence Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    When an instructor marks a student absent, they get an automatic message about booking a makeup
                    session.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Smartphone className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Email & SMS Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Send communications via email, SMS, or both. Reach students on their preferred channel.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Progress Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Automatically notify students and parents when milestones are reached or certificates are ready.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Follow-Up Sequences</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Set up automated follow-ups for inactive students or those who haven't booked their BTW sessions.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Instructor Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Instructors get notified of new bookings, cancellations, and schedule changes instantly.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Reporting & Admin */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Reporting & Admin</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get the insights you need to run and grow your driving school business
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <BarChart className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Track monthly revenue, payment status, and outstanding balances from your dashboard.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Enrollment Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    See how many students are enrolled, which packages are popular, and track growth over time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Attendance Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    View class attendance rates, identify no-show patterns, and track makeup sessions.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Student Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Monitor each student's journey through their program and identify who needs attention.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CreditCard className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Payment Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Track payments, send payment reminders, and manage installment plans effortlessly.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Export Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    Download detailed reports for accounting, compliance, or analysis purposes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Add-ons */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">AI Add-ons</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Optional AI-powered features to save even more time and grow your business
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <BotMessageSquare className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>AI Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed mb-4">
                    Add an AI-powered chatbot to your website and student portal. It answers common questions 24/7 using
                    your school's data.
                  </CardDescription>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Answers FAQs about pricing, schedules, and requirements</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Trained on your specific course offerings</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Reduces repetitive admin questions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>Review Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed mb-4">
                    Automatically ask happy students to leave Google Reviews at the perfect moment—right after they
                    complete their program.
                  </CardDescription>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Sends review requests at optimal timing</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Direct link to your Google Business profile</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Increase your online reputation effortlessly</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
