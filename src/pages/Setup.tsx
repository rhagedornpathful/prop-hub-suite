import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Loader2, CheckCircle, Building, User, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Setup = () => {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [createPropertyOwner, setCreatePropertyOwner] = useState(false);
  const [propertyOwnerData, setPropertyOwnerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminExists();
  }, []);

  useEffect(() => {
    // Pre-fill user data if available
    if (user?.user_metadata) {
      setPropertyOwnerData(prev => ({
        ...prev,
        firstName: user.user_metadata.first_name || '',
        lastName: user.user_metadata.last_name || ''
      }));
    }
    
    // Check profile data
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setPropertyOwnerData(prev => ({
          ...prev,
          firstName: data.first_name || prev.firstName,
          lastName: data.last_name || prev.lastName,
          phone: data.phone || '',
          companyName: data.company_name || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zip_code || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkAdminExists = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (error) throw error;
      
      const hasAdmin = (data || []).length > 0;
      setAdminExists(hasAdmin);
      
      // If admin exists, redirect to dashboard
      if (hasAdmin) {
        navigate('/', { replace: true });
        return;
      }
      
    } catch (error) {
      console.error('Error checking admin:', error);
      toast({
        title: "Error",
        description: "Failed to check system status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const claimAdminRole = async () => {
    if (!user) return;
    
    setClaiming(true);
    
    try {
      // First, make user admin
      const { data: adminData, error: adminError } = await supabase.rpc('make_me_admin');
      
      if (adminError) throw adminError;
      
      const result = adminData as { success: boolean; message: string };
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update profile with any provided information
      if (propertyOwnerData.firstName || propertyOwnerData.lastName || propertyOwnerData.phone) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            first_name: propertyOwnerData.firstName || null,
            last_name: propertyOwnerData.lastName || null,
            phone: propertyOwnerData.phone || null,
            company_name: propertyOwnerData.companyName || null,
            address: propertyOwnerData.address || null,
            city: propertyOwnerData.city || null,
            state: propertyOwnerData.state || null,
            zip_code: propertyOwnerData.zipCode || null
          });
        
        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't fail the whole process if profile update fails
        }
      }

      // If user wants to be a property owner too, create that record
      if (createPropertyOwner) {
        const { error: ownerError } = await supabase
          .from('property_owners')
          .insert({
            user_id: user.id,
            first_name: propertyOwnerData.firstName,
            last_name: propertyOwnerData.lastName,
            email: user.email || '',
            phone: propertyOwnerData.phone,
            company_name: propertyOwnerData.companyName || null,
            address: propertyOwnerData.address || null,
            city: propertyOwnerData.city || null,
            state: propertyOwnerData.state || null,
            zip_code: propertyOwnerData.zipCode || null,
            is_self: true
          });
        
        if (ownerError) {
          console.error('Property owner creation error:', ownerError);
          // Don't fail if this fails
        }
      }
      
      toast({
        title: "Setup Complete!",
        description: "You are now the system administrator. Welcome!",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload(); // Refresh to update role state
      }, 1500);
      
    } catch (error) {
      console.error('Setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Setup failed';
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Checking system status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-4" />
              <p className="text-muted-foreground">System already configured. Redirecting...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-primary" />
            System Setup
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome! You're the first user. Let's set up your admin account.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>No administrator found!</strong> As the first user, you can claim the admin role 
              to manage the system. This is a one-time setup process.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={propertyOwnerData.firstName}
                  onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={propertyOwnerData.lastName}
                  onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={propertyOwnerData.phone}
                onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createPropertyOwner"
                checked={createPropertyOwner}
                onCheckedChange={(checked) => setCreatePropertyOwner(checked as boolean)}
              />
              <div>
                <Label htmlFor="createPropertyOwner" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  I also own properties and want to manage them in this system
                </Label>
                <p className="text-xs text-muted-foreground">
                  This will create a property owner profile for you as well
                </p>
              </div>
            </div>

            {createPropertyOwner && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    value={propertyOwnerData.companyName}
                    onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name if applicable"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={propertyOwnerData.address}
                    onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your address"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={propertyOwnerData.city}
                      onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={propertyOwnerData.state}
                      onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={propertyOwnerData.zipCode}
                      onChange={(e) => setPropertyOwnerData(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Confirmation:</strong> I understand that claiming admin role will give me 
              full system access and responsibility for managing users, properties, and all system settings.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="flex-1"
              disabled={claiming}
            >
              Cancel
            </Button>
            <Button
              onClick={claimAdminRole}
              disabled={claiming}
              className="flex-1"
            >
              {claiming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Claim Admin Role
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;