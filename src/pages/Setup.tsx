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
import { Crown, Loader2, CheckCircle, Building, User, Shield, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Setup = () => {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [createPropertyOwner, setCreatePropertyOwner] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Redirect to auth if not logged in
      navigate('/auth', { replace: true });
      return;
    }
    
    checkAdminExists();
  }, [user, navigate]);

  useEffect(() => {
    // Pre-fill user data from auth
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Basic email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
        toast({
          title: "Setup Complete",
          description: "System administrator already exists. Redirecting to dashboard...",
        });
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
    if (!user) {
      toast({
        title: "Error",
        description: "User not logged in. Please log in and try again.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setClaiming(true);
    
    try {
      // First, verify current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Insert admin role directly into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: currentUser.id,
          role: 'admin',
          assigned_by: currentUser.id
        });

      if (roleError) {
        if (roleError.code === '23505') { // Unique constraint violation
          throw new Error('You already have a role assigned. Please contact support.');
        }
        throw roleError;
      }

      // Update user profile with form data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUser.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          company_name: formData.companyName || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
        });
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't fail the whole process if profile update fails
      }

      // If user wants to be a property owner too, create that record
      if (createPropertyOwner) {
        const { error: ownerError } = await supabase
          .from('property_owners')
          .insert({
            user_id: currentUser.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.companyName || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip_code: formData.zipCode || null,
            is_self: true
          });
        
        if (ownerError) {
          console.error('Property owner creation error:', ownerError);
          // Don't fail if this fails, just warn
          toast({
            title: "Warning",
            description: "Admin role created but property owner profile failed. You can add this later.",
            variant: "default"
          });
        }
      }
      
      toast({
        title: "Setup Complete!",
        description: "You are now the system administrator. Redirecting to dashboard...",
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload(); // Refresh to update role state
      }, 2000);
      
    } catch (error) {
      console.error('Setup error:', error);
      let errorMessage = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
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

  if (!user) {
    return null; // Will redirect to auth
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No administrator found!</strong> As the first user, you can claim the admin role 
              to manage the system. This is a one-time setup process.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyName">Company/Organization Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name (optional)"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address (optional)"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="ZIP"
                />
              </div>
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
                <Alert>
                  <Building className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    A property owner profile will be created using the information above. 
                    You can manage your properties and also have full admin access.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Confirmation:</strong> I understand that claiming admin role will give me 
              full system access and responsibility for managing users, properties, and all system settings.
              Fields marked with * are required.
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