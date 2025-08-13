import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { useProperties } from "@/hooks/queries/useProperties";
import { ResourceList, Column } from "@/components/admin/ResourceList";
import PropertyDetailsDrawer from "@/components/PropertyDetailsDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PropertiesHub() {
  
  const [params, setParams] = useSearchParams();
  const { data, isLoading } = useProperties(1, 25);
  const [open, setOpen] = useState(false);

  const propertyId = params.get('property');

  useEffect(() => {
    setOpen(!!propertyId);
  }, [propertyId]);

  const onView = (property: any) => {
    const next = new URLSearchParams(params);
    next.set('property', property.id);
    setParams(next, { replace: true });
  };

  const onClose = (state: boolean) => {
    setOpen(state);
    if (!state) {
      const next = new URLSearchParams(params);
      next.delete('property');
      setParams(next, { replace: true });
    }
  };

  const properties = useMemo(() => data?.properties || [], [data]);

  return (
    <div className="container mx-auto p-6">
      <SEOHead
        title="Admin Properties Hub"
        description="Admin Properties Hub with quick filters, bulk actions, and drawer details for fast workflows."
        keywords="admin properties hub, property management admin, properties drawer"
      />

      <header className="mb-4">
        <BreadcrumbNavigation />
        <h1 className="text-2xl font-semibold">Admin Properties Hub</h1>
      </header>

      <main>
        <section aria-labelledby="properties-list">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle id="properties-list">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const columns: Column<any>[] = [
                  { key: 'address', header: 'Property', render: (p) => (
                    <div>
                      <div className="font-medium text-foreground">{p.address}</div>
                      <div className="text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(', ')}</div>
                    </div>
                  ), accessor: (p) => p.address },
                  { key: 'property_type', header: 'Type', render: (p) => <Badge variant="outline" className="capitalize">{p.property_type || 'Unknown'}</Badge>, accessor: (p) => p.property_type },
                  { key: 'monthly_rent', header: 'Monthly Rent', render: (p) => `$${(p.monthly_rent || 0).toLocaleString()}`, accessor: (p) => p.monthly_rent },
                  { key: 'details', header: 'Details', render: (p) => (
                    <span className="text-sm text-muted-foreground">
                      {(p.bedrooms || 0) > 0 ? `${p.bedrooms} bed` : ''}{(p.bathrooms || 0) > 0 ? ` • ${p.bathrooms} bath` : ''}{(p.square_feet || 0) > 0 ? ` • ${p.square_feet} sqft` : ''}
                    </span>
                  ), accessor: (p) => `${p.bedrooms}/${p.bathrooms}/${p.square_feet}` },
                  { key: 'status', header: 'Status', render: (p) => <Badge className="capitalize">{p.status || 'active'}</Badge>, accessor: (p) => p.status },
                  { key: 'service_type', header: 'Service', render: (p) => <Badge variant="secondary">{p.service_type === 'house_watching' ? 'House Watching' : 'Property Mgmt'}</Badge>, accessor: (p) => p.service_type },
                ];
                return (
                  <ResourceList
                    items={properties}
                    loading={isLoading}
                    columns={columns}
                    getRowId={(p) => p.id}
                    onRowClick={onView}
                    storageKey="admin.properties"
                    searchKeys={['address','city','state','zip_code','description'] as any}
                    statusKey={'status' as any}
                    serviceKey={'service_type' as any}
                  />
                );
              })()}
            </CardContent>
          </Card>
        </section>
      </main>

      <PropertyDetailsDrawer propertyId={propertyId} open={open} onOpenChange={onClose} />
    </div>
  );
}
