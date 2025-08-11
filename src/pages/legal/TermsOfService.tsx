import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Read the terms and conditions for using PropHub Suite property management platform."
        noIndex={true}
      />
      
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using PropHub Suite ("Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily access and use PropHub Suite for property management purposes. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes or public display</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of unauthorized use</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Transmit harmful or malicious code</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Access data not intended for you</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
              <p>For paid services:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Fees are charged in advance on a recurring basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We may change fees with 30 days notice</li>
                <li>Failure to pay may result in service suspension</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
              <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p>We strive to maintain high service availability but cannot guarantee uninterrupted access. We may:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Perform maintenance that temporarily restricts access</li>
                <li>Modify or discontinue features with notice</li>
                <li>Suspend accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>PropHub Suite shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data, or use, incurred by you or any third party.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p>You agree to indemnify and hold harmless PropHub Suite from any claims, losses, damages, or expenses arising from your use of the Service or violation of these terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p>Either party may terminate this agreement at any time. Upon termination:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your access to the Service will cease</li>
                <li>We may delete your account and data</li>
                <li>You remain liable for any outstanding fees</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p>We may modify these terms at any time. Significant changes will be communicated via email or service notification. Continued use constitutes acceptance of modified terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p>For questions about these Terms of Service, contact us at:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> legal@prophub.com</p>
                <p><strong>Address:</strong> PropHub Suite Legal Team<br />
                123 Main Street<br />
                Anytown, ST 12345</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}