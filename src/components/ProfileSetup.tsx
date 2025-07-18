import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const ProfileSetup = () => {
  const { profile, roles, updateProfile, loading } = useUserProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateProfile(formData);
    
    if (result?.success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  const roleLabels = {
    admin: 'Administrator',
    property_manager: 'Property Manager',
    house_watcher: 'House Watcher',
    client: 'Client',
    contractor: 'Contractor',
    tenant: 'Tenant',
    owner_investor: 'Owner/Investor',
    leasing_agent: 'Leasing Agent',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Setup</CardTitle>
          <CardDescription>
            Complete your profile information and view your current roles.
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Current Roles</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {roles.map((role) => (
              <Badge key={role} variant="secondary">
                {roleLabels[role]}
              </Badge>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter your company name (optional)"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                placeholder="ZIP Code"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};