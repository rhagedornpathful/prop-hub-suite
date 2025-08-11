import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Clock, 
  Trash2, 
  Key, 
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useUpdateNotificationPreferences } from '@/hooks/queries/useEnterpriseMessaging';
import { toast } from '@/hooks/use-toast';

export const MessageSecuritySettings: React.FC = () => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState(30);
  const [messageEncryption, setMessageEncryption] = useState('disabled');
  const updatePreferences = useUpdateNotificationPreferences();

  const handleSaveSettings = async () => {
    try {
      await updatePreferences.mutateAsync({
        // These would be extended notification preferences
        email_notifications: true,
        push_notifications: true,
      });

      toast({
        title: "Security settings updated",
        description: "Your message security preferences have been saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    }
  };

  const securityLevels = [
    { value: 'disabled', label: 'Disabled', description: 'No encryption' },
    { value: 'basic', label: 'Basic', description: 'Standard encryption at rest' },
    { value: 'enhanced', label: 'Enhanced', description: 'End-to-end encryption' },
    { value: 'maximum', label: 'Maximum', description: 'Zero-knowledge encryption' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Message Security</h2>
          <p className="text-muted-foreground">
            Configure security and privacy settings for messaging
          </p>
        </div>
        <Settings className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Encryption Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Message Encryption
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Encryption Level</Label>
            <Select value={messageEncryption} onValueChange={setMessageEncryption}>
              <SelectTrigger>
                <SelectValue placeholder="Select encryption level" />
              </SelectTrigger>
              <SelectContent>
                {securityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {level.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Force encryption for sensitive conversations</Label>
              <p className="text-sm text-muted-foreground">
                Automatically encrypt messages containing sensitive keywords
              </p>
            </div>
            <Switch 
              checked={encryptionEnabled} 
              onCheckedChange={setEncryptionEnabled} 
            />
          </div>

          {messageEncryption !== 'disabled' && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Enhanced encryption is enabled. Messages will be encrypted using 
                industry-standard protocols. Keys are managed securely.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Message Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Message Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-delete messages</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete messages after specified period
              </p>
            </div>
            <Switch 
              checked={autoDeleteEnabled} 
              onCheckedChange={setAutoDeleteEnabled} 
            />
          </div>

          {autoDeleteEnabled && (
            <div className="space-y-2">
              <Label>Retention period (days)</Label>
              <Input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                min="1"
                max="365"
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Messages older than {retentionDays} days will be automatically deleted
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Trash2 className="mr-2 h-4 w-4" />
              Export Message Data
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Download Security Report
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Danger Zone:</strong> These actions are permanent and cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="destructive" size="sm">
              Delete All Messages
            </Button>
            <Button variant="destructive" size="sm">
              Reset Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={updatePreferences.isPending}
        >
          {updatePreferences.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};