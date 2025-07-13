import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Home,
  Building2,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  user_created_at: string;
  role_created_at: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  company_name?: string | null;
}

interface UserDetailsDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: () => void;
}

export function UserDetailsDialog({ user, open, onOpenChange, onUserUpdate }: UserDetailsDialogProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    company_name: ''
  });
  const [propertyCount, setPropertyCount] = useState(0);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user && open) {
      // Load user profile data
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        company_name: user.company_name || ''
      });
      
      // Load additional role-specific data
      loadAdditionalData();
    }
  }, [user, open]);

  const loadAdditionalData = async () => {
    if (!user) return;

    try {
      // Load property count for property owners
      if (user.role === 'owner_investor' || user.role === 'property_owner') {
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .or(`user_id.eq.${user.id},owner_id.in.(select id from property_owners where user_id.eq.${user.id})`);
        
        if (!propError) {
          setPropertyCount(properties?.length || 0);
        }
      }

      // Load tenant information
      if (user.role === 'tenant') {
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select(`
            *,
            properties!inner(address, city, state)
          `)
          .eq('user_account_id', user.id)
          .single();
        
        if (!tenantError && tenant) {
          setTenantInfo(tenant);
        }
      }
    } catch (error) {
      console.error('Error loading additional user data:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update profile data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "User profile has been successfully updated",
      });

      setEditing(false);
      onUserUpdate();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatRoleName = (role: string | null) => {
    if (!role) return 'No Role';
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'property_owner': 
      case 'owner_investor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tenant': return 'bg-green-100 text-green-800 border-green-200';
      case 'house_watcher': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {user.first_name && user.last_name 
                ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                : <User className="h-6 w-6" />
              }
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : 'No Name Set'
                }
              </h2>
              <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditing(false)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    {editing ? (
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.first_name || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    {editing ? (
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.last_name || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.phone || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    {editing ? (
                      <Input
                        id="company_name"
                        value={profileData.company_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.company_name || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  {editing ? (
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profileData.address || 'Not set'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    {editing ? (
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.city || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    {editing ? (
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.state || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    {editing ? (
                      <Input
                        id="zip_code"
                        value={profileData.zip_code}
                        onChange={(e) => setProfileData(prev => ({ ...prev, zip_code: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.zip_code || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific information */}
            {(user.role === 'owner_investor' || user.role === 'property_owner') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Property Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{propertyCount}</div>
                      <div className="text-sm text-muted-foreground">Properties</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === 'tenant' && tenantInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Lease Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Property Address</Label>
                    <p className="text-sm">{tenantInfo.properties?.address}, {tenantInfo.properties?.city}, {tenantInfo.properties?.state}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Lease Start</Label>
                      <p className="text-sm">{tenantInfo.lease_start_date ? formatDate(tenantInfo.lease_start_date) : 'Not set'}</p>
                    </div>
                    <div>
                      <Label>Lease End</Label>
                      <p className="text-sm">{tenantInfo.lease_end_date ? formatDate(tenantInfo.lease_end_date) : 'Not set'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monthly Rent</Label>
                      <p className="text-sm">${tenantInfo.monthly_rent || 'Not set'}</p>
                    </div>
                    <div>
                      <Label>Security Deposit</Label>
                      <p className="text-sm">${tenantInfo.security_deposit || 'Not set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Account Information Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Role</div>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {formatRoleName(user.role)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(user.user_created_at)}
                    </div>
                  </div>
                </div>

                {user.role_created_at && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Role Assigned</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.role_created_at)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}