import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { getUserEnrollments } from "@/app/actions/enrollment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Car, Clock, PlusCircle, Settings, Download, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch enrollments
  const enrollments = await getUserEnrollments(user.id)

  // Get user profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Student'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1>
              <p className="text-muted-foreground">
                Manage your classes, track progress, and download certificates.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/services/rsep">Browse RSEP</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/services/dip">Browse DIP</Link>
              </Button>
            </div>
          </div>

          {/* My Courses Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6" /> My Courses
            </h2>

            {enrollments && enrollments.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((enrollment: any) => (
                  <Card key={enrollment.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={enrollment.class.class_type === 'DE' ? 'default' : 'secondary'}>
                          {enrollment.class.class_type}
                        </Badge>
                        <Badge variant={enrollment.status === 'completed' ? 'success' : 'outline'}>
                          {enrollment.status}
                        </Badge>
                      </div>
                      <CardTitle>{enrollment.class.name}</CardTitle>
                      <CardDescription>
                        Enrolled on {format(new Date(enrollment.enrolled_at), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(enrollment.class.start_date), "MMM d")} - {format(new Date(enrollment.class.end_date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {enrollment.class.daily_start_time} - {enrollment.class.daily_end_time}
                      </div>

                      {enrollment.status === 'completed' && (
                        <div className="pt-4">
                          <Button className="w-full" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Certificate
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No active enrollments</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    You haven't enrolled in any courses yet. Browse our catalog to get started.
                  </p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/services/rsep">View RSEP Classes</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/services/dip">View DIP Classes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </div>
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/contact">
                    <Users className="h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/services/rsep">
                    <Calendar className="h-4 w-4" />
                    Book RSEP Class
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Your latest updates</CardDescription>
                </div>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                {enrollments && enrollments.length > 0 ? (
                  <ul className="space-y-2">
                    {enrollments.slice(0, 3).map((e: any) => (
                      <li key={e.id}>Enrolled in {e.class.name}</li>
                    ))}
                  </ul>
                ) : (
                  "No recent activity."
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
