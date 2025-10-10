import { usePropertyMetrics } from "./queries/useProperties";
import { useMaintenanceRequests } from "./queries/useMaintenanceRequests";
import { useTenants } from "./queries/useTenants";
import { useConversations } from "./queries/useConversations";

export function useDashboardMetrics() {
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  const { data: tenants = [] } = useTenants();
  const { data: conversations = [] } = useConversations();

  const totalProperties = propertyMetrics?.totalProperties || 0;
  const totalTenants = tenants.length;
  const occupancyRate = propertyMetrics?.totalProperties
    ? Math.round((propertyMetrics.occupiedUnits / propertyMetrics.totalProperties) * 100)
    : 0;
  const monthlyRent = propertyMetrics?.totalRent || 0;

  const urgentMaintenance = maintenanceRequests.filter(
    (r) => r.priority === "urgent" && r.status !== "completed"
  ).length;
  const pendingMaintenance = maintenanceRequests.filter((r) => r.status === "pending").length;
  const inProgressMaintenance = maintenanceRequests.filter((r) => r.status === "in_progress").length;
  const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  return {
    totalProperties,
    totalTenants,
    occupancyRate,
    monthlyRent,
    urgentMaintenance,
    pendingMaintenance,
    inProgressMaintenance,
    unreadMessages,
    activeMaintenance: pendingMaintenance + inProgressMaintenance,
  };
}
