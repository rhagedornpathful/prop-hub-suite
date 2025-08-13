import { SEOHead } from "@/components/SEOHead";
import { AdminDashboard } from "@/pages/dashboards/AdminDashboard";

export default function AdminOverviewPage() {
  return (
    <div className="p-0">
      <SEOHead
        title="Admin Overview"
        description="Unified admin overview with KPIs, alerts, and action queues."
        keywords="admin dashboard, property management KPIs, maintenance alerts"
      />
      <AdminDashboard />
    </div>
  );
}
