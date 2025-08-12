import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { SEOHead } from "@/components/SEOHead";
import { OwnerPortalSystem } from "@/components/OwnerPortalSystem";

export default function PropertyOwnerDashboard() {
  return (
    <div className="space-y-6">
      <SEOHead
        title="Property Owner Hub"
        description="Owner hub for updates, property checks, messages, and maintenance approvals."
        keywords="property owner hub, owner approvals, property checks, messages"
        type="website"
      />
      <BreadcrumbNavigation />
      <OwnerPortalSystem />
    </div>
  );
}
