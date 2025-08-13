import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { ResourceList, Column } from "@/components/admin/ResourceList";
import { useTenants, Tenant } from "@/hooks/queries/useTenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TenantsHub() {
  const { data: tenants = [], isLoading } = useTenants();
  const navigate = useNavigate();

  const columns: Column<Tenant>[] = [
    { key: "name", header: "Tenant", render: (t) => (
      <div>
        <div className="font-medium text-foreground">{t.first_name} {t.last_name}</div>
        <div className="text-xs text-muted-foreground">{t.email || t.phone || "No contact"}</div>
      </div>
    ), accessor: (t) => `${t.first_name} ${t.last_name}` },
    { key: "property", header: "Property", render: (t) => (
      <div>
        <div className="font-medium text-foreground">{t.property?.address || "Unknown"}</div>
        <div className="text-xs text-muted-foreground">{[t.property?.city, t.property?.state].filter(Boolean).join(', ')}</div>
      </div>
    ), accessor: (t) => t.property?.address || "" },
    { key: "monthly_rent", header: "Rent", render: (t) => (
      <span className="text-sm text-muted-foreground">{t.monthly_rent ? `$${t.monthly_rent.toLocaleString()}` : '-'}</span>
    ), accessor: (t) => t.monthly_rent || 0 },
    { key: "lease", header: "Lease", render: (t) => (
      <span className="text-sm text-muted-foreground">
        {t.lease_start_date ? new Date(t.lease_start_date).toLocaleDateString() : '-'} → {t.lease_end_date ? new Date(t.lease_end_date).toLocaleDateString() : '-'}
      </span>
    ), accessor: (t) => `${t.lease_start_date || ''}/${t.lease_end_date || ''}` },
  ];

  const items = useMemo(() => tenants, [tenants]);

  return (
    <div className="container mx-auto p-6">
      <SEOHead
        title="Admin Tenants Hub"
        description="Admin Tenants Hub with quick search and CSV export."
        keywords="admin tenants hub, tenant management"
      />

      <header className="mb-4">
        <BreadcrumbNavigation />
        <h1 className="text-2xl font-semibold">Admin Tenants Hub</h1>
      </header>

      <main>
        <section aria-labelledby="tenants-list">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle id="tenants-list">Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceList
                items={items}
                loading={isLoading}
                columns={columns}
                getRowId={(t) => t.id}
                onRowClick={() => navigate('/tenants')}
                storageKey="admin.tenants"
                searchKeys={["first_name", "last_name", "email", "phone"] as any}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
