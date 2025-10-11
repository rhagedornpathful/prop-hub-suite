import AuditLogViewer from "@/components/AuditLogViewer";
import { RoleBasedAccess, ROLE_COMBINATIONS } from "@/components/RoleBasedAccess";

export default function AuditLogsPage() {
  return (
    <RoleBasedAccess allowedRoles={ROLE_COMBINATIONS.ADMIN_ONLY}>
      <AuditLogViewer />
    </RoleBasedAccess>
  );
}