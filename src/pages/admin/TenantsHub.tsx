import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { ResourceList } from "@/components/admin/ResourceList";
import { getTenantColumns } from "@/components/admin/ResourceListColumns";
import { useTenants } from "@/hooks/queries/useTenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TenantsHub() {
  const { data: tenants = [], isLoading } = useTenants();
  const navigate = useNavigate();
  const columns = getTenantColumns();
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
