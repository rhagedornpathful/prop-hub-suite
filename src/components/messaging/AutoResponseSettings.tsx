import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';

export const AutoResponseSettings = () => {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_inbox_settings')
        .select('auto_respond_enabled, auto_respond_message')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setEnabled(data.auto_respond_enabled || false);
        setMessage(data.auto_respond_message || '');
      }
    } catch (error) {
      console.error('Error loading auto-response settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_inbox_settings')
        .upsert({
          user_id: user.id,
          auto_respond_enabled: enabled,
          auto_respond_message: message,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Auto-Response Updated",
        description: `Auto-responses ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error saving auto-response settings:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-response settings",
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
          <MessageSquare className="h-5 w-5" />
          <CardTitle>Auto-Response</CardTitle>
        </div>
        <CardDescription>
          Automatically respond to new messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-respond-enabled">Enable Auto-Response</Label>
            <p className="text-sm text-muted-foreground">
              Send automatic replies to new messages
            </p>
          </div>
          <Switch
            id="auto-respond-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label htmlFor="auto-respond-message">Auto-Response Message</Label>
            <Textarea
              id="auto-respond-message"
              placeholder="Thank you for your message. I'll get back to you soon..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        )}

        <Button onClick={handleSave} disabled={loading}>
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};
