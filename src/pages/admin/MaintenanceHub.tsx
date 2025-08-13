import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { ResourceList, Column } from "@/components/admin/ResourceList";
import MaintenanceDetailsDialog from "@/components/MaintenanceDetailsDialog";
import { useMaintenanceRequests, MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MaintenanceHub() {
  const [params, setParams] = useSearchParams();
  const { data: requests = [], isLoading } = useMaintenanceRequests();
  const [open, setOpen] = useState(false);

  const requestId = params.get("request");

  useEffect(() => {
    setOpen(!!requestId);
  }, [requestId]);

  const onView = (req: MaintenanceRequest) => {
    const next = new URLSearchParams(params);
    next.set("request", req.id);
    setParams(next, { replace: true });
  };

  const onClose = (state: boolean) => {
    setOpen(state);
    if (!state) {
      const next = new URLSearchParams(params);
      next.delete("request");
      setParams(next, { replace: true });
    }
  };

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === requestId) || null,
    [requests, requestId]
  );

  const columns: Column<MaintenanceRequest>[] = [
    { key: "title", header: "Request", accessor: (r) => r.title },
    { key: "property", header: "Property", render: (r) => (
      <div>
        <div className="font-medium text-foreground">{r.properties?.address || "Unknown"}</div>
        <div className="text-xs text-muted-foreground">{[r.properties?.city, r.properties?.state].filter(Boolean).join(", ")}</div>
      </div>
    ), accessor: (r) => r.properties?.address || "" },
    { key: "priority", header: "Priority", render: (r) => (
      <Badge variant="outline" className="capitalize">{r.priority}</Badge>
    ), accessor: (r) => r.priority },
    { key: "status", header: "Status", render: (r) => (
      <Badge className="capitalize">{r.status}</Badge>
    ), accessor: (r) => r.status },
    { key: "scheduled_date", header: "Scheduled", render: (r) => (
      <span className="text-sm text-muted-foreground">{r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : "-"}</span>
    ), accessor: (r) => r.scheduled_date || "" },
    { key: "due_date", header: "Due", render: (r) => (
      <span className="text-sm text-muted-foreground">{r.due_date ? new Date(r.due_date).toLocaleDateString() : "-"}</span>
    ), accessor: (r) => r.due_date || "" },
    { key: "assigned_to", header: "Assigned", render: (r) => (
      <span className="text-sm">{r.assigned_user ? `${r.assigned_user.first_name || ""} ${r.assigned_user.last_name || ""}`.trim() : "Unassigned"}</span>
    ), accessor: (r) => r.assigned_user ? `${r.assigned_user.first_name || ""} ${r.assigned_user.last_name || ""}`.trim() : "Unassigned" },
  ];

  return (
    <div className="container mx-auto p-6">
      <SEOHead
        title="Admin Maintenance Hub"
        description="Admin Maintenance Hub with quick filters, bulk actions, and detailed request dialog."
        keywords="admin maintenance hub, maintenance requests, work orders"
      />

      <header className="mb-4">
        <BreadcrumbNavigation />
        <h1 className="text-2xl font-semibold">Admin Maintenance Hub</h1>
      </header>

      <main>
        <section aria-labelledby="maintenance-list">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle id="maintenance-list">Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceList
                items={requests}
                loading={isLoading}
                columns={columns}
                getRowId={(r) => r.id}
                onRowClick={onView}
                storageKey="admin.maintenance"
                searchKeys={["title", "description"] as any}
                statusKey={"status" as any}
              />
            </CardContent>
          </Card>
        </section>
      </main>

      <MaintenanceDetailsDialog request={selectedRequest} open={open} onOpenChange={onClose} />
    </div>
  );
}
