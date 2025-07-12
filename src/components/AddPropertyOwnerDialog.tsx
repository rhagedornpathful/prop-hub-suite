import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

interface PropertyOwner {
  id?: string;
  first_name: string;
  last_name: string;
  company_name?: string;
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
  preferred_payment_method: "check" | "direct_deposit" | "other";
  is_self: boolean;
  notes?: string;
}

interface AddPropertyOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOwnerAdded?: () => void;
  editOwner?: PropertyOwner | null;
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
  const [ownerData, setOwnerData] = useState<PropertyOwner>(() => {
    if (mode === "edit" && editOwner) {
      return { ...editOwner };
    }
    return {
      first_name: "",
      last_name: "",
      company_name: "",
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
    }
  }, [editOwner, mode]);

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
        const { error } = await supabase
          .from('property_owners')
          .update({
            first_name: ownerData.first_name,
            last_name: ownerData.last_name,
            company_name: ownerData.company_name || null,
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
          })
          .eq('id', ownerData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('property_owners')
          .insert({
            ...ownerData,
            user_id: userData.user.id,
            company_name: ownerData.company_name || null,
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

        if (error) throw error;
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

  const handleInputChange = (field: keyof PropertyOwner, value: any) => {
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
            </div>
            
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