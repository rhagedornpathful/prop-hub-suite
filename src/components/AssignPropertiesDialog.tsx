import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Loader2, Search } from "lucide-react";
import { useAssignProperty } from "@/hooks/queries/useHouseWatchers";

interface AssignPropertiesDialogProps {
  watcherId: string;
  watcherName: string;
  children: React.ReactNode;
  onAssignmentComplete?: () => void;
}

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  property_type: string | null;
  monthly_rent: number | null;
  isAssigned?: boolean;
}

const AssignPropertiesDialog = ({ 
  watcherId, 
  watcherName, 
  children, 
  onAssignmentComplete 
}: AssignPropertiesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const assignPropertyMutation = useAssignProperty();

  // Fetch available properties when dialog opens
  useEffect(() => {
    if (open) {
      fetchProperties();
    }
  }, [open, watcherId]);

  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      // Get all properties
      const { data: allProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address, city, state, property_type, monthly_rent')
        .order('address', { ascending: true });

      if (propertiesError) throw propertiesError;

      // Get already assigned properties for this watcher
      const { data: assignedProperties, error: assignedError } = await supabase
        .from('house_watcher_properties')
        .select('property_id')
        .eq('house_watcher_id', watcherId);

      if (assignedError) throw assignedError;

      const assignedPropertyIds = new Set(assignedProperties?.map(ap => ap.property_id) || []);

      // Mark which properties are already assigned
      const propertiesWithAssignmentStatus = (allProperties || []).map(property => ({
        ...property,
        isAssigned: assignedPropertyIds.has(property.id)
      }));

      setProperties(propertiesWithAssignmentStatus);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const resetForm = () => {
    setSelectedProperties([]);
    setNotes("");
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProperties.length === 0) {
      toast({
        title: "No Properties Selected",
        description: "Please select at least one property to assign.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Assign each selected property
      for (const propertyId of selectedProperties) {
        await assignPropertyMutation.mutateAsync({
          watcherId,
          propertyId,
          notes
        });
      }

      toast({
        title: "Properties Assigned",
        description: `Successfully assigned ${selectedProperties.length} properties to ${watcherName}`,
      });

      setOpen(false);
      resetForm();
      onAssignmentComplete?.();
    } catch (error: any) {
      console.error('Error assigning properties:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyToggle = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProperties = filteredProperties.filter(p => !p.isAssigned);
  const assignedProperties = filteredProperties.filter(p => p.isAssigned);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Properties to {watcherName}</DialogTitle>
          <DialogDescription>
            Select properties to assign to this house watcher for monitoring and maintenance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Properties */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Properties</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by address, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {loadingProperties ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available Properties */}
              {availableProperties.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Available Properties ({availableProperties.length})</Label>
                  <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {availableProperties.map((property) => (
                      <div key={property.id} className="flex items-start gap-3 p-2 rounded border border-border hover:bg-muted/50">
                        <Checkbox
                          id={property.id}
                          checked={selectedProperties.includes(property.id)}
                          onCheckedChange={(checked) => 
                            handlePropertyToggle(property.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={property.id} className="text-sm font-medium cursor-pointer">
                            {property.address}
                          </Label>
                          <div className="text-xs text-muted-foreground">
                            {[property.city, property.state].filter(Boolean).join(', ')}
                            {property.property_type && ` • ${property.property_type}`}
                            {property.monthly_rent && ` • $${property.monthly_rent.toLocaleString()}/mo`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Already Assigned Properties */}
              {assignedProperties.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Already Assigned ({assignedProperties.length})</Label>
                  <div className="border border-border rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                    {assignedProperties.map((property) => (
                      <div key={property.id} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                        <Checkbox
                          checked={true}
                          disabled={true}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-muted-foreground">
                            {property.address}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {[property.city, property.state].filter(Boolean).join(', ')}
                            {property.property_type && ` • ${property.property_type}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Properties Found */}
              {filteredProperties.length === 0 && !loadingProperties && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Properties Found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchTerm 
                      ? 'No properties match your search criteria.'
                      : 'No properties are available in the system.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes for this assignment..."
              rows={3}
            />
          </div>

          {/* Selected Count */}
          {selectedProperties.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedProperties.length} properties selected for assignment
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedProperties.length === 0}
              className="bg-gradient-primary hover:bg-primary-dark"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign {selectedProperties.length > 0 ? `${selectedProperties.length} ` : ''}Properties
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPropertiesDialog;