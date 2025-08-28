import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Settings, Edit, Trash2 } from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { CreateServiceDialog } from "@/components/CreateServiceDialog";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { useServices, useDeleteService } from "@/hooks/queries/useServices";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/hooks/queries/useServices";

export default function ServiceManagement() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: services, isLoading } = useServices();
  const deleteServiceMutation = useDeleteService();
  const { toast } = useToast();

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditDialogOpen(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (confirm(`Are you sure you want to delete the service "${service.name}"?`)) {
      try {
        await deleteServiceMutation.mutateAsync(service.id);
        toast({
          title: "Service deleted",
          description: `${service.name} has been successfully deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete service. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const categorizeServices = (services: Service[]) => {
    return {
      house_watching: services.filter(s => s.category === 'house_watching'),
      property_management: services.filter(s => s.category === 'property_management'),
      add_on: services.filter(s => s.category === 'add_on'),
    };
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const categorizedServices = categorizeServices(services || []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage your service packages</p>
        </div>
        <CreateServiceDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="house_watching">House Watching</TabsTrigger>
          <TabsTrigger value="property_management">Property Management</TabsTrigger>
          <TabsTrigger value="add_ons">Add-On Services</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                All Services ({services?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services?.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showSelectButton={false}
                    showActions={true}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="house_watching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>House Watching Services ({categorizedServices.house_watching.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedServices.house_watching.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showSelectButton={false}
                    showActions={true}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property_management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Management Services ({categorizedServices.property_management.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedServices.property_management.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showSelectButton={false}
                    showActions={true}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add_ons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add-On Services ({categorizedServices.add_on.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedServices.add_on.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showSelectButton={false}
                    showActions={true}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedService && (
        <EditServiceDialog
          service={selectedService}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}