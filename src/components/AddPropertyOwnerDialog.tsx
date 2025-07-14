import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUnassignedProperties, usePropertiesByOwner, useUpdateProperty } from "@/hooks/queries/useProperties";
import { useCreatePropertyOwner, useUpdatePropertyOwner } from "@/hooks/queries/usePropertyOwners";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, X } from "lucide-react";

// Use a more flexible type for the form data
interface PropertyOwnerFormData {
  id?: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  spouse_partner_name?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  tax_id_number?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  preferred_payment_method: string;
  is_self: boolean;
  notes?: string;
}

interface AddPropertyOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOwnerAdded?: () => void;
  editOwner?: any; // Use any for now to avoid type conflicts
  mode?: "add" | "edit";
}

export function AddPropertyOwnerDialog({ 
  open, 
  onOpenChange, 
  onOwnerAdded, 
  editOwner, 
  mode = "add" 
}: AddPropertyOwnerDialogProps) {
  const { isMobile } = useMobileDetection();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [createUserAccount, setCreateUserAccount] = useState(false);
  
  // Fetch unassigned properties for new owners or owner-specific properties for editing
  const { data: unassignedProperties = [] } = useUnassignedProperties();
  const { data: ownerProperties = [] } = usePropertiesByOwner(editOwner?.id);
  const updateProperty = useUpdateProperty();
  
  // Property owner mutation hooks
  const createOwnerMutation = useCreatePropertyOwner();
  const updateOwnerMutation = useUpdatePropertyOwner();
  
  const [ownerData, setOwnerData] = useState<PropertyOwnerFormData>(() => {
    return {
      first_name: "",
      last_name: "",
      company_name: "",
      spouse_partner_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      tax_id_number: "",
      bank_account_name: "",
      bank_account_number: "",
      bank_routing_number: "",
      preferred_payment_method: "check",
      is_self: false,
      notes: "",
    };
  });
  const { toast } = useToast();

  // Update form when editOwner changes
  useEffect(() => {
    if (mode === "edit" && editOwner) {
      setOwnerData({ ...editOwner });
    } else if (mode === "add") {
      setOwnerData({
        first_name: "",
        last_name: "",
        company_name: "",
        spouse_partner_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        tax_id_number: "",
        bank_account_name: "",
        bank_account_number: "",
        bank_routing_number: "",
        preferred_payment_method: "check",
        is_self: false,
        notes: "",
      });
      setSelectedProperties([]);
      setCreateUserAccount(false);
    }
  }, [editOwner, mode]);

  // Separate effect for setting selected properties when editing
  useEffect(() => {
    if (mode === "edit" && ownerProperties.length > 0) {
      setSelectedProperties(ownerProperties.map(p => p.id));
    }
  }, [mode, ownerProperties]);

  // Filter properties based on search and filter criteria
  const filteredUnassignedProperties = unassignedProperties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
                         property.city?.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
                         property.state?.toLowerCase().includes(propertySearchTerm.toLowerCase());
    
    const matchesType = propertyTypeFilter === "all" || property.property_type === propertyTypeFilter;
    
    return matchesSearch && matchesType;
  });

  // Get unique property types for filter dropdown
  const propertyTypes = [...new Set(unassignedProperties.map(p => p.property_type).filter(Boolean))];

  const clearPropertySearch = () => {
    setPropertySearchTerm("");
    setPropertyTypeFilter("all");
  };

  const handleSaveOwner = async () => {
    if (!ownerData.first_name.trim() || !ownerData.last_name.trim() || !ownerData.email.trim() || !ownerData.phone.trim()) {
      toast({
        title: "Error",
        description: "First name, last name, email, and phone are required",
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
          description: `Property owner ${mode === "edit" ? "updated" : "added"} successfully! (Demo Mode)`,
        });
        
        onOwnerAdded?.();
        onOpenChange(false);
        return;
      }

      // Regular authenticated mode
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      if (mode === "edit" && ownerData.id) {
        await updateOwnerMutation.mutateAsync({
          id: ownerData.id,
          updates: {
            first_name: ownerData.first_name,
            last_name: ownerData.last_name,
            company_name: ownerData.company_name || null,
            spouse_partner_name: ownerData.spouse_partner_name || null,
            email: ownerData.email,
            phone: ownerData.phone,
            address: ownerData.address || null,
            city: ownerData.city || null,
            state: ownerData.state || null,
            zip_code: ownerData.zip_code || null,
            tax_id_number: ownerData.tax_id_number || null,
            bank_account_name: ownerData.bank_account_name || null,
            bank_account_number: ownerData.bank_account_number || null,
            bank_routing_number: ownerData.bank_routing_number || null,
            preferred_payment_method: ownerData.preferred_payment_method,
            is_self: ownerData.is_self,
            notes: ownerData.notes || null,
          }
        });
      } else {
        // Create new owner
        let newOwner;
        let userAccountId = null;

        if (createUserAccount) {
          // Create user account using edge function
          const { data: createUserResponse, error: createUserError } = await supabase.functions.invoke('create-user-with-role', {
            body: {
              email: ownerData.email,
              firstName: ownerData.first_name,
              lastName: ownerData.last_name,
              role: 'property_owner',
              phone: ownerData.phone,
              address: ownerData.address,
              city: ownerData.city,
              state: ownerData.state,
              zipCode: ownerData.zip_code,
              companyName: ownerData.company_name,
              additionalData: {
                spouse_partner_name: ownerData.spouse_partner_name,
                tax_id_number: ownerData.tax_id_number,
                bank_account_name: ownerData.bank_account_name,
                bank_account_number: ownerData.bank_account_number,
                bank_routing_number: ownerData.bank_routing_number,
                preferred_payment_method: ownerData.preferred_payment_method,
                is_self: ownerData.is_self,
                notes: ownerData.notes,
              }
            }
          });

          if (createUserError) {
            console.error('Error creating user account:', createUserError);
            toast({
              title: "Error",
              description: "Failed to create user account. Property owner record will still be created.",
              variant: "destructive",
            });
          } else {
            userAccountId = createUserResponse.userId;
            toast({
              title: "Success",
              description: "User account created and welcome email sent!",
            });
          }
        }

        // Create property owner record (whether or not user account was created)
        newOwner = await createOwnerMutation.mutateAsync({
          ...ownerData,
          user_id: userData.user.id,
          user_account_id: userAccountId,
          company_name: ownerData.company_name || null,
          spouse_partner_name: ownerData.spouse_partner_name || null,
          address: ownerData.address || null,
          city: ownerData.city || null,
          state: ownerData.state || null,
          zip_code: ownerData.zip_code || null,
          tax_id_number: ownerData.tax_id_number || null,
          bank_account_name: ownerData.bank_account_name || null,
          bank_account_number: ownerData.bank_account_number || null,
          bank_routing_number: ownerData.bank_routing_number || null,
          notes: ownerData.notes || null,
        });

        // Associate selected properties with the new owner
        if (selectedProperties.length > 0 && newOwner) {
          for (const propertyId of selectedProperties) {
            const { error: updateError } = await supabase
              .from('properties')
              .update({ owner_id: newOwner.id })
              .eq('id', propertyId);
            
            if (updateError) {
              console.error('Error associating property:', updateError);
              // Don't throw here, just log the error so the owner creation doesn't fail
            }
          }
        }
      }

      toast({
        title: "Success",
        description: `Property owner ${mode === "edit" ? "updated" : "added"} successfully!`,
      });

      onOwnerAdded?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving property owner:', error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "save"} property owner`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof PropertyOwnerFormData, value: any) => {
    setOwnerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const DialogWrapper = isMobile ? MobileDialog : Dialog;
  const ContentWrapper = isMobile ? "div" : DialogContent;

  return (
    <DialogWrapper open={open} onOpenChange={onOpenChange}>
      <ContentWrapper className={isMobile ? "" : "max-w-3xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Property Owner" : "Add Property Owner"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Update property owner information below." 
              : "Enter property owner information and contact details."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name *</Label>
                <Input
                  id="first-name"
                  value={ownerData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name *</Label>
                <Input
                  id="last-name"
                  value={ownerData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Last name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={ownerData.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Company or business name (optional)"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="spouse-partner">Spouse/Partner Name</Label>
                <Input
                  id="spouse-partner"
                  value={ownerData.spouse_partner_name || ''}
                  onChange={(e) => handleInputChange('spouse_partner_name', e.target.value)}
                  placeholder="Spouse or partner name (optional)"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-self"
                  checked={ownerData.is_self}
                  onCheckedChange={(checked) => handleInputChange('is_self', checked)}
                />
                <Label htmlFor="is-self" className="text-sm font-medium">
                  This is me (I am the property owner)
                </Label>
              </div>
              
              {mode === "add" && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="create-user-account"
                    checked={createUserAccount}
                    onCheckedChange={(checked) => setCreateUserAccount(checked === true)}
                  />
                  <Label htmlFor="create-user-account" className="text-sm font-medium">
                    Create user account for this owner
                  </Label>
                </div>
              )}
              
              {createUserAccount && (
                <div className="ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    ℹ️ A user account will be created with a temporary password. 
                    An email with login credentials will be sent to <strong>{ownerData.email || 'the provided email'}</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={ownerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={ownerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={ownerData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={ownerData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={ownerData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={ownerData.zip_code || ''}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Association */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Property Association</h3>
            <p className="text-sm text-muted-foreground">
              Select properties to associate with this owner. Properties can be assigned during creation or later.
            </p>
            
            {mode === "add" && unassignedProperties.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties by address, city..."
                      value={propertySearchTerm}
                      onChange={(e) => setPropertySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {propertyTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type?.charAt(0).toUpperCase() + type?.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(propertySearchTerm || propertyTypeFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearPropertySearch}
                        className="px-3"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Available Properties</Label>
                    <span className="text-sm text-muted-foreground">
                      {filteredUnassignedProperties.length} of {unassignedProperties.length} properties
                    </span>
                  </div>
                  
                  {filteredUnassignedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                      {filteredUnassignedProperties.map((property) => (
                        <div key={property.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded">
                          <Checkbox
                            id={`property-${property.id}`}
                            checked={selectedProperties.includes(property.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProperties(prev => [...prev, property.id]);
                              } else {
                                setSelectedProperties(prev => prev.filter(id => id !== property.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`property-${property.id}`} className="text-sm cursor-pointer font-medium">
                              {property.address}
                            </Label>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {property.city}, {property.state}
                              {property.property_type && (
                                <span className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">
                                  {property.property_type.replace('_', ' ')}
                                </span>
                              )}
                              {property.monthly_rent && (
                                <span className="ml-2 font-medium text-foreground">
                                  ${property.monthly_rent}/month
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        No properties found matching your search criteria.
                      </p>
                      {(propertySearchTerm || propertyTypeFilter !== "all") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearPropertySearch}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {selectedProperties.length > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">
                      {selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'} selected
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {mode === "add" && unassignedProperties.length === 0 && (
              <div className="text-center py-6 border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No unassigned properties available. Properties can be assigned to this owner later.
                </p>
              </div>
            )}
            
            {mode === "edit" && (
              <div className="space-y-3">
                <Label>Currently Assigned Properties</Label>
                {ownerProperties.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {ownerProperties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">
                          {property.address} • {property.city}, {property.state}
                          {property.monthly_rent && (
                            <span className="text-muted-foreground ml-2">
                              (${property.monthly_rent}/month)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No properties currently assigned to this owner.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tax & Banking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tax & Banking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID Number</Label>
                <Input
                  id="tax-id"
                  value={ownerData.tax_id_number || ''}
                  onChange={(e) => handleInputChange('tax_id_number', e.target.value)}
                  placeholder="Tax ID or SSN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Preferred Payment Method</Label>
                <Select 
                  value={ownerData.preferred_payment_method} 
                  onValueChange={(value) => handleInputChange('preferred_payment_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {ownerData.preferred_payment_method === "direct_deposit" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Account Name</Label>
                  <Input
                    id="bank-name"
                    value={ownerData.bank_account_name || ''}
                    onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                    placeholder="Account holder name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={ownerData.bank_account_number || ''}
                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routing-number">Routing Number</Label>
                  <Input
                    id="routing-number"
                    value={ownerData.bank_routing_number || ''}
                    onChange={(e) => handleInputChange('bank_routing_number', e.target.value)}
                    placeholder="Routing number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={ownerData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOwner} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Saving..."}
                </>
              ) : (
                mode === "edit" ? "Update Owner" : "Add Owner"
              )}
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </DialogWrapper>
  );
}