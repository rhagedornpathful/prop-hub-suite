import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { useProperties } from "@/hooks/queries/useProperties";
import { PropertyList } from "@/components/PropertyList";
import PropertyDetailsDrawer from "@/components/PropertyDetailsDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PropertiesHub() {
  const navigate = useNavigate();
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
              <PropertyList
                properties={properties}
                isLoading={isLoading}
                onView={onView}
              />
            </CardContent>
          </Card>
        </section>
      </main>

      <PropertyDetailsDrawer propertyId={propertyId} open={open} onOpenChange={onClose} />
    </div>
  );
}
