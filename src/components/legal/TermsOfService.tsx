/**
 * Terms of Service Component
 * Legal terms and conditions for platform usage
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TERMS_VERSION = "1.0.0";
export const TERMS_DATE = "2024-11-24";

export function TermsOfService() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last Updated: {TERMS_DATE} | Version {TERMS_VERSION}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using our property management platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
                <h3 className="text-lg font-medium mb-2">Account Registration</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>One person or entity may only maintain one account</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">Account Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>You may not share your account credentials</li>
                  <li>We reserve the right to suspend accounts for violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Permitted Use</h2>
                <p className="text-muted-foreground mb-2">You may use our platform to:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Manage residential or commercial properties</li>
                  <li>Track maintenance requests and work orders</li>
                  <li>Communicate with tenants, owners, and service providers</li>
                  <li>Process rent payments and financial transactions</li>
                  <li>Store and manage property-related documents</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-2">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code, viruses, or malware</li>
                  <li>Attempt to gain unauthorized access to systems</li>
                  <li>Scrape, harvest, or collect user data</li>
                  <li>Use the platform for fraudulent purposes</li>
                  <li>Impersonate others or misrepresent affiliations</li>
                  <li>Spam or send unsolicited communications</li>
                  <li>Reverse engineer or decompile the software</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Payment Terms</h2>
                <h3 className="text-lg font-medium mb-2">Subscription Fees</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Fees are billed in advance on a monthly or annual basis</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We may change fees with 30 days notice</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">Transaction Fees</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Payment processing fees apply to rent and invoice payments</li>
                  <li>Fees are disclosed before transaction completion</li>
                  <li>We use third-party payment processors (subject to their terms)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Ownership and License</h2>
                <h3 className="text-lg font-medium mb-2">Your Data</h3>
                <p className="text-muted-foreground">
                  You retain ownership of all data you upload to the platform. By using our service, you grant us a limited license to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                  <li>Store and process your data to provide services</li>
                  <li>Create backups for disaster recovery</li>
                  <li>Generate anonymized analytics and reports</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">Our Intellectual Property</h3>
                <p className="text-muted-foreground">
                  The platform, software, designs, and content are owned by us and protected by copyright, trademark, and other laws. You may not copy, modify, or create derivative works without permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Service Availability</h2>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
                  <li>Scheduled maintenance will be announced in advance when possible</li>
                  <li>We are not liable for service interruptions beyond our control</li>
                  <li>We may modify or discontinue features with reasonable notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Disclaimers</h2>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground font-medium">
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-3">
                  <li>We do not provide legal, tax, or financial advice</li>
                  <li>We are not responsible for user-generated content</li>
                  <li>We do not guarantee data accuracy or completeness</li>
                  <li>Use of the platform is at your own risk</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-muted-foreground font-medium">
                    IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                  </p>
                </div>
                <p className="text-muted-foreground mt-3">
                  Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                  <li>Your use of the platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Content you upload or share</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
                <h3 className="text-lg font-medium mb-2">By You</h3>
                <p className="text-muted-foreground">
                  You may cancel your account at any time from account settings. Cancellation is effective at the end of the current billing period.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">By Us</h3>
                <p className="text-muted-foreground">
                  We may suspend or terminate your account immediately if you:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                  <li>Violate these Terms</li>
                  <li>Fail to pay fees</li>
                  <li>Engage in fraudulent activity</li>
                  <li>Pose a security risk to the platform</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">Effect of Termination</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Access to your account and data will be disabled</li>
                  <li>You can export your data for 30 days after termination</li>
                  <li>We may delete your data 90 days after termination</li>
                  <li>Financial and legal records may be retained longer</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Dispute Resolution</h2>
                <h3 className="text-lg font-medium mb-2">Governing Law</h3>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">Arbitration</h3>
                <p className="text-muted-foreground">
                  Any disputes shall be resolved through binding arbitration in accordance with [Arbitration Association] rules, except that either party may seek injunctive relief in court.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">Class Action Waiver</h3>
                <p className="text-muted-foreground">
                  You agree to resolve disputes on an individual basis only, not as part of a class action or representative proceeding.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may modify these Terms at any time. Material changes will be notified via email or platform notice at least 30 days in advance. Continued use after changes constitutes acceptance. If you disagree with changes, you must stop using the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
                <div className="text-muted-foreground space-y-1">
                  <p><strong>Company:</strong> [Your Company Name]</p>
                  <p><strong>Address:</strong> [Your Company Address]</p>
                  <p><strong>Email:</strong> legal@example.com</p>
                  <p><strong>Phone:</strong> [Your Phone Number]</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">15. Miscellaneous</h2>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Severability:</strong> If any provision is unenforceable, the remainder remains in effect</li>
                  <li><strong>No Waiver:</strong> Our failure to enforce any right does not waive that right</li>
                  <li><strong>Assignment:</strong> You may not assign these Terms; we may assign to affiliates or successors</li>
                  <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between parties</li>
                  <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
