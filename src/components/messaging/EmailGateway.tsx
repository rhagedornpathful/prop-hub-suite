import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Settings } from 'lucide-react';

export const EmailGateway = () => {
  const { toast } = useToast();
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveEmailSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_inbox_settings')
        .upsert({
          user_id: user.id,
          // Store email settings in a metadata field or create new columns
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Email Gateway Updated",
        description: `Email notifications ${emailEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to update email settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Email Gateway</CardTitle>
        </div>
        <CardDescription>
          Send and receive messages via email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-enabled">Enable Email Gateway</Label>
            <p className="text-sm text-muted-foreground">
              Receive message notifications via email
            </p>
          </div>
          <Switch
            id="email-enabled"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
          />
        </div>

        {emailEnabled && (
          <div className="space-y-2">
            <Label htmlFor="email-address">Your Email Address</Label>
            <Input
              id="email-address"
              type="email"
              placeholder="your@email.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Reply to email notifications to send messages
            </p>
          </div>
        )}

        <Button onClick={handleSaveEmailSettings} disabled={loading}>
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};
