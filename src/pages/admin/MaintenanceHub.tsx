import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { ResourceList } from "@/components/admin/ResourceList";
import { getMaintenanceColumns } from "@/components/admin/ResourceListColumns";
import MaintenanceDetailsDialog from "@/components/MaintenanceDetailsDialog";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaintenanceHub() {
  const [params, setParams] = useSearchParams();
  const { data: requests = [], isLoading } = useMaintenanceRequests();
  const [open, setOpen] = useState(false);
  const columns = getMaintenanceColumns();

  const requestId = params.get("request");

  useEffect(() => {
    setOpen(!!requestId);
  }, [requestId]);

  const onView = (req: any) => {
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
