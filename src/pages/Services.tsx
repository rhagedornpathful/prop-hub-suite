import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "@/components/ServiceCard";
import { AssignServiceDialog } from "@/components/AssignServiceDialog";
import { PropertyServiceAssignments } from "@/components/PropertyServiceAssignments";
import { useServicesByCategory } from "@/hooks/queries/useServices";
import { Home, Building, Plus, Settings } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Services() {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  
  const { data: houseWatchingServices, isLoading: isLoadingHouseWatching } = useServicesByCategory('house_watching');
  const { data: propertyManagementServices, isLoading: isLoadingPropertyManagement } = useServicesByCategory('property_management');
  const { data: addOnServices, isLoading: isLoadingAddOns } = useServicesByCategory('add_on');

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  if (isLoadingHouseWatching || isLoadingPropertyManagement || isLoadingAddOns) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Service Packages</h1>
        <p className="text-muted-foreground">Choose from our comprehensive range of property services</p>
      </div>

      <Tabs defaultValue="house_watching" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="house_watching" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            House Watching
          </TabsTrigger>
          <TabsTrigger value="property_management" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Property Management
          </TabsTrigger>
          <TabsTrigger value="add_ons" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add-On Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="house_watching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                House Watching Services
              </CardTitle>
              <p className="text-muted-foreground">
                Professional house watching services to protect and maintain your property while you're away
              </p>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houseWatchingServices?.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServices.has(service.id)}
                onSelect={(service) => handleServiceSelect(service.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="property_management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Management Services
              </CardTitle>
              <p className="text-muted-foreground">
                Full-service property management solutions for rental properties
              </p>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyManagementServices?.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServices.has(service.id)}
                onSelect={(service) => handleServiceSelect(service.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add_ons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add-On Services
              </CardTitle>
              <p className="text-muted-foreground">
                Additional services to complement your main package
              </p>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOnServices?.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServices.has(service.id)}
                onSelect={(service) => handleServiceSelect(service.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedServices.size > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Selected Services
              <AssignServiceDialog 
                services={[
                  ...(houseWatchingServices || []),
                  ...(propertyManagementServices || []),
                  ...(addOnServices || [])
                ].filter(s => selectedServices.has(s.id))}
                trigger={
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Assign to Property
                  </Button>
                }
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedServices).map((serviceId) => {
                const allServices = [
                  ...(houseWatchingServices || []),
                  ...(propertyManagementServices || []),
                  ...(addOnServices || [])
                ];
                const service = allServices.find(s => s.id === serviceId);
                return service ? (
                  <Badge key={serviceId} variant="default">
                    {service.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Assignments Table */}
      <PropertyServiceAssignments />
    </div>
  );
}