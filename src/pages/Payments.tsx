import { PaymentDashboard } from "@/components/payments/PaymentDashboard";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

export default function Payments() {
  return (
    <div className="space-y-6">
      <BreadcrumbNavigation />
      <PaymentDashboard />
    </div>
  );
}