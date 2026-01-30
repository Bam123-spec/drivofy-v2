"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, Calendar } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    schoolName: "",
    studentsPerMonth: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
    // Handle form submission
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Let's talk about your driving school</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get in touch to start your free trial, book a demo, or ask any questions about Drivofy.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>Fill out the form and we'll get back to you within 24 hours.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@drivingschool.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        placeholder="ABC Driving School"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentsPerMonth">Number of Students per Month</Label>
                      <Input
                        id="studentsPerMonth"
                        name="studentsPerMonth"
                        placeholder="e.g., 50"
                        value={formData.studentsPerMonth}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your driving school and what you're looking for..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info & Demo CTA */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Calendar className="w-10 h-10 text-primary mb-3" />
                    <CardTitle>Book a live demo</CardTitle>
                    <CardDescription className="leading-relaxed">
                      See Drivofy in action with a personalized walkthrough. We'll show you exactly how it works for
                      your driving school.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="lg" className="w-full">
                      Schedule Demo Call
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Mail className="w-10 h-10 text-primary mb-3" />
                    <CardTitle>Prefer email?</CardTitle>
                    <CardDescription className="leading-relaxed">
                      Send us an email anytime and we'll respond within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a href="mailto:hello@drivofy.com" className="text-primary hover:underline font-medium">
                      hello@drivofy.com
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Phone className="w-10 h-10 text-primary mb-3" />
                    <CardTitle>Prefer a call?</CardTitle>
                    <CardDescription className="leading-relaxed">
                      Call us during business hours (9am-6pm EST, Monday-Friday).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a href="tel:+15551234567" className="text-primary hover:underline font-medium text-lg">
                      (555) 123-4567
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Quick answers to common questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How long does setup take?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Most schools complete setup in 30-60 minutes. You can start using Drivofy the same day you sign
                      up.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can you import my existing data?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Yes! We offer free data migration assistance. Send us your student and instructor lists and we'll
                      import everything for you.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Do I need to train my instructors?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      The instructor portal is extremely simple—most instructors figure it out in 5 minutes. We also
                      provide training videos.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What if I need help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      Standard plan includes email support (24hr response time). Pro plan includes priority email +
                      phone support.
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
