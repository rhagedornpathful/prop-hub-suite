import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Percent,
  Building2,
  Crown
} from "lucide-react";
import { 
  usePropertyOwnerAssociations, 
  useCreatePropertyOwnerAssociation,
  useUpdatePropertyOwnerAssociation,
  useDeletePropertyOwnerAssociation,
  type PropertyOwnerAssociationWithDetails
} from "@/hooks/queries/usePropertyOwnerAssociations";
import { usePropertyOwners } from "@/hooks/queries/usePropertyOwners";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

interface PropertyOwnershipManagerProps {
  propertyId: string;
  propertyAddress?: string;
}

export function PropertyOwnershipManager({ propertyId, propertyAddress }: PropertyOwnershipManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState<PropertyOwnerAssociationWithDetails | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(100);
  const [isPrimaryOwner, setIsPrimaryOwner] = useState(false);

  const { data: associations = [], isLoading } = usePropertyOwnerAssociations(propertyId);
  const { data: availableOwners = [] } = usePropertyOwners();
  const createAssociation = useCreatePropertyOwnerAssociation();
  const updateAssociation = useUpdatePropertyOwnerAssociation();
  const deleteAssociation = useDeletePropertyOwnerAssociation();
  const { toast } = useToast();

  const totalOwnership = associations.reduce((sum, assoc) => sum + (assoc.ownership_percentage || 0), 0);

  const handleAddOwner = async () => {
    if (!selectedOwnerId) return;

    // Check if total ownership would exceed 100%
    if (totalOwnership + ownershipPercentage > 100) {
      toast({
        title: "Invalid Ownership",
        description: "Total ownership cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    // Check if this owner is already associated with this property
    const existingAssociation = associations.find(a => a.property_owner_id === selectedOwnerId);
    if (existingAssociation) {
      toast({
        title: "Owner Already Associated",
        description: "This owner is already associated with this property",
        variant: "destructive",
      });
      return;
    }

    await createAssociation.mutateAsync({
      property_id: propertyId,
      property_owner_id: selectedOwnerId,
      ownership_percentage: ownershipPercentage,
      is_primary_owner: isPrimaryOwner || associations.length === 0, // First owner is always primary
    });

    // Reset form
    setSelectedOwnerId("");
    setOwnershipPercentage(100 - totalOwnership);
    setIsPrimaryOwner(false);
    setIsAddDialogOpen(false);
  };

  const handleUpdateOwnership = async (associationId: string, newPercentage: number, newIsPrimary: boolean) => {
    const currentAssociation = associations.find(a => a.id === associationId);
    if (!currentAssociation) return;

    const otherAssociationsTotal = associations
      .filter(a => a.id !== associationId)
      .reduce((sum, assoc) => sum + (assoc.ownership_percentage || 0), 0);

    if (otherAssociationsTotal + newPercentage > 100) {
      toast({
        title: "Invalid Ownership",
        description: "Total ownership cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    await updateAssociation.mutateAsync({
      id: associationId,
      updates: {
        ownership_percentage: newPercentage,
        is_primary_owner: newIsPrimary,
      },
    });
  };

  const handleDeleteAssociation = async (associationId: string) => {
    await deleteAssociation.mutateAsync(associationId);
  };

  const availablePercentage = 100 - totalOwnership;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Property Ownership
          {propertyAddress && (
            <Badge variant="outline" className="ml-2">
              {propertyAddress}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ownership Summary */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Total Ownership:</span>
          </div>
          <Badge variant={totalOwnership === 100 ? "default" : "secondary"}>
            {totalOwnership}%
          </Badge>
        </div>

        {/* Current Owners */}
        <div className="space-y-3">
          {associations.map((association) => (
            <div key={association.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {association.is_primary_owner && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {association.property_owner?.company_name || 
                       `${association.property_owner?.first_name} ${association.property_owner?.last_name}`}
                    </p>
                    {association.is_primary_owner && (
                      <Badge variant="outline" className="text-xs">
                        Primary Owner
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {association.ownership_percentage}%
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingAssociation(association)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAssociation(association.id)}
                  disabled={associations.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Owner Button */}
        {availablePercentage > 0 && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Owner ({availablePercentage}% available)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Property Owner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="owner">Select Owner</Label>
                  <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOwners
                        .filter(owner => !associations.some(a => a.property_owner_id === owner.id))
                        .map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.company_name || `${owner.first_name} ${owner.last_name}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="percentage">Ownership Percentage</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max={availablePercentage}
                    value={ownershipPercentage}
                    onChange={(e) => setOwnershipPercentage(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum available: {availablePercentage}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="primary"
                    checked={isPrimaryOwner}
                    onChange={(e) => setIsPrimaryOwner(e.target.checked)}
                  />
                  <Label htmlFor="primary">Primary Owner</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddOwner}
                    disabled={!selectedOwnerId || createAssociation.isPending}
                    className="flex-1"
                  >
                    {createAssociation.isPending ? <LoadingSpinner /> : "Add Owner"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Dialog */}
        {editingAssociation && (
          <Dialog open={!!editingAssociation} onOpenChange={() => setEditingAssociation(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Ownership</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Owner</Label>
                  <p className="text-sm text-muted-foreground">
                    {editingAssociation.property_owner?.company_name || 
                     `${editingAssociation.property_owner?.first_name} ${editingAssociation.property_owner?.last_name}`}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="edit-percentage">Ownership Percentage</Label>
                  <Input
                    id="edit-percentage"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingAssociation.ownership_percentage || 0}
                    onChange={(e) => {
                      const newPercentage = Number(e.target.value);
                      // Update the editing association temporarily for validation
                      setEditingAssociation({
                        ...editingAssociation,
                        ownership_percentage: newPercentage
                      });
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-primary"
                    defaultChecked={editingAssociation.is_primary_owner}
                    onChange={(e) => {
                      setEditingAssociation({
                        ...editingAssociation,
                        is_primary_owner: e.target.checked
                      });
                    }}
                  />
                  <Label htmlFor="edit-primary">Primary Owner</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleUpdateOwnership(
                        editingAssociation.id,
                        editingAssociation.ownership_percentage || 0,
                        editingAssociation.is_primary_owner || false
                      );
                      setEditingAssociation(null);
                    }}
                    disabled={updateAssociation.isPending}
                    className="flex-1"
                  >
                    {updateAssociation.isPending ? <LoadingSpinner /> : "Update"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAssociation(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}