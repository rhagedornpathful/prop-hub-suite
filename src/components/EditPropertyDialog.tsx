import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateProperty } from "@/hooks/queries/useProperties";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileDialog } from "@/components/mobile/MobileDialog";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
import { PropertyImageUploadPreview } from "@/components/PropertyImageUploadPreview";
import { PropertyOwnerManager } from "@/components/PropertyOwnerManager";
import { usePropertyOwners } from "@/hooks/queries/usePropertyOwners";
import { usePropertyOwnerAssociations } from "@/hooks/queries/usePropertyOwnerAssociations";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<'properties'>;

interface EditPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onPropertyUpdated?: () => void;
}

interface PropertyData {
  address: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  service_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: string;
  year_built?: number;
  estimated_value?: number;
  monthly_rent?: number;
  home_value_estimate?: number;
  rent_estimate?: number;
  description?: string;
  amenities?: string[];
  gate_code?: string;
  images?: string[];
}

const amenityOptions = [
  "Pool", "Gym", "Parking", "Pet Friendly", "Laundry", "Air Conditioning",
  "Heating", "Dishwasher", "Balcony", "Garden", "Fireplace", "Hardwood Floors"
];

export function EditPropertyDialog({ open, onOpenChange, property, onPropertyUpdated }: EditPropertyDialogProps) {
  const { isMobile } = useMobileDetection();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOwners, setSelectedOwners] = useState<any[]>([]);
  
  // Fetch data
  const { data: propertyOwners = [], isLoading: isLoadingOwners } = usePropertyOwners();
  const { data: ownerAssociations = [], refetch: refetchAssociations } = usePropertyOwnerAssociations(property?.id);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: "",
    property_type: "",
    service_type: "property_management",
    bedrooms: 0,
    bathrooms: 0,
    square_feet: 0,
    year_built: 0,
    estimated_value: 0,
    monthly_rent: 0,
    home_value_estimate: 0,
    rent_estimate: 0,
    description: "",
    gate_code: "",
    images: [],
    amenities: [],
  });
  const { toast } = useToast();
  const updateProperty = useUpdateProperty();

  // Reset form data when property changes
  useEffect(() => {
    if (property) {
      setPropertyData({
        address: property.address || "",
        street_address: property.street_address || "",
        city: property.city || "",
        state: property.state || "",
        zip_code: property.zip_code || "",
        property_type: property.property_type || "",
        service_type: property.service_type || "property_management",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        square_feet: property.square_feet || 0,
        lot_size: property.lot_size || "",
        year_built: property.year_built || 0,
        estimated_value: property.estimated_value || 0,
        monthly_rent: property.monthly_rent || 0,
        home_value_estimate: property.home_value_estimate || 0,
        rent_estimate: property.rent_estimate || 0,
        description: property.description || "",
        gate_code: property.gate_code || "",
        images: property.images || [],
        amenities: property.amenities || [],
      });
    }
  }, [property]);

  // Update selected owners when associations change
  useEffect(() => {
    if (ownerAssociations.length > 0) {
      setSelectedOwners(ownerAssociations);
    } else {
      setSelectedOwners([]);
    }
  }, [ownerAssociations]);

  const resetForm = () => {
    setPropertyData({
      address: "",
      property_type: "",
      service_type: "property_management",
      bedrooms: 0,
      bathrooms: 0,
      square_feet: 0,
      year_built: 0,
      estimated_value: 0,
      monthly_rent: 0,
      home_value_estimate: 0,
      rent_estimate: 0,
      description: "",
      gate_code: "",
      images: [],
      amenities: [],
    });
  };

  const handleUpdateProperty = async () => {
    if (!property) return;

    if (!propertyData.address.trim()) {
      toast({
        title: "Error",
        description: "Address is required",
        variant: "destructive",
      });
      return;
    }

    // Clean the data - remove empty strings and convert to null where appropriate
    // IMPORTANT: Do not include user_id in updates as it's NOT NULL and shouldn't change
    const cleanedData = {
      address: propertyData.address.trim(),
      street_address: propertyData.street_address?.trim() || null,
      city: propertyData.city?.trim() || null,
      state: propertyData.state?.trim() || null,
      zip_code: propertyData.zip_code?.trim() || null,
      property_type: propertyData.property_type || null,
      service_type: propertyData.service_type || 'property_management',
      bedrooms: propertyData.bedrooms || null,
      bathrooms: propertyData.bathrooms || null,
      square_feet: propertyData.square_feet || null,
      lot_size: propertyData.lot_size?.trim() || null,
      year_built: propertyData.year_built || null,
      estimated_value: propertyData.estimated_value || null,
      monthly_rent: propertyData.monthly_rent || null,
      home_value_estimate: propertyData.home_value_estimate || null,
      rent_estimate: propertyData.rent_estimate || null,
      description: propertyData.description?.trim() || null,
      gate_code: propertyData.gate_code?.trim() || null,
      images: propertyData.images || null,
      amenities: propertyData.amenities || null,
    };

    console.log('Updating property with cleaned data:', cleanedData);
    console.log('Property ID:', property.id);

    setIsSaving(true);
    try {
      updateProperty.mutate({
        id: property.id,
        updates: cleanedData
      }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Property updated successfully!",
          });
          onPropertyUpdated?.();
          onOpenChange(false);
          resetForm();
        },
        onError: (error) => {
          console.error('Error updating property:', error);
          toast({
            title: "Error",
            description: "Failed to update property",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = propertyData.amenities || [];
    if (checked) {
      setPropertyData({
        ...propertyData,
        amenities: [...currentAmenities, amenity]
      });
    } else {
      setPropertyData({
        ...propertyData,
        amenities: currentAmenities.filter(a => a !== amenity)
      });
    }
  };

  const handleImagesChange = (images: string[]) => {
    setPropertyData({
      ...propertyData,
      images
    });
  };

  if (isMobile) {
    return (
      <MobileDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Edit Property: ${property?.address || ""}`}
        description="Update property information and details"
      >
        <div className="space-y-6 pb-20">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                  placeholder="Enter property address"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={propertyData.city || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={propertyData.state || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={propertyData.zip_code || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, zip_code: e.target.value })}
                  placeholder="ZIP Code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={propertyData.property_type || ""}
                onValueChange={(value) => setPropertyData({ ...propertyData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_family">Single Family</SelectItem>
                  <SelectItem value="multi_family">Multi Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={propertyData.bedrooms || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, bedrooms: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={propertyData.bathrooms || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, bathrooms: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_rent">Monthly Rent</Label>
              <Input
                id="monthly_rent"
                type="number"
                value={propertyData.monthly_rent || ""}
                onChange={(e) => setPropertyData({ ...propertyData, monthly_rent: parseInt(e.target.value) || 0 })}
                placeholder="Monthly rent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={propertyData.description || ""}
                onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                placeholder="Property description..."
                rows={3}
              />
            </div>

            {/* Property Owner Assignment */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Property Owners</h3>
                <PropertyOwnerManager
                  propertyId={property?.id}
                  selectedOwners={selectedOwners}
                  availableOwners={propertyOwners}
                  isLoadingOwners={isLoadingOwners}
                  onOwnersChange={setSelectedOwners}
                  onReloadOwners={() => refetchAssociations()}
                />
              </div>
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProperty}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </div>
        </div>
      </MobileDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property: {property?.address || ""}</DialogTitle>
          <DialogDescription>
            Update property information and details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                  placeholder="Enter property address"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={propertyData.city || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={propertyData.state || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={propertyData.zip_code || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, zip_code: e.target.value })}
                  placeholder="ZIP Code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={propertyData.property_type || ""}
                  onValueChange={(value) => setPropertyData({ ...propertyData, property_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_family">Single Family</SelectItem>
                    <SelectItem value="multi_family">Multi Family</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select
                  value={propertyData.service_type || "property_management"}
                  onValueChange={(value) => setPropertyData({ ...propertyData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property_management">Property Management</SelectItem>
                    <SelectItem value="house_watching">House Watching</SelectItem>
                    <SelectItem value="maintenance_only">Maintenance Only</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={propertyData.bedrooms || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, bedrooms: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={propertyData.bathrooms || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, bathrooms: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="square_feet">Square Feet</Label>
                <Input
                  id="square_feet"
                  type="number"
                  value={propertyData.square_feet || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, square_feet: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year_built">Year Built</Label>
                <Input
                  id="year_built"
                  type="number"
                  value={propertyData.year_built || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, year_built: parseInt(e.target.value) || 0 })}
                  placeholder="Year"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_value">Estimated Value</Label>
                <Input
                  id="estimated_value"
                  type="number"
                  value={propertyData.estimated_value || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, estimated_value: parseInt(e.target.value) || 0 })}
                  placeholder="Property value"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Monthly Rent</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  value={propertyData.monthly_rent || ""}
                  onChange={(e) => setPropertyData({ ...propertyData, monthly_rent: parseInt(e.target.value) || 0 })}
                  placeholder="Monthly rent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={propertyData.description || ""}
                onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                placeholder="Property description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate_code">Gate Code</Label>
              <Input
                id="gate_code"
                value={propertyData.gate_code || ""}
                onChange={(e) => setPropertyData({ ...propertyData, gate_code: e.target.value })}
                placeholder="Access gate code"
              />
            </div>

            {/* Property Owner Assignment */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Property Owners</h3>
                <PropertyOwnerManager
                  propertyId={property?.id}
                  selectedOwners={selectedOwners}
                  availableOwners={propertyOwners}
                  isLoadingOwners={isLoadingOwners}
                  onOwnersChange={setSelectedOwners}
                  onReloadOwners={() => refetchAssociations()}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={(propertyData.amenities || []).includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Property Images</Label>
              {property && (
                <PropertyImageUpload
                  propertyId={property.id}
                  currentImage={propertyData.images?.[0]}
                  onImageUpdate={(imageUrl) => {
                    const newImages = [...(propertyData.images || [])];
                    newImages[0] = imageUrl;
                    setPropertyData({ ...propertyData, images: newImages });
                  }}
                />
              )}
              {propertyData.images && propertyData.images.length > 0 && (
                <PropertyImageUploadPreview
                  images={propertyData.images}
                  onImagesChange={handleImagesChange}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProperty}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Property
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}