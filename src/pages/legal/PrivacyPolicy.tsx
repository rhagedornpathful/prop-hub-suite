import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Learn how PropHub Suite collects, uses, and protects your personal information. Read our comprehensive privacy policy."
        noIndex={true}
      />
      
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <p>We collect information you provide directly to us, such as:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Property addresses and details</li>
                    <li>Tenant and owner information</li>
                    <li>Payment and billing information</li>
                    <li>Communications and messages</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Usage Information</h3>
                  <p>We automatically collect certain information when you use our service:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Device information and IP address</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent</li>
                    <li>Feature usage and interactions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our property management services</li>
                <li>Process transactions and send notifications</li>
                <li>Communicate with you about your account</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information in these circumstances:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With your consent or at your direction</li>
                <li>With service providers who assist in our operations</li>
                <li>For legal compliance or to protect rights and safety</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Port your data to another service</li>
                <li>File a complaint with data protection authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p>We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of significant changes by email or through our service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us at:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@prophub.com</p>
                <p><strong>Address:</strong> PropHub Suite Privacy Team<br />
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