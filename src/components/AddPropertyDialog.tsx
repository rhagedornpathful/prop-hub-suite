import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: () => void;
}

interface PropertyData {
  address: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: string;
  year_built?: number;
  estimated_value?: number;
  monthly_rent?: number;
  description?: string;
  amenities?: string[];
}

export function AddPropertyDialog({ open, onOpenChange, onPropertyAdded }: AddPropertyDialogProps) {
  const [searchAddress, setSearchAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: "",
    property_type: "",
    bedrooms: 0,
    bathrooms: 0,
    square_feet: 0,
    year_built: 0,
    estimated_value: 0,
    monthly_rent: 0,
    description: "",
  });
  const { toast } = useToast();

  const handleSearchProperty = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a property address",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-property', {
        body: { address: searchAddress }
      });

      if (error) throw error;

      if (data.success) {
        setPropertyData({
          ...propertyData,
          ...data.data,
          address: searchAddress,
        });
        toast({
          title: "Success",
          description: "Property information found and loaded!",
        });
      } else {
        toast({
          title: "No data found",
          description: "Could not find property information. You can enter details manually.",
          variant: "destructive",
        });
        setPropertyData({
          ...propertyData,
          address: searchAddress,
        });
      }
    } catch (error) {
      console.error('Error searching property:', error);
      toast({
        title: "Search failed",
        description: "Could not search property. You can enter details manually.",
        variant: "destructive",
      });
      setPropertyData({
        ...propertyData,
        address: searchAddress,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!propertyData.address.trim()) {
      toast({
        title: "Error",
        description: "Property address is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          user_id: userData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property added successfully!",
      });

      onPropertyAdded?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSearchAddress("");
    setPropertyData({
      address: "",
      property_type: "",
      bedrooms: 0,
      bathrooms: 0,
      square_feet: 0,
      year_built: 0,
      estimated_value: 0,
      monthly_rent: 0,
      description: "",
    });
  };

  const handleInputChange = (field: keyof PropertyData, value: any) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Search for property information from Zillow or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Search */}
          <div className="space-y-2">
            <Label htmlFor="search-address">Search Property Address</Label>
            <div className="flex space-x-2">
              <Input
                id="search-address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="123 Main St, City, State ZIP"
                className="flex-1"
              />
              <Button 
                onClick={handleSearchProperty} 
                disabled={isSearching}
                variant="outline"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Property Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                value={propertyData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full property address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={propertyData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={propertyData.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={propertyData.zip_code || ''}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                placeholder="ZIP Code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-type">Property Type</Label>
              <Select 
                value={propertyData.property_type} 
                onValueChange={(value) => handleInputChange('property_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_family">Single Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="multi_family">Multi Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={propertyData.bedrooms || ''}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                placeholder="Number of bedrooms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                value={propertyData.bathrooms || ''}
                onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
                placeholder="Number of bathrooms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="square-feet">Square Feet</Label>
              <Input
                id="square-feet"
                type="number"
                value={propertyData.square_feet || ''}
                onChange={(e) => handleInputChange('square_feet', parseInt(e.target.value) || 0)}
                placeholder="Square footage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year-built">Year Built</Label>
              <Input
                id="year-built"
                type="number"
                value={propertyData.year_built || ''}
                onChange={(e) => handleInputChange('year_built', parseInt(e.target.value) || 0)}
                placeholder="Year built"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-value">Estimated Value ($)</Label>
              <Input
                id="estimated-value"
                type="number"
                value={propertyData.estimated_value || ''}
                onChange={(e) => handleInputChange('estimated_value', parseInt(e.target.value) || 0)}
                placeholder="Property value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-rent">Monthly Rent ($)</Label>
              <Input
                id="monthly-rent"
                type="number"
                value={propertyData.monthly_rent || ''}
                onChange={(e) => handleInputChange('monthly_rent', parseInt(e.target.value) || 0)}
                placeholder="Monthly rent amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={propertyData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Property description and notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProperty} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Property'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}