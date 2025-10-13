import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const MessageRetentionSettings = () => {
  const { user } = useAuth();
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [retentionScope, setRetentionScope] = useState<'all' | 'archived'>('archived');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Store retention settings in user preferences
      const { error } = await supabase
        .from('user_inbox_settings')
        .upsert({
          user_id: user?.id,
          auto_archive_days: autoDeleteEnabled ? retentionDays : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Message retention settings have been updated"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Failed to save retention settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOldMessages = async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      let query = supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .lt('created_at', cutoffDate.toISOString())
        .is('deleted_at', null);

      // Only delete from archived conversations if scope is 'archived'
      if (retentionScope === 'archived') {
        const { data: archivedConvs } = await supabase
          .from('conversations')
          .select('id')
          .eq('is_archived', true);
        
        const archivedIds = archivedConvs?.map(c => c.id) || [];
        query = query.in('conversation_id', archivedIds);
      }

      const { error } = await query;
      if (error) throw error;

      toast({
        title: "Messages deleted",
        description: `Old messages have been removed based on retention policy`
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete old messages",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Message Retention Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Automatic Message Deletion</Label>
            <p className="text-sm text-muted-foreground">
              Automatically delete old messages based on retention policy
            </p>
          </div>
          <Switch 
            checked={autoDeleteEnabled} 
            onCheckedChange={setAutoDeleteEnabled} 
          />
        </div>

        {autoDeleteEnabled && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="retention-days">Retention Period</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="retention-days"
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Messages older than {retentionDays} days will be automatically deleted
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-scope">Retention Scope</Label>
              <Select value={retentionScope} onValueChange={(v) => setRetentionScope(v as any)}>
                <SelectTrigger id="retention-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="archived">Archived conversations only</SelectItem>
                  <SelectItem value="all">All conversations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Deleted messages cannot be recovered. 
                Make sure to export important conversations before enabling auto-deletion.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          {autoDeleteEnabled && (
            <Button 
              variant="destructive"
              onClick={handleDeleteOldMessages}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Old Messages Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
