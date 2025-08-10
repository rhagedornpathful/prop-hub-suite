import { useState } from "react";
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

const HouseWatcherSettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    homeChecks: true,
    scheduleChanges: true,
    reminders: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your profile and notification preferences</p>
          </div>
          
          <Button onClick={handleSave} className="bg-gradient-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
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
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us about your house watching experience..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                      <Input id="emergencyName" placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                      <Input id="emergencyPhone" placeholder="+1 (555) 987-6543" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relationship</Label>
                    <Input id="emergencyRelation" placeholder="Spouse, Family Member, Friend" />
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
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch 
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Home Check Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get notified about new home check assignments</p>
                      </div>
                      <Switch 
                        checked={notifications.homeChecks}
                        onCheckedChange={(checked) => setNotifications({...notifications, homeChecks: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Schedule Changes</h4>
                        <p className="text-sm text-muted-foreground">Notifications when your schedule is updated</p>
                      </div>
                      <Switch 
                        checked={notifications.scheduleChanges}
                        onCheckedChange={(checked) => setNotifications({...notifications, scheduleChanges: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Check Reminders</h4>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming property checks</p>
                      </div>
                      <Switch 
                        checked={notifications.reminders}
                        onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
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
                    <Input id="preferredTime" placeholder="9:00 AM - 5:00 PM" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                    <select 
                      id="contactMethod" 
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

export default HouseWatcherSettings;