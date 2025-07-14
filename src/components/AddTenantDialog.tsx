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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTenantDialogProps {
  onTenantAdded: () => void;
}

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  monthly_rent: number | null;
}

const AddTenantDialog = ({ onTenantAdded }: AddTenantDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leaseStartDate, setLeaseStartDate] = useState<Date>();
  const [leaseEndDate, setLeaseEndDate] = useState<Date>();
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    propertyId: "",
    monthlyRent: "",
    securityDeposit: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: ""
  });
  const { toast } = useToast();

  // Fetch available properties when dialog opens
  useEffect(() => {
    if (open) {
      fetchProperties();
    }
  }, [open]);

  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, address, city, state, monthly_rent')
        .order('address', { ascending: true });

      if (error) throw error;
      setProperties(data || []);
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
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      propertyId: "",
      monthlyRent: "",
      securityDeposit: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      notes: ""
    });
    setLeaseStartDate(undefined);
    setLeaseEndDate(undefined);
    setCreateUserAccount(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.propertyId) {
        throw new Error("First name, last name, and property are required");
      }

      // Get current user for user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let tenantUserAccountId = null;

      if (createUserAccount && formData.email) {
        // Create user account using edge function
        const { data: createUserResponse, error: createUserError } = await supabase.functions.invoke('create-user-with-role', {
          body: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: 'tenant',
            phone: formData.phone,
            additionalData: {
              property_id: formData.propertyId,
              lease_start_date: leaseStartDate?.toISOString().split('T')[0] || null,
              lease_end_date: leaseEndDate?.toISOString().split('T')[0] || null,
              monthly_rent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : null,
              security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
              emergency_contact_name: formData.emergencyContactName || null,
              emergency_contact_phone: formData.emergencyContactPhone || null,
            }
          }
        });

        if (createUserError) {
          console.error('Error creating user account:', createUserError);
          toast({
            title: "Error",
            description: "Failed to create user account. Tenant record will still be created.",
            variant: "destructive",
          });
        } else {
          tenantUserAccountId = createUserResponse.userId;
          toast({
            title: "Success",
            description: "User account created and welcome email sent!",
          });
        }
      }

      const { error } = await supabase
        .from('tenants')
        .insert({
          user_id: user.id,
          user_account_id: tenantUserAccountId,
          property_id: formData.propertyId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email || null,
          phone: formData.phone || null,
          lease_start_date: leaseStartDate?.toISOString().split('T')[0] || null,
          lease_end_date: leaseEndDate?.toISOString().split('T')[0] || null,
          monthly_rent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : null,
          security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Tenant Added",
        description: "New tenant has been successfully added to the system",
      });

      setOpen(false);
      resetForm();
      onTenantAdded();
    } catch (error: any) {
      console.error('Error adding tenant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add tenant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPropertyDisplay = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return "";
    return `${property.address}${property.city ? `, ${property.city}` : ''}${property.state ? `, ${property.state}` : ''}`;
  };

  // Auto-fill rent from selected property
  useEffect(() => {
    if (formData.propertyId) {
      const property = properties.find(p => p.id === formData.propertyId);
      if (property?.monthly_rent && !formData.monthlyRent) {
        setFormData(prev => ({ ...prev, monthlyRent: property.monthly_rent!.toString() }));
      }
    }
  }, [formData.propertyId, properties]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Add a new tenant to your property management system. Fill in their details and lease information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {formData.email && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="create-user-account"
                    checked={createUserAccount}
                    onCheckedChange={(checked) => setCreateUserAccount(checked === true)}
                  />
                  <Label htmlFor="create-user-account" className="text-sm font-medium">
                    Create user account for this tenant
                  </Label>
                </div>
                
                {createUserAccount && (
                  <div className="ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      ℹ️ A user account will be created with a temporary password. 
                      An email with login credentials will be sent to <strong>{formData.email}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Property & Lease Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Property & Lease Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="property">Property *</Label>
              {loadingProperties ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading properties...
                </div>
              ) : (
                <Select value={formData.propertyId} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property">
                      {formData.propertyId ? getPropertyDisplay(formData.propertyId) : "Select a property"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        <div className="flex flex-col">
                          <span>{property.address}</span>
                          <span className="text-xs text-muted-foreground">
                            {[property.city, property.state].filter(Boolean).join(', ')}
                            {property.monthly_rent && ` • $${property.monthly_rent}/mo`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !leaseStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaseStartDate ? format(leaseStartDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={leaseStartDate}
                      onSelect={setLeaseStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Lease End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !leaseEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaseEndDate ? format(leaseEndDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={leaseEndDate}
                      onSelect={setLeaseEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  step="0.01"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  step="0.01"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Emergency Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  placeholder="Enter contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  placeholder="Enter contact phone"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this tenant..."
              rows={3}
            />
          </div>

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
              disabled={loading || !formData.firstName || !formData.lastName || !formData.propertyId}
              className="bg-gradient-primary hover:bg-primary-dark"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Tenant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddTenantDialog };
export default AddTenantDialog;