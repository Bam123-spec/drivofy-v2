import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
      <Header />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-white/60 mb-10">Last updated: February 10, 2026</p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Overview</h2>
              <p>
                Drivofy (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides software for driving schools to manage classes,
                bookings, scheduling, and communication. This Privacy Policy explains what data we collect, how we use it,
                and your choices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
              <p>We may collect the following categories of information:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Account information (name, email address, role, and organization).</li>
                <li>Student and booking information (course enrollments, sessions, attendance, phone numbers).</li>
                <li>Payment-related metadata from payment providers (for example Stripe session/payment IDs).</li>
                <li>Calendar integration data when users connect Google Calendar.</li>
                <li>Basic technical data such as IP address, browser, and log information for security and diagnostics.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and operate the platform features.</li>
                <li>Schedule, manage, and track classes and driving sessions.</li>
                <li>Process or reconcile purchases and enrollments.</li>
                <li>Send operational notifications and reminders.</li>
                <li>Improve reliability, security, and performance.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Google API Data</h2>
              <p>
                If you connect Google services, we access only the scopes required to support scheduling and calendar sync
                features. We do not sell Google user data.
              </p>
              <p className="mt-3">
                Drivofy&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Sharing of Information</h2>
              <p>
                We share information only with service providers required to operate the platform (for example hosting,
                authentication, email, calendar, and payments), and only as needed to provide services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Data Retention and Security</h2>
              <p>
                We retain data for as long as necessary to provide services, meet legal requirements, and resolve disputes.
                We apply reasonable technical and organizational safeguards to protect data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights</h2>
              <p>
                Depending on your jurisdiction, you may have rights to access, correct, or delete personal information.
                To make a request, contact us through our contact page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Contact</h2>
              <p>
                Questions about this policy can be submitted through{" "}
                <a href="/contact" className="text-blue-300 hover:text-blue-200 underline">
                  our contact page
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
