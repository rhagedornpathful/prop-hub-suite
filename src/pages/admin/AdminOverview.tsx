import { SEOHead } from "@/components/SEOHead";
import AdminNavigation from "@/pages/AdminNavigation";

export default function AdminOverviewPage() {
  return (
    <div className="p-0">
      <SEOHead
        title="Admin Overview"
        description="Unified admin overview with KPIs, alerts, and action queues."
        keywords="admin dashboard, property management KPIs, maintenance alerts"
      />
      <AdminNavigation />
    </div>
  );
}
