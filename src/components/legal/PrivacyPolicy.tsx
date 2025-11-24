/**
 * Privacy Policy Component
 * GDPR-compliant privacy policy with version tracking
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const PRIVACY_POLICY_VERSION = "1.0.0";
export const PRIVACY_POLICY_DATE = "2024-11-24";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last Updated: {PRIVACY_POLICY_DATE} | Version {PRIVACY_POLICY_VERSION}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our property management platform. Please read this privacy policy carefully.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">Personal Data</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Name, email address, phone number</li>
                  <li>Mailing address and billing information</li>
                  <li>Account credentials and authentication data</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">Property Data</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Property addresses and details</li>
                  <li>Tenant information</li>
                  <li>Maintenance records</li>
                  <li>Financial transactions</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">Usage Data</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>IP address and browser type</li>
                  <li>Pages visited and features used</li>
                  <li>Time and date of visits</li>
                  <li>Device and operating system information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Provide, operate, and maintain our services</li>
                  <li>Process transactions and send notifications</li>
                  <li>Improve and personalize user experience</li>
                  <li>Communicate with you about services, updates, and support</li>
                  <li>Detect and prevent fraud and security issues</li>
                  <li>Comply with legal obligations</li>
                  <li>Generate analytics and reports (anonymized data)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Legal Basis for Processing (GDPR)</h2>
                <p className="text-muted-foreground mb-2">We process your personal data based on:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Contract Performance:</strong> To provide services you've requested</li>
                  <li><strong>Legitimate Interests:</strong> To improve our services and prevent fraud</li>
                  <li><strong>Legal Obligation:</strong> To comply with tax, accounting, and regulatory requirements</li>
                  <li><strong>Consent:</strong> For marketing communications (you can opt-out anytime)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-2">We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Service Providers:</strong> Payment processors, hosting providers, analytics services</li>
                  <li><strong>Business Partners:</strong> With your consent for specific services</li>
                  <li><strong>Legal Compliance:</strong> When required by law or to protect rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We do NOT sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                  <li><strong>Account Data:</strong> Until account deletion + 90 days</li>
                  <li><strong>Messages:</strong> 1 year (configurable by user)</li>
                  <li><strong>Financial Records:</strong> 7 years (legal requirement)</li>
                  <li><strong>Audit Logs:</strong> 7 years (compliance)</li>
                  <li><strong>Documents:</strong> 7 years or as configured</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Your Rights (GDPR & CCPA)</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Limit how we use your data</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> For marketing communications</li>
                  <li><strong>Lodge a Complaint:</strong> With your local data protection authority</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  To exercise these rights, contact us at privacy@example.com
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                  <li>Encryption in transit (TLS/SSL) and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                  <li>Regular backups and disaster recovery plans</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-2">We use cookies and similar technologies for:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                  <li><strong>Analytics Cookies:</strong> To understand usage patterns (with consent)</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  You can manage cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your data may be transferred to and processed in countries outside your residence. We ensure adequate protection through:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                  <li>Standard Contractual Clauses (EU Commission approved)</li>
                  <li>Privacy Shield certification (where applicable)</li>
                  <li>Adequacy decisions by regulatory authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on our platform. Your continued use after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about this Privacy Policy or to exercise your rights:
                </p>
                <div className="mt-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacy@example.com</p>
                  <p><strong>Mail:</strong> [Your Company Address]</p>
                  <p><strong>Data Protection Officer:</strong> dpo@example.com</p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
