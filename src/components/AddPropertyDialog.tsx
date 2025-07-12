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
import { Loader2, Search, Plus } from "lucide-react";
import { AddPropertyOwnerDialog } from "@/components/AddPropertyOwnerDialog";

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: () => void;
  editProperty?: any;
  mode?: "add" | "edit";
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
  description?: string;
  amenities?: string[];
  gate_code?: string;
  owner_id?: string;
}

interface PropertyOwner {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
}

export function AddPropertyDialog({ open, onOpenChange, onPropertyAdded, editProperty, mode = "add" }: AddPropertyDialogProps) {
  const { isMobile } = useMobileDetection();
  const [searchAddress, setSearchAddress] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isQuickAddOwnerOpen, setIsQuickAddOwnerOpen] = useState(false);
  const [propertyOwners, setPropertyOwners] = useState<PropertyOwner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>(() => {
    if (mode === "edit" && editProperty) {
      // Use the original database data if available, otherwise use the transformed data
      const dbData = (editProperty as any)._dbData || editProperty;
      return {
        address: dbData.address || "",
        property_type: dbData.property_type || editProperty.type || "",
        service_type: dbData.service_type || editProperty.serviceType || "property_management",
        bedrooms: dbData.bedrooms || 0,
        bathrooms: dbData.bathrooms || 0,
        square_feet: dbData.square_feet || 0,
        year_built: dbData.year_built || 0,
        estimated_value: dbData.estimated_value || 0,
        monthly_rent: dbData.monthly_rent || editProperty.monthlyRent || editProperty.monthlyFee || 0,
        description: dbData.description || "",
        owner_id: dbData.owner_id || "",
      };
    }
    return {
      address: "",
      property_type: "",
      service_type: "property_management",
      bedrooms: 0,
      bathrooms: 0,
      square_feet: 0,
      year_built: 0,
      estimated_value: 0,
      monthly_rent: 0,
      description: "",
      owner_id: "",
    };
  });
  const { toast } = useToast();
  const updateProperty = useUpdateProperty();

  // Load property owners when dialog opens
  useEffect(() => {
    if (open) {
      loadPropertyOwners();
    }
  }, [open]);

  // Reset form data when editProperty or mode changes
  useEffect(() => {
    console.log("Edit dialog - editProperty:", editProperty, "mode:", mode);
    if (mode === "edit" && editProperty) {
      const dbData = (editProperty as any)._dbData || editProperty;
      console.log("Edit dialog - dbData:", dbData);
      setPropertyData({
        address: dbData.address || "",
        property_type: dbData.property_type || editProperty.type || "",
        service_type: dbData.service_type || editProperty.serviceType || "property_management",
        bedrooms: dbData.bedrooms || 0,
        bathrooms: dbData.bathrooms || 0,
        square_feet: dbData.square_feet || 0,
        year_built: dbData.year_built || 0,
        estimated_value: dbData.estimated_value || 0,
        monthly_rent: dbData.monthly_rent || editProperty.monthlyRent || editProperty.monthlyFee || 0,
        description: dbData.description || "",
        owner_id: dbData.owner_id || "",
      });
      setSearchAddress(dbData.address || "");
    } else if (mode === "add") {
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
        description: "",
        owner_id: "",
      });
      setSearchAddress("");
    }
  }, [editProperty, mode]);

  const loadPropertyOwners = async () => {
    // Check if we're in demo mode
    const isDemoMode = window.location.pathname.startsWith('/demo');
    
    if (isDemoMode) {
      // Mock data for demo mode
      setPropertyOwners([
        { id: "1", first_name: "John", last_name: "Smith", company_name: "Smith Properties LLC" },
        { id: "2", first_name: "Sarah", last_name: "Johnson" },
        { id: "3", first_name: "Michael", last_name: "Davis", company_name: "Davis Real Estate Holdings" }
      ]);
      return;
    }

    setIsLoadingOwners(true);
    try {
      const { data, error } = await supabase
        .from('property_owners')
        .select('id, first_name, last_name, company_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPropertyOwners(data || []);
    } catch (error) {
      console.error('Error loading property owners:', error);
      toast({
        title: "Error",
        description: "Failed to load property owners",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOwners(false);
    }
  };

  const getOwnerDisplayName = (owner: PropertyOwner) => {
    return owner.company_name || `${owner.first_name} ${owner.last_name}`;
  };

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
      // Check if we're in demo mode
      const isDemoMode = window.location.pathname.startsWith('/demo');
      
      if (isDemoMode) {
        // In demo mode, simulate property search with mock data
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate search delay
        
        const mockPropertyData = {
          address: searchAddress,
          city: "Demo City",
          state: "CA", 
          zip_code: "90210",
          property_type: "single_family",
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1800,
          year_built: 2010,
          estimated_value: 650000,
          monthly_rent: 3200,
          description: "Beautiful demo property with modern amenities"
        };
        
        setPropertyData({
          ...propertyData,
          ...mockPropertyData,
        });
        
        toast({
          title: "Success",
          description: "Demo property information loaded!",
        });
        return;
      }

      // Regular mode - try to use the edge function
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
      // Check if we're in demo mode
      const isDemoMode = window.location.pathname.startsWith('/demo');
      
      if (isDemoMode) {
        // In demo mode, just simulate a successful save
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        toast({
          title: "Success",
          description: `Property ${mode === "edit" ? "updated" : "added"} successfully! (Demo Mode)`,
        });
        
        onPropertyAdded?.();
        onOpenChange(false);
        resetForm();
        return;
      }

      // Regular authenticated mode
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      if (mode === "edit" && editProperty) {
        // Update existing property
        const dbData = (editProperty as any)._dbData || editProperty;
        const propertyId = dbData.id || editProperty.id;
        
        updateProperty.mutate({
          id: propertyId,
          updates: propertyData
        }, {
          onSuccess: () => {
            onPropertyAdded?.();
            onOpenChange(false);
            resetForm();
          }
        });
      } else {
        // Create new property
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
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "save"} property`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResearchProperty = async () => {
    const addressToResearch = propertyData.address || searchAddress;
    
    if (!addressToResearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter a property address first",
        variant: "destructive",
      });
      return;
    }

    setIsResearching(true);
    try {
      console.log("Researching property:", addressToResearch);
      
      const { data, error } = await supabase.functions.invoke('scrape-property', {
        body: { address: addressToResearch }
      });

      if (error) {
        console.error("Error calling scrape-property function:", error);
        throw error;
      }

      if (data?.success && data?.data) {
        const scrapedData = data.data;
        console.log("Received scraped data:", scrapedData);
        
        // Update form with scraped data
        setPropertyData(prev => ({
          ...prev,
          address: scrapedData.address || prev.address,
          estimated_value: scrapedData.estimated_value || prev.estimated_value,
          bedrooms: scrapedData.bedrooms || prev.bedrooms,
          bathrooms: scrapedData.bathrooms || prev.bathrooms,
          square_feet: scrapedData.square_feet || prev.square_feet,
          year_built: scrapedData.year_built || prev.year_built,
          property_type: scrapedData.property_type || prev.property_type,
          description: scrapedData.description || prev.description,
        }));

        setSearchAddress(scrapedData.address || addressToResearch);

        toast({
          title: "Property Research Complete",
          description: "Property information has been automatically populated from public sources.",
        });
      } else {
        toast({
          title: "Research Complete",
          description: data?.error || "Some property details were found. Please review and complete the form.",
        });
      }
    } catch (error) {
      console.error('Error researching property:', error);
      toast({
        title: "Research Error",
        description: "Could not automatically research property. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  const resetForm = () => {
    setSearchAddress("");
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
      description: "",
      owner_id: "",
    });
  };

  const handleQuickAddOwnerComplete = () => {
    // Reload the owners list
    loadPropertyOwners();
    toast({
      title: "Owner Added",
      description: "Property owner has been added successfully.",
    });
  };

  const handleInputChange = (field: keyof PropertyData, value: any) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const DialogWrapper = isMobile ? MobileDialog : Dialog;
  const ContentWrapper = isMobile ? "div" : DialogContent;

  return (
    <DialogWrapper open={open} onOpenChange={onOpenChange}>
      <ContentWrapper className={isMobile ? "" : "max-w-2xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Property" : "Add New Property"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Update property information below." 
              : "Search for property information from Zillow or enter details manually."
            }
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
              <Button 
                onClick={handleResearchProperty} 
                disabled={isResearching}
                variant="outline"
                className="bg-gradient-primary text-white hover:bg-primary-dark"
              >
                {isResearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Research"
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="service-type">Service Type *</Label>
              <Select 
                value={propertyData.service_type} 
                onValueChange={(value) => handleInputChange('service_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property_management">Property Management</SelectItem>
                  <SelectItem value="house_watching">House Watching</SelectItem>
                  <SelectItem value="both">Both Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="property-owner">Property Owner *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickAddOwnerOpen(true)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Quick Add
                </Button>
              </div>
              <Select 
                value={propertyData.owner_id} 
                onValueChange={(value) => handleInputChange('owner_id', value)}
                disabled={isLoadingOwners}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingOwners ? "Loading owners..." : "Select property owner"} />
                </SelectTrigger>
                <SelectContent>
                  {propertyOwners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {getOwnerDisplayName(owner)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="gate-code">Gate Code</Label>
              <Input
                id="gate-code"
                value={propertyData.gate_code || ''}
                onChange={(e) => handleInputChange('gate_code', e.target.value)}
                placeholder="Access code for gated community"
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
                  {mode === "edit" ? "Updating..." : "Saving..."}
                </>
              ) : (
                mode === "edit" ? "Update Property" : "Add Property"
              )}
            </Button>
          </div>
        </div>
      </ContentWrapper>
      
      <AddPropertyOwnerDialog
        open={isQuickAddOwnerOpen}
        onOpenChange={setIsQuickAddOwnerOpen}
        onOwnerAdded={handleQuickAddOwnerComplete}
      />
    </DialogWrapper>
  );
}