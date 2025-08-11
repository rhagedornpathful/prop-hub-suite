import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Loader2,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string; // This is the profile.id
  user_id: string; // This is the auth.users.id - we need to use this for foreign key
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
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
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
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    company_name: ''
  });
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || '');
  const [propertyCount, setPropertyCount] = useState(0);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user && open) {
      console.log('UserDetailsDialog: Loading data for user:', user.email, user.id);
      setSelectedRole(user.role || '');
      // Load complete user profile data from database
      loadUserProfile();
      // Load additional role-specific data
      loadAdditionalData();
    }
  }, [user, open]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      console.log('UserDetailsDialog: Fetching profile for user ID:', user.id);
      
      // Fetch complete profile data from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.user_id) // Use user.user_id instead of user.id
        .single();

      console.log('UserDetailsDialog: Profile query result:', { profile, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user profile:', error);
        // Continue with fallback data
      }

      // Set profile data, using existing user data as fallback or empty strings
      const profileData = {
        first_name: profile?.first_name || user.first_name || '',
        last_name: profile?.last_name || user.last_name || '',
        email: user.email || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || '',
        company_name: profile?.company_name || ''
      };

      console.log('UserDetailsDialog: Setting profile data:', profileData);
      setProfileData(profileData);

      // If no profile exists, create one with basic info
      if (error?.code === 'PGRST116' && (user.first_name || user.last_name)) {
        console.log('UserDetailsDialog: No profile found, creating basic profile');
        await supabase
          .from('profiles')
          .insert({
            user_id: user.user_id, // Use user.user_id instead of user.id
            first_name: user.first_name,
            last_name: user.last_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set data from user object as fallback
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        company_name: ''
      });
    }
  };

  const loadAdditionalData = async () => {
    if (!user) return;

    try {
      // Reset state
      setPropertyCount(0);
      setTenantInfo(null);

      // Load property count for property owners
      if (user.role === 'owner_investor' || user.role === 'property_owner') {
        // First try to get properties directly owned by user
        const { data: userProperties, error: userPropError } = await supabase
          .from('properties')
          .select('id')
          .eq('user_id', user.id);

        // Then try to get properties through property_owners table
        const { data: ownerProperties, error: ownerPropError } = await supabase
          .from('properties')
          .select('id')
          .in('owner_id', 
            await supabase
              .from('property_owners')
              .select('id')
              .eq('user_id', user.id)
              .then(({ data }) => data?.map(owner => owner.id) || [])
          );

        const totalProperties = new Set([
          ...(userProperties || []).map(p => p.id),
          ...(ownerProperties || []).map(p => p.id)
        ]);
        
        setPropertyCount(totalProperties.size);
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
          .maybeSingle();
        
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
      console.log('UserDetailsDialog: Saving profile data:', profileData);
      console.log('UserDetailsDialog: Saving role:', selectedRole);

      // 1. Update profile data in profiles table
      const { data: profileUpdateData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.user_id, // Use user.user_id instead of user.id
          first_name: profileData.first_name || null,
          last_name: profileData.last_name || null,
          phone: profileData.phone || null,
          address: profileData.address || null,
          city: profileData.city || null,
          state: profileData.state || null,
          zip_code: profileData.zip_code || null,
          company_name: profileData.company_name || null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (profileError) {
        console.error('Error saving profile:', profileError);
        throw profileError;
      }

      // 2. Update role if it has changed
      if (selectedRole && selectedRole !== user.role) {
        console.log('UserDetailsDialog: Updating role from', user.role, 'to', selectedRole);
        
        // Delete existing role
        if (user.role) {
          const { error: deleteRoleError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', user.user_id); // Use user.user_id instead of user.id
          
          if (deleteRoleError) {
            console.error('Error deleting old role:', deleteRoleError);
            // Continue anyway, the upsert below should handle it
          }
        }

        // Insert new role using proper typing
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.user_id, // Use user.user_id instead of user.id
            role: selectedRole as any, // Type assertion to handle enum conversion
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (roleError) {
          console.error('Error updating role:', roleError);
          throw roleError;
        }
      }

      // 3. Update email if it has changed (using admin function)
      if (profileData.email && profileData.email !== user.email) {
        console.log('UserDetailsDialog: Updating email from', user.email, 'to', profileData.email);
        
        try {
          const { error: emailError } = await supabase.functions.invoke('update-user-email', {
            body: {
              userId: user.user_id, // Use user.user_id instead of user.id
              newEmail: profileData.email
            }
          });

          if (emailError) {
            console.error('Error updating email:', emailError);
            // Don't throw - email update might fail but other updates succeeded
            toast({
              title: "Partial Update",
              description: "Profile and role updated, but email update failed. You may need admin privileges to change emails.",
              variant: "destructive"
            });
          }
        } catch (emailErr) {
          console.error('Email update function call failed:', emailErr);
          // Don't throw - continue with success message for other updates
        }
      }

      toast({
        title: "Profile Updated",
        description: "User profile has been successfully updated",
      });

      setEditing(false);
      onUserUpdate(); // Refresh the user list
    } catch (error: any) {
      console.error('Error updating profile:', error);
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

  const handlePasswordReset = async (resetType: 'reset_link' | 'set_password') => {
    if (!user) return;

    // Check if user has a valid auth account
    if (!user.email) {
      toast({
        title: "Reset Failed",
        description: "This user doesn't have an email address associated with their account",
        variant: "destructive"
      });
      return;
    }

    setPasswordResetLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: user.email, // Always use email for both reset types
          resetType,
          newPassword: resetType === 'set_password' ? newPassword : undefined
        }
      });

      if (error) throw error;

      toast({
        title: resetType === 'reset_link' ? "Reset Link Sent" : "Password Updated",
        description: resetType === 'reset_link' 
          ? "Password reset link has been sent to the user's email" 
          : "User password has been successfully updated",
      });

      setShowPasswordResetDialog(false);
      setNewPassword('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = "Failed to reset password";
      
      if (error.message?.includes('User not found')) {
        errorMessage = "This user doesn't have an account in the system yet. Please create an account for them first.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
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
              <p className="text-sm text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Profile Information
                  {editing && <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Editing</span>}
                </CardTitle>
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
                {/* Email and Role Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {editing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profileData.email || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    {editing ? (
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="property_manager">Property Manager</SelectItem>
                          <SelectItem value="owner_investor">Property Owner/Investor</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="house_watcher">House Watcher</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="leasing_agent">Leasing Agent</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">
                        <Badge className={getRoleBadgeColor(selectedRole)}>
                          {formatRoleName(selectedRole)}
                        </Badge>
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
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

            {/* Password Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Password Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Reset or change the user's password
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handlePasswordReset('reset_link')}
                    disabled={passwordResetLoading}
                  >
                    {passwordResetLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Reset Link
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowPasswordResetDialog(true)}
                    disabled={passwordResetLoading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Set New Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>

      {/* Password Reset Dialog */}
      <AlertDialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Set New Password
            </AlertDialogTitle>
            <AlertDialogDescription>
              Set a new password for {user?.first_name} {user?.last_name}. 
              The user will be able to sign in immediately with this new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password">New Password</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateRandomPassword}
                title="Generate random password"
              >
                <KeyRound className="h-4 w-4" />
              </Button>
            </div>
            {newPassword && (
              <p className="text-xs text-muted-foreground mt-2">
                Password length: {newPassword.length} characters
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handlePasswordReset('set_password')}
              disabled={!newPassword.trim() || passwordResetLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {passwordResetLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Set Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}