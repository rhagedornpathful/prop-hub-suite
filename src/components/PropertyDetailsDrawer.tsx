import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, CalendarClock, ClipboardList, DollarSign, FileText, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface PropertyDetailsDrawerProps {
  propertyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PropertyDetailsDrawer({ propertyId, open, onOpenChange }: PropertyDetailsDrawerProps) {
  const [property, setProperty] = useState<Tables<'properties'> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) { setProperty(null); return; }
      setLoading(true);
      const { data } = await supabase.from('properties').select('*').eq('id', propertyId).maybeSingle();
      setProperty(data as any);
      setLoading(false);
    };
    if (open) fetchProperty();
  }, [propertyId, open]);

  const title = useMemo(() => property?.address || 'Property details', [property]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="watching">House Watching</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  {loading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property?.address}</span>
                      </div>
                      <div className="flex gap-2">
                        {property?.status && (
                          <Badge variant="outline" className="capitalize">{property.status}</Badge>
                        )}
                        {property?.property_type && (
                          <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
                        )}
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>Rent: ${property?.monthly_rent || 0}</span></div>
                        <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /><span>Bedrooms: {property?.bedrooms || 0}</span></div>
                        <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /><span>Created: {property?.created_at ? new Date(property.created_at).toLocaleDateString() : '-'}</span></div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="secondary" onClick={() => window.location.href = `/property-check?property=${property?.id}`}>Start Check</Button>
                        <Button size="sm" onClick={() => window.location.href = `/properties/${property?.id}`}>Open Full Page</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <p className="text-sm text-muted-foreground">Recent activity and timelines will appear here.</p>
            </TabsContent>
            <TabsContent value="finance" className="mt-4">
              <p className="text-sm text-muted-foreground">Owner statements, rent rolls, and payments overview.</p>
            </TabsContent>
            <TabsContent value="docs" className="mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Documents integration coming next.</span>
              </div>
            </TabsContent>
            <TabsContent value="watching" className="mt-4">
              <p className="text-sm text-muted-foreground">House watching schedule and next checks.</p>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
