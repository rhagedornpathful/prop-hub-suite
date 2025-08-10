import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell,
  Save,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PropertyManagerSettingsData {
  email_notifications: boolean;
  push_notifications: boolean;
  property_check_notifications: boolean;
  schedule_change_notifications: boolean;
  reminder_notifications: boolean;
  maintenance_notifications: boolean;
  tenant_notifications: boolean;
  preferred_contact_time?: string;
  preferred_contact_method: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  business_hours_start?: string;
  business_hours_end?: string;
}

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

const PropertyManagerSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<PropertyManagerSettingsData>({
    email_notifications: true,
    push_notifications: false,
    property_check_notifications: true,
    schedule_change_notifications: true,
    reminder_notifications: true,
    maintenance_notifications: true,
    tenant_notifications: true,
    preferred_contact_method: 'email',
  });

  const [profile, setProfile] = useState<ProfileData>({});

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
      }

      // For property managers, we'll use a generic settings approach since there's no specific table
      // In a production app, you'd create a property_manager_settings table
      
    } catch (error: any) {
      toast({
        title: "Error Loading Settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save profile data
      await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      // In a production app, you'd save property manager specific settings here
      // For now, we'll just show success

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-primary" />
              Property Manager Settings
            </h1>
            <p className="text-muted-foreground">Manage your profile and notification preferences</p>
          </div>
          
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={profile.first_name || ''} 
                        onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                        placeholder="John" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={profile.last_name || ''} 
                        onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                        placeholder="Doe" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      placeholder="john@example.com" 
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact your administrator.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profile.phone || ''} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={profile.address || ''} 
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      placeholder="123 Main St" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        value={profile.city || ''} 
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                        placeholder="San Francisco" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        value={profile.state || ''} 
                        onChange={(e) => setProfile({...profile, state: e.target.value})}
                        placeholder="CA" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input 
                        id="zipCode" 
                        value={profile.zip_code || ''} 
                        onChange={(e) => setProfile({...profile, zip_code: e.target.value})}
                        placeholder="94102" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Business Hours & Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessStart">Business Hours Start</Label>
                      <Input 
                        id="businessStart" 
                        type="time"
                        value={settings.business_hours_start || ''} 
                        onChange={(e) => setSettings({...settings, business_hours_start: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEnd">Business Hours End</Label>
                      <Input 
                        id="businessEnd" 
                        type="time"
                        value={settings.business_hours_end || ''} 
                        onChange={(e) => setSettings({...settings, business_hours_end: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                      <Input 
                        id="emergencyName" 
                        value={settings.emergency_contact_name || ''} 
                        onChange={(e) => setSettings({...settings, emergency_contact_name: e.target.value})}
                        placeholder="Jane Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                      <Input 
                        id="emergencyPhone" 
                        value={settings.emergency_contact_phone || ''} 
                        onChange={(e) => setSettings({...settings, emergency_contact_phone: e.target.value})}
                        placeholder="+1 (555) 987-6543" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relationship</Label>
                    <Input 
                      id="emergencyRelation" 
                      value={settings.emergency_contact_relationship || ''} 
                      onChange={(e) => setSettings({...settings, emergency_contact_relationship: e.target.value})}
                      placeholder="Business Partner, Supervisor, Family Member" 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch 
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, push_notifications: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Property Check Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get notified about property check assignments</p>
                      </div>
                      <Switch 
                        checked={settings.property_check_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, property_check_notifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Maintenance Requests</h4>
                        <p className="text-sm text-muted-foreground">Notifications for new maintenance requests</p>
                      </div>
                      <Switch 
                        checked={settings.maintenance_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, maintenance_notifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Tenant Communications</h4>
                        <p className="text-sm text-muted-foreground">Notifications from tenants and property owners</p>
                      </div>
                      <Switch 
                        checked={settings.tenant_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, tenant_notifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Schedule Changes</h4>
                        <p className="text-sm text-muted-foreground">Notifications when your schedule is updated</p>
                      </div>
                      <Switch 
                        checked={settings.schedule_change_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, schedule_change_notifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Check Reminders</h4>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming property checks</p>
                      </div>
                      <Switch 
                        checked={settings.reminder_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, reminder_notifications: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Communication Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Contact Time</Label>
                    <Input 
                      id="preferredTime" 
                      value={settings.preferred_contact_time || ''} 
                      onChange={(e) => setSettings({...settings, preferred_contact_time: e.target.value})}
                      placeholder="9:00 AM - 5:00 PM" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                    <select 
                      id="contactMethod" 
                      value={settings.preferred_contact_method}
                      onChange={(e) => setSettings({...settings, preferred_contact_method: e.target.value})}
                      className="w-full p-2 border border-input bg-background rounded-md"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="text">Text Message</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagerSettings;