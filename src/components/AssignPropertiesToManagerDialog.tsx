import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "@/hooks/queries/useProperties";
import { useAssignPropertyToManager } from "@/hooks/queries/usePropertyManagers";
import { Building2, CheckSquare } from "lucide-react";

interface AssignPropertiesToManagerDialogProps {
  managerId: string;
  managerName: string;
  children?: React.ReactNode;
  onAssignmentComplete?: () => void;
}

export function AssignPropertiesToManagerDialog({ 
  managerId, 
  managerName, 
  children,
  onAssignmentComplete 
}: AssignPropertiesToManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data: propertiesData } = useProperties();
  const assignPropertyMutation = useAssignPropertyToManager();

  const properties = propertiesData?.properties || [];

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSubmit = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select at least one property to assign.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Assign each selected property to the manager
      await Promise.all(
        selectedProperties.map(propertyId =>
          assignPropertyMutation.mutateAsync({ 
            managerId, 
            propertyId 
          })
        )
      );

      toast({
        title: "Properties Assigned",
        description: `Successfully assigned ${selectedProperties.length} properties to ${managerName}.`,
      });

      setSelectedProperties([]);
      setOpen(false);
      onAssignmentComplete?.();

    } catch (error: any) {
      console.error("Error assigning properties:", error);
      toast({
        title: "Assignment Error",
        description: error.message || "Failed to assign properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Building2 className="h-4 w-4 mr-2" />
            Assign Properties
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Properties to {managerName}
          </DialogTitle>
          <DialogDescription>
            Select properties to assign to this property manager. They will be responsible for maintenance and tenant management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedProperties.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedProperties.length} properties selected
              </span>
            </div>
          )}

          <ScrollArea className="h-[400px] w-full border rounded-md p-4">
            <div className="space-y-3">
              {properties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No properties available to assign</p>
                </div>
              ) : (
                properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={property.id}
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={() => handlePropertyToggle(property.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium truncate">
                            {property.address}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {property.property_type || 'Property'}
                            </Badge>
                            {property.monthly_rent && (
                              <Badge variant="secondary" className="text-xs">
                                ${property.monthly_rent.toLocaleString()}/mo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {(property.city || property.state) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {[property.city, property.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProperties([]);
              setOpen(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProperties.length === 0}
          >
            {isSubmitting 
              ? "Assigning..." 
              : `Assign ${selectedProperties.length} Properties`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssignPropertiesToManagerDialog;