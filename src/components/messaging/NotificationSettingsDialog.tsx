import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationSettingsDialog = ({ open, onOpenChange }: NotificationSettingsDialogProps) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('daily');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'High Priority Messages',
      condition: 'importance = high',
      action: 'immediate_push',
      enabled: true
    },
    {
      id: '2',
      name: 'Mentions',
      condition: 'mentioned = true',
      action: 'immediate_email',
      enabled: true
    },
    {
      id: '3',
      name: 'Maintenance Requests',
      condition: 'type = maintenance',
      action: 'immediate_push',
      enabled: true
    },
    {
      id: '4',
      name: 'After Hours Messages',
      condition: 'time > 18:00',
      action: 'digest_only',
      enabled: false
    }
  ]);

  const toggleRule = (id: string) => {
    setNotificationRules(rules =>
      rules.map(rule =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Basic Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label>Push Notifications</Label>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Digest Email Frequency</Label>
                <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Quiet Hours
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Quiet Hours</Label>
                <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
              </div>

              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <Label className="text-sm">Start Time</Label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Time</Label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Custom Rules */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Custom Notification Rules</h3>
            <div className="space-y-3">
              {notificationRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rule.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rule.condition} → {rule.action.replace('_', ' ')}
                    </div>
                  </div>
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Smart Prioritization */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Smart Prioritization</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="learn-patterns" defaultChecked />
                <Label htmlFor="learn-patterns" className="text-sm">
                  Learn from my notification patterns
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-mute" defaultChecked />
                <Label htmlFor="auto-mute" className="text-sm">
                  Auto-mute low-priority conversations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="group-notifications" defaultChecked />
                <Label htmlFor="group-notifications" className="text-sm">
                  Group similar notifications
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
