"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getUser, type User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Car, Clock, PlusCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      const currentUser = await getUser()

      if (!active) return

      if (!currentUser) {
        router.push("/login")
      } else {
        setUser(currentUser)
      }

      setIsLoading(false)
    }

    loadUser()

    return () => {
      active = false
    }
  }, [router])

  if (isLoading) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">
              Your account is ready. Add your first students, lessons, and instructors to see live data here.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick actions</CardTitle>
                  <CardDescription>Set up your school in a few steps</CardDescription>
                </div>
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Add your first student
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule a lesson
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Car className="h-4 w-4" />
                  Invite an instructor
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming lessons</CardTitle>
                  <CardDescription>Lessons will show up here once scheduled</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                No upcoming lessons yet. Create a lesson to populate this list.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>New signups, payments, and updates will appear here</CardDescription>
                </div>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Nothing to show yet. As your team starts using Drivofy, activity will populate here.
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Bring your data to life</CardTitle>
              <CardDescription>
                Connect your student roster, lessons, and instructors. Once data is in, this dashboard will reflect
                real-time metrics instead of placeholders.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="default">Import students</Button>
              <Button variant="outline">Import lessons</Button>
              <Button variant="outline">Add instructors</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
