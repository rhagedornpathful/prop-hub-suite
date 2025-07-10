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
import { Loader2, User } from "lucide-react";

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTenantAdded?: () => void;
}

interface Property {
  id: string;
  address: string;
}

interface TenantData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_id: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  security_deposit: number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}

export function AddTenantDialog({ open, onOpenChange, onTenantAdded }: AddTenantDialogProps) {
  const { isMobile } = useMobileDetection();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    property_id: "",
    lease_start_date: "",
    lease_end_date: "",
    monthly_rent: 0,
    security_deposit: 0,
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProperties();
    }
  }, [open]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, address')
        .eq('status', 'active');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSaveTenant = async () => {
    if (!tenantData.first_name.trim() || !tenantData.last_name.trim() || !tenantData.property_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // First, create the tenant record in a tenants table
      // We'll need to create this table first
      const { error } = await supabase
        .from('tenants')
        .insert({
          ...tenantData,
          user_id: userData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant added successfully!",
      });

      onTenantAdded?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tenant:', error);
      toast({
        title: "Error",
        description: "Failed to save tenant",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTenantData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      property_id: "",
      lease_start_date: "",
      lease_end_date: "",
      monthly_rent: 0,
      security_deposit: 0,
      emergency_contact_name: "",
      emergency_contact_phone: "",
      notes: "",
    });
  };

  const handleInputChange = (field: keyof TenantData, value: any) => {
    setTenantData(prev => ({
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
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Add a new tenant to your property management system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name *</Label>
                <Input
                  id="first-name"
                  value={tenantData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name *</Label>
                <Input
                  id="last-name"
                  value={tenantData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={tenantData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={tenantData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Lease Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Lease Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property">Property *</Label>
                <Select 
                  value={tenantData.property_id} 
                  onValueChange={(value) => handleInputChange('property_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lease-start">Lease Start Date</Label>
                <Input
                  id="lease-start"
                  type="date"
                  value={tenantData.lease_start_date}
                  onChange={(e) => handleInputChange('lease_start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lease-end">Lease End Date</Label>
                <Input
                  id="lease-end"
                  type="date"
                  value={tenantData.lease_end_date}
                  onChange={(e) => handleInputChange('lease_end_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly-rent">Monthly Rent ($)</Label>
                <Input
                  id="monthly-rent"
                  type="number"
                  value={tenantData.monthly_rent || ''}
                  onChange={(e) => handleInputChange('monthly_rent', parseInt(e.target.value) || 0)}
                  placeholder="Monthly rent amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security-deposit">Security Deposit ($)</Label>
                <Input
                  id="security-deposit"
                  type="number"
                  value={tenantData.security_deposit || ''}
                  onChange={(e) => handleInputChange('security_deposit', parseInt(e.target.value) || 0)}
                  placeholder="Security deposit amount"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Contact Name</Label>
                <Input
                  id="emergency-name"
                  value={tenantData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Contact Phone</Label>
                <Input
                  id="emergency-phone"
                  value={tenantData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={tenantData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the tenant"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTenant} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Add Tenant
                </>
              )}
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </DialogWrapper>
  );
}