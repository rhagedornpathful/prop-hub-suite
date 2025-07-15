import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddPropertyOwnerDialog } from './AddPropertyOwnerDialog';

interface PropertyOwner {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

interface PropertyOwnerAssociation {
  id: string;
  property_owner_id: string;
  ownership_percentage?: number;
  is_primary_owner: boolean;
  property_owner: PropertyOwner;
}

interface PropertyOwnerManagerProps {
  propertyId?: string;
  selectedOwners: PropertyOwnerAssociation[];
  onOwnersChange: (owners: PropertyOwnerAssociation[]) => void;
  availableOwners: PropertyOwner[];
  isLoadingOwners: boolean;
  onReloadOwners: () => void;
}

export const PropertyOwnerManager: React.FC<PropertyOwnerManagerProps> = ({
  propertyId,
  selectedOwners,
  onOwnersChange,
  availableOwners,
  isLoadingOwners,
  onReloadOwners
}) => {
  const [isQuickAddOwnerOpen, setIsQuickAddOwnerOpen] = useState(false);
  const { toast } = useToast();

  const getOwnerDisplayName = (owner: PropertyOwner) => {
    return owner.company_name || `${owner.first_name} ${owner.last_name}`;
  };

  const addOwner = () => {
    const newOwner: PropertyOwnerAssociation = {
      id: `temp-${Date.now()}`,
      property_owner_id: '',
      ownership_percentage: undefined,
      is_primary_owner: selectedOwners.length === 0,
      property_owner: { id: '', first_name: '', last_name: '' }
    };
    onOwnersChange([...selectedOwners, newOwner]);
  };

  const removeOwner = (index: number) => {
    const updatedOwners = selectedOwners.filter((_, i) => i !== index);
    // If we removed the primary owner, make the first remaining owner primary
    if (updatedOwners.length > 0 && !updatedOwners.some(o => o.is_primary_owner)) {
      updatedOwners[0].is_primary_owner = true;
    }
    onOwnersChange(updatedOwners);
  };

  const updateOwner = (index: number, field: keyof PropertyOwnerAssociation, value: any) => {
    const updatedOwners = [...selectedOwners];
    
    if (field === 'property_owner_id') {
      const selectedOwner = availableOwners.find(o => o.id === value);
      if (selectedOwner) {
        updatedOwners[index] = {
          ...updatedOwners[index],
          property_owner_id: value,
          property_owner: selectedOwner
        };
      }
    } else if (field === 'is_primary_owner' && value) {
      // Only one owner can be primary
      updatedOwners.forEach((owner, i) => {
        owner.is_primary_owner = i === index;
      });
    } else {
      updatedOwners[index] = {
        ...updatedOwners[index],
        [field]: value
      };
    }
    
    onOwnersChange(updatedOwners);
  };

  const handleQuickAddOwnerComplete = () => {
    onReloadOwners();
    setIsQuickAddOwnerOpen(false);
    toast({
      title: "Owner Added",
      description: "Property owner has been added successfully.",
    });
  };

  const validateOwnership = () => {
    const totalPercentage = selectedOwners.reduce((sum, owner) => {
      return sum + (owner.ownership_percentage || 0);
    }, 0);
    
    if (totalPercentage > 100) {
      toast({
        title: "Invalid Ownership",
        description: "Total ownership percentage cannot exceed 100%",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const getAvailableOwners = () => {
    const selectedOwnerIds = selectedOwners.map(o => o.property_owner_id);
    return availableOwners.filter(owner => !selectedOwnerIds.includes(owner.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Property Owners</Label>
          <p className="text-sm text-muted-foreground">
            Add one or more property owners. You can specify ownership percentages for co-investors.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsQuickAddOwnerOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Owner
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOwner}
            disabled={getAvailableOwners().length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Owner
          </Button>
        </div>
      </div>

      {selectedOwners.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              No property owners selected. Click "Add Owner" to get started.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {selectedOwners.map((owner, index) => (
          <Card key={owner.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Owner {index + 1}
                  {owner.is_primary_owner && (
                    <Badge variant="secondary" className="text-xs">
                      Primary
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOwner(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`owner-${index}`}>Property Owner *</Label>
                  <Select
                    value={owner.property_owner_id}
                    onValueChange={(value) => updateOwner(index, 'property_owner_id', value)}
                    disabled={isLoadingOwners}
                  >
                    <SelectTrigger id={`owner-${index}`}>
                      <SelectValue placeholder={isLoadingOwners ? "Loading owners..." : "Select property owner"} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Show currently selected owner even if it's not in available owners */}
                      {owner.property_owner_id && !getAvailableOwners().find(o => o.id === owner.property_owner_id) && (
                        <SelectItem value={owner.property_owner_id}>
                          {getOwnerDisplayName(owner.property_owner)}
                        </SelectItem>
                      )}
                      {getAvailableOwners().map((availableOwner) => (
                        <SelectItem key={availableOwner.id} value={availableOwner.id}>
                          {getOwnerDisplayName(availableOwner)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`percentage-${index}`}>Ownership % (optional)</Label>
                  <Input
                    id={`percentage-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={owner.ownership_percentage || ''}
                    onChange={(e) => updateOwner(index, 'ownership_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`primary-${index}`}
                  checked={owner.is_primary_owner}
                  onChange={(e) => updateOwner(index, 'is_primary_owner', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`primary-${index}`} className="text-sm">
                  Primary owner (main contact)
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOwners.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedOwners.some(o => o.ownership_percentage) && (
            <p>
              Total ownership: {selectedOwners.reduce((sum, owner) => sum + (owner.ownership_percentage || 0), 0)}%
            </p>
          )}
        </div>
      )}

      <AddPropertyOwnerDialog
        open={isQuickAddOwnerOpen}
        onOpenChange={setIsQuickAddOwnerOpen}
        onOwnerAdded={handleQuickAddOwnerComplete}
      />
    </div>
  );
};