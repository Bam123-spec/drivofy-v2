import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
      <Header />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
          <p className="text-white/60 mb-10">Last updated: February 10, 2026</p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Agreement</h2>
              <p>
                By using Drivofy, you agree to these Terms of Service. If you do not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Service Description</h2>
              <p>
                Drivofy provides software tools for driving school operations, including scheduling, student management,
                enrollments, and communication workflows.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Accounts and Access</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for account credentials and all activity under your account.</li>
                <li>You must provide accurate and current information.</li>
                <li>You may not use the platform for unlawful or abusive activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Payments and Billing</h2>
              <p>
                Paid features may be billed on a subscription or transaction basis. Charges are processed by third-party
                payment providers. You are responsible for applicable taxes and payment method validity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Acceptable Use</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>No reverse engineering, unauthorized access attempts, or interference with service operation.</li>
                <li>No use of the platform to transmit harmful, fraudulent, or illegal content.</li>
                <li>No misuse of connected third-party services (for example Google Calendar APIs).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Third-Party Services</h2>
              <p>
                Drivofy integrates with third-party providers such as Google and Stripe. Those services have separate
                terms and policies, and your use of integrations is subject to those terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Availability and Changes</h2>
              <p>
                We may update, modify, or discontinue features at any time. We aim to provide reliable service but do not
                guarantee uninterrupted availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Disclaimer and Limitation of Liability</h2>
              <p>
                The service is provided &quot;as is&quot; and &quot;as available&quot; to the extent permitted by law. We are not liable for
                indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Termination</h2>
              <p>
                We may suspend or terminate access for violations of these terms or for security/legal reasons. You may
                stop using the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Contact</h2>
              <p>
                For legal or service questions, contact us through{" "}
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
