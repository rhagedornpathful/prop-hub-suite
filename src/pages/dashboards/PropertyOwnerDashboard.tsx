import { OwnerPortal } from "@/components/portals/OwnerPortal";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

export default function PropertyOwnerDashboard() {
  return (
    <div className="space-y-6">
      <BreadcrumbNavigation />
      <OwnerPortal />
    </div>
  );
}