import { Badge } from "@/components/ui/badge";
import { Column } from "./ResourceList";
import { formatDate, formatCurrency, formatFullName } from "@/lib/formatters";
import type { Tenant } from "@/hooks/queries/useTenants";
import type { MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";

// Tenant columns for ResourceList
export function getTenantColumns(): Column<Tenant>[] {
  return [
    {
      key: "name",
      header: "Tenant",
      render: (t) => (
        <div>
          <div className="font-medium text-foreground">{formatFullName(t.first_name, t.last_name)}</div>
          <div className="text-xs text-muted-foreground">{t.email || t.phone || "No contact"}</div>
        </div>
      ),
      accessor: (t) => formatFullName(t.first_name, t.last_name),
    },
    {
      key: "property",
      header: "Property",
      render: (t) => (
        <div>
          <div className="font-medium text-foreground">{t.property?.address || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">
            {[t.property?.city, t.property?.state].filter(Boolean).join(", ")}
          </div>
        </div>
      ),
      accessor: (t) => t.property?.address || "",
    },
    {
      key: "monthly_rent",
      header: "Rent",
      render: (t) => (
        <span className="text-sm text-muted-foreground">
          {t.monthly_rent ? formatCurrency(t.monthly_rent) : "-"}
        </span>
      ),
      accessor: (t) => t.monthly_rent || 0,
    },
    {
      key: "lease",
      header: "Lease",
      render: (t) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(t.lease_start_date)} → {formatDate(t.lease_end_date)}
        </span>
      ),
      accessor: (t) => `${t.lease_start_date || ""}/${t.lease_end_date || ""}`,
    },
  ];
}

// Maintenance request columns for ResourceList
export function getMaintenanceColumns(): Column<MaintenanceRequest>[] {
  return [
    { key: "title", header: "Request", accessor: (r) => r.title },
    {
      key: "property",
      header: "Property",
      render: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.properties?.address || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">
            {[r.properties?.city, r.properties?.state].filter(Boolean).join(", ")}
          </div>
        </div>
      ),
      accessor: (r) => r.properties?.address || "",
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => <Badge variant="outline" className="capitalize">{r.priority}</Badge>,
      accessor: (r) => r.priority,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge className="capitalize">{r.status}</Badge>,
      accessor: (r) => r.status,
    },
    {
      key: "scheduled_date",
      header: "Scheduled",
      render: (r) => <span className="text-sm text-muted-foreground">{formatDate(r.scheduled_date)}</span>,
      accessor: (r) => r.scheduled_date || "",
    },
    {
      key: "due_date",
      header: "Due",
      render: (r) => <span className="text-sm text-muted-foreground">{formatDate(r.due_date)}</span>,
      accessor: (r) => r.due_date || "",
    },
    {
      key: "assigned_to",
      header: "Assigned",
      render: (r) => (
        <span className="text-sm">
          {r.assigned_user 
            ? formatFullName(r.assigned_user.first_name, r.assigned_user.last_name)
            : "Unassigned"}
        </span>
      ),
      accessor: (r) =>
        r.assigned_user 
          ? formatFullName(r.assigned_user.first_name, r.assigned_user.last_name)
          : "Unassigned",
    },
  ];
}
