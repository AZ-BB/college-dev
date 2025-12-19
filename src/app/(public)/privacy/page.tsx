import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | TheCollege",
  description:
    "Learn how TheCollege collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container ml-0 px-4 py-12 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-gray-700">
          {/* Introduction */}
          <section>
            <p className="mb-4">
              At TheCollege, your privacy matters. We are committed to
              protecting your personal information and being transparent about
              how we handle it. This Privacy Policy explains how we collect,
              use, and safeguard your data when you visit our website, join our
              waitlist, or use our services.
            </p>
            <p>
              By signing up or using our website, you agree to the practices
              described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Information We Collect
            </h2>
            <p className="mb-4">
              We only collect the information necessary to provide updates and
              improve our services. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Your name and email
                address (when you sign up for the waitlist or updates).
              </li>
              <li>
                <strong>Usage Information:</strong> Device type, browser, IP
                address, and interactions with our website (via cookies or
                analytics tools).
              </li>
              <li>
                <strong>Optional Information:</strong> Details you voluntarily
                share (e.g., feedback, surveys).
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              How We Use Your Information
            </h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Add you to our waitlist and notify you about TheCollege.</li>
              <li>
                Send relevant updates about features, launch news, and community
                invites.
              </li>
              <li>
                Improve our website, content, and overall user experience.
              </li>
              <li>Respond to your queries or support requests.</li>
            </ul>
          </section>

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Legal Basis for Processing
            </h2>
            <p className="mb-4">
              As per India&apos;s Digital Personal Data Protection Act, 2023
              (DPDP Act), we process your data only:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your consent (e.g., when you join our waitlist).</li>
              <li>
                For legitimate business purposes (e.g., operating and securing
                our services).
              </li>
            </ul>
          </section>

          {/* Cookies & Tracking */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Cookies &amp; Tracking
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                We may use cookies or analytics tools (like Google Analytics) to
                understand visitor activity and enhance performance.
              </li>
              <li>You can disable cookies anytime in your browser settings.</li>
              <li>We do not use tracking for third-party advertising.</li>
            </ul>
          </section>
          {/* Data Storage & Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Data Storage &amp; Security
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Your data is stored securely with trusted cloud service
                providers.
              </li>
              <li>Access is restricted to authorized team members only.</li>
              <li>
                We implement reasonable technical and organizational safeguards
                to prevent unauthorized access, misuse, or loss.
              </li>
            </ul>
          </section>
          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <p className="mb-4">
              We may share your information only in limited cases:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> With trusted vendors for
                email, hosting, or analytics.
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law,
                regulation, or court order.
              </li>
            </ul>
            <p className="mt-4">
              We never share your personal data for advertising or marketing
              purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">
              Under the DPDP Act, 2023, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data you shared with us.</li>
              <li>Request correction or deletion of your data.</li>
              <li>
                Withdraw consent at any time (via the unsubscribe link in
                emails).
              </li>
              <li>
                File a grievance if you believe your data has been misused.
              </li>
            </ul>
            <p className="mt-4">
              To exercise your rights, email us at:{" "}
              <a
                href="mailto:ask@thecollege.co.in"
                className="text-blue-600 hover:underline"
              >
                ask@thecollege.co.in
              </a>
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Links</h2>
            <p>
              Our website may link to external sites. We are not responsible for
              their privacy practices or content. Review their policies before
              sharing information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Children&apos;s Privacy
            </h2>
            <p>
              Our services are intended for individuals aged 18 and above. We do
              not knowingly collect information from minors. If such data is
              discovered, we will delete it immediately.
            </p>
          </section>

          {/* Changes to this Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Changes to this Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. If changes are
              significant, we will notify you through email or a notice on our
              website.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding your data,
              please contact us:{" "}
              <a
                href="mailto:ask@thecollege.co.in"
                className="text-blue-600 hover:underline"
              >
                ask@thecollege.co.in
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
