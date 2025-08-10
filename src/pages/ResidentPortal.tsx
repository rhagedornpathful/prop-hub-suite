import { TenantPortal } from "@/components/portals/TenantPortal";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

export default function ResidentPortal() {
  return (
    <div className="space-y-6">
      <BreadcrumbNavigation />
      <TenantPortal />
    </div>
  );
}