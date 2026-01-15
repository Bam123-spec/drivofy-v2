import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Simple, transparent pricing</h1>
              <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
                Start with a 30-day free trial. No credit card required. Cancel anytime.
              </p>
              <p className="text-lg text-muted-foreground">
                All plans include core features to run your driving school efficiently.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Standard Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-2xl">Standard</CardTitle>
                  <CardDescription className="leading-relaxed">
                    Everything you need to manage your driving school
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">$55</span>
                    <span className="text-muted-foreground">/month</span>
                    <p className="text-sm text-muted-foreground mt-2">per location</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button size="lg" className="w-full" asChild>
                    <Link href="/contact">Start 30-Day Free Trial</Link>
                  </Button>

                  <div>
                    <p className="font-semibold mb-3">Includes:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Full student portal with self-service booking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Complete instructor portal and attendance tracking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Admin dashboard with reports and analytics</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Google Calendar sync for all instructors</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Automated email notifications and reminders</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Real-time scheduling with conflict prevention</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Progress tracking for Driver's Ed programs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Unlimited students and instructors</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Email support</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <CardDescription className="leading-relaxed">
                    Advanced features for growing driving schools
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">$89</span>
                    <span className="text-muted-foreground">/month</span>
                    <p className="text-sm text-muted-foreground mt-2">per location</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button size="lg" className="w-full" asChild>
                    <Link href="/contact">Start 30-Day Free Trial</Link>
                  </Button>

                  <div>
                    <p className="font-semibold mb-3">Everything in Standard, plus:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">AI chatbot for your website and portal</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Automated Google Review requests</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Advanced reporting and analytics</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">SMS notifications (email + text)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Custom branding options</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Priority support (email + phone)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Multi-location management dashboard</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">API access for custom integrations</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">30-Day Free Trial</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Try all features risk-free. No credit card required to start.
                  </p>
                </div>
                <div className="p-6 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">Cancel Anytime</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No long-term contracts. Stop your subscription whenever you want.
                  </p>
                </div>
                <div className="p-6 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">Free Migration</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We'll help you import your existing student and instructor data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Compare plans</h2>
            <div className="max-w-4xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold">Feature</th>
                      <th className="text-center py-4 px-4 font-semibold">Standard</th>
                      <th className="text-center py-4 px-4 font-semibold">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Student Portal</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Instructor Portal</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Admin Dashboard</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Google Calendar Sync</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Email Notifications</td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">SMS Notifications</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-muted-foreground">—</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">AI Chatbot</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-muted-foreground">—</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Review Automation</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-muted-foreground">—</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Advanced Reporting</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-muted-foreground">—</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4">Priority Support</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-muted-foreground">—</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pricing FAQ</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is the free trial really free?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Yes! You get full access to all features in your chosen plan for 30 days. No credit card required to
                    start. After the trial, you can choose to continue with a paid subscription or cancel with no
                    charges.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What happens after the 30-day trial?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    After your trial ends, you'll need to add a payment method to continue using Drivofy. We'll send you
                    reminders before your trial ends so you have time to decide. If you don't add payment, your account
                    will be paused and your data will be saved for 60 days.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I switch plans later?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    You can upgrade from Standard to Pro at any time. The new pricing takes effect immediately and
                    you'll be prorated for the remainder of your billing period. You can also downgrade, which will take
                    effect at your next billing cycle.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>What if I have multiple locations?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Each physical location requires its own subscription. However, Pro plan subscribers get a
                    multi-location dashboard to manage all locations from one view. Contact us for volume pricing if you
                    have 3+ locations.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Are there any hidden fees or setup costs?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    No hidden fees! The price you see is what you pay. Setup and data migration assistance are included
                    free. The only additional cost would be if you exceed SMS limits on the Pro plan (you get 500 free
                    SMS per month, then $0.01 per additional message).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Yes, you can cancel your subscription at any time from your admin dashboard. There are no
                    cancellation fees or long-term contracts. Your service continues until the end of your current
                    billing period.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Do you offer annual billing?</AccordionTrigger>
                  <AccordionContent className="leading-relaxed">
                    Yes! Pay annually and save 15%. That brings Standard to $561/year ($46.75/month) and Pro to
                    $908/year ($75.67/month). You can switch to annual billing from your dashboard or contact us during
                    signup.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Ready to simplify your driving school?</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Start your free 30-day trial today. Set up in minutes, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8">
                <Link href="/contact">Start Free Trial</Link>
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
