import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { useProperties } from "@/hooks/queries/useProperties";
import { ResourceList, Column } from "@/components/admin/ResourceList";
import PropertyDetailsDrawer from "@/components/PropertyDetailsDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";


export default function PropertiesHub() {
  
  const [params, setParams] = useSearchParams();
  const { data, isLoading } = useProperties(1, 25);
  const [open, setOpen] = useState(false);

  const initialView = (params.get('view') as 'grid' | 'list') || 'grid';
  const [view, setView] = useState<'grid' | 'list'>(initialView);
  const setViewAndParams = (mode: 'grid' | 'list') => {
    setView(mode);
    const next = new URLSearchParams(params);
    next.set('view', mode);
    setParams(next, { replace: true });
  };

  const propertyId = params.get('property');

  useEffect(() => {
    setOpen(!!propertyId);
  }, [propertyId]);

  useEffect(() => {
    const v = (params.get('view') as 'grid' | 'list') || 'grid';
    setView(v);
  }, [params]);

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle id="properties-list">Properties</CardTitle>
              <div className="inline-flex items-center gap-1" role="tablist" aria-label="View mode">
                <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" aria-selected={view === 'grid'} onClick={() => setViewAndParams('grid')}>Tiles</Button>
                <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" aria-selected={view === 'list'} onClick={() => setViewAndParams('list')}>List</Button>
              </div>
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

                if (view === 'list') {
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
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((p: any) => (
                      <Card
                        key={p.id}
                        className="cursor-pointer transition-shadow hover:shadow-sm overflow-hidden"
                        onClick={() => onView(p)}
                      >
                        <AspectRatio ratio={16/9}>
                          <img
                            src={(p.images && p.images.length > 0 ? p.images[0] : '/placeholder.svg')}
                            alt={`${p.address} property photo`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 1024px) 50vw, 33vw"
                          />
                        </AspectRatio>
                        <CardHeader>
                          <CardTitle className="text-base">{p.address}</CardTitle>
                          <div className="text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(', ')}</div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="capitalize">{p.property_type || 'Unknown'}</Badge>
                            <Badge variant="secondary">{p.service_type === 'house_watching' ? 'House Watching' : 'Property Mgmt'}</Badge>
                            <Badge className="capitalize">{p.status || 'active'}</Badge>
                          </div>
                          <div className="mt-3 text-sm text-muted-foreground">
                            <div>Monthly Rent: ${ (p.monthly_rent || 0).toLocaleString() }</div>
                            <div>
                              {(p.bedrooms || 0) > 0 ? `${p.bedrooms} bed` : ''}
                              {(p.bathrooms || 0) > 0 ? ` • ${p.bathrooms} bath` : ''}
                              {(p.square_feet || 0) > 0 ? ` • ${p.square_feet} sqft` : ''}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
