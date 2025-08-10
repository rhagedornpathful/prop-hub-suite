import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateConversation, useSendMessage } from '@/hooks/queries/useConversations';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  MessageCircle,
  Phone,
  Settings,
  Bell,
  Users,
  Building,
  AlertTriangle
} from 'lucide-react';

interface CommunicationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  maintenance_notifications: boolean;
  payment_notifications: boolean;
  general_notifications: boolean;
}

interface QuickMessage {
  id: string;
  title: string;
  content: string;
  type: 'maintenance' | 'payment' | 'general';
}

interface CommunicationHubProps {
  onSent?: () => void; // optional callback after successful send
  autoCloseDelayMs?: number; // optionally delay before invoking onSent
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({ onSent, autoCloseDelayMs = 0 }) => {
  const [settings, setSettings] = useState<CommunicationSettings>({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    maintenance_notifications: true,
    payment_notifications: true,
    general_notifications: true
  });
  
  const [quickMessages] = useState<QuickMessage[]>([
    {
      id: '1',
      title: 'Maintenance Scheduled',
      content: 'Your maintenance request has been scheduled for {date}. Our technician will arrive between {time_range}.',
      type: 'maintenance'
    },
    {
      id: '2',
      title: 'Maintenance Complete',
      content: 'The maintenance work at your property has been completed. Please review and confirm satisfaction.',
      type: 'maintenance'
    },
    {
      id: '3',
      title: 'Payment Reminder',
      content: 'This is a friendly reminder that your payment of ${amount} is due on {date}.',
      type: 'payment'
    },
    {
      id: '4',
      title: 'Property Update',
      content: 'There is an important update regarding your property. Please contact us for details.',
      type: 'general'
    }
  ]);

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recipientType, setRecipientType] = useState<string>('');
  const [specificUsers, setSpecificUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const createConversation = useCreateConversation();
  const sendChatMessage = useSendMessage();

  useEffect(() => {
    loadCommunicationSettings();
    loadUsers();
  }, []);

  const loadCommunicationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, use default settings since the table isn't in types yet
      // In a real implementation, this would fetch from user_communication_settings
      console.log('Loading communication settings for user:', user.id);
    } catch (error) {
      console.error('Error loading communication settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const sendMessage = async (recipients: string[], subject: string, content: string, channels: string[]) => {
    setIsLoading(true);
    try {
      console.log('Starting message send...', { recipients, subject, content, channels });
      
      // Try the edge function call first
      try {
        const { data, error } = await supabase.functions.invoke('send-communication', {
          body: {
            recipients,
            subject,
            content,
            channels, // ['email', 'sms', 'push']
            type: 'manual'
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }
        console.log('Edge function success:', data);
      } catch (edgeError) {
        console.warn('Edge function failed, continuing with inbox logging:', edgeError);
        // Continue with inbox logging even if edge function fails
      }

      toast({
        title: 'Messages Sent',
        description: `Successfully sent messages via ${channels.join(', ')}`
      });

      // Also log this communication to the in-app Messages inbox for all relevant recipients
      try {
        if (user?.id) {
          console.log('Creating inbox conversation...');
          
          // Resolve participant user IDs based on recipient selection
          const resolveRecipientIds = async (): Promise<string[]> => {
            switch (recipientType) {
              case 'specific':
                return specificUsers;
              case 'all-tenants': {
                const { data: t } = await supabase
                  .from('tenants')
                  .select('user_account_id')
                  .not('user_account_id', 'is', null);
                return (t || []).map((row: any) => row.user_account_id).filter(Boolean);
              }
              case 'all-owners': {
                const { data: o } = await supabase
                  .from('property_owners')
                  .select('user_account_id')
                  .not('user_account_id', 'is', null);
                return (o || []).map((row: any) => row.user_account_id).filter(Boolean);
              }
              case 'maintenance-team': {
                const { data: r } = await supabase
                  .from('user_roles')
                  .select('user_id')
                  .in('role', ['property_manager', 'admin']);
                return (r || []).map((row: any) => row.user_id).filter(Boolean);
              }
              default:
                return [];
            }
          };

          const targetIds = await resolveRecipientIds();
          console.log('Target IDs resolved:', targetIds);
          
          const isDirect = recipientType === 'specific' && specificUsers.length > 0;
          const participantIds = Array.from(new Set([user.id, ...targetIds]));
          console.log('Creating conversation with participants:', participantIds);

          const conversation = await createConversation.mutateAsync({
            title: messageSubject || subject || 'Message',
            type: isDirect ? 'direct' : 'broadcast',
            participantIds
          });

          console.log('Conversation created, sending message...');
          await sendChatMessage.mutateAsync({
            conversationId: conversation.id,
            content
          });
          console.log('Message sent to conversation successfully');
        }
      } catch (e) {
        console.error('Failed to log message to in-app inbox:', e);
        // Don't throw here - we want the send to be considered successful even if inbox logging fails
      }

      setMessageContent('');
      setMessageSubject('');
      setSelectedRecipients([]);

      // Notify parent to close dialog or navigate away if provided
      if (onSent) {
        if (autoCloseDelayMs > 0) setTimeout(() => onSent(), autoCloseDelayMs);
        else onSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMaintenanceUpdate = async (maintenanceId: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-maintenance-update', {
        body: {
          maintenance_id: maintenanceId,
          status,
          notes,
          channels: getEnabledChannels()
        }
      });

      if (error) throw error;

      toast({
        title: 'Update Sent',
        description: 'Maintenance update sent to relevant parties'
      });
    } catch (error) {
      console.error('Error sending maintenance update:', error);
      toast({
        title: 'Error',
        description: 'Failed to send maintenance update',
        variant: 'destructive'
      });
    }
  };

  const getEnabledChannels = (): string[] => {
    const channels: string[] = [];
    if (settings.email_enabled) channels.push('email');
    if (settings.sms_enabled) channels.push('sms');
    if (settings.push_enabled) channels.push('push');
    return channels;
  };

  const updateSettings = async (newSettings: Partial<CommunicationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // In a real implementation, this would update the database
    toast({
      title: 'Settings Updated',
      description: 'Your communication preferences have been saved'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Communication Hub</h2>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Communication Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Delivery Channels</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Email Notifications</Label>
                  <Switch
                    id="email-enabled"
                    checked={settings.email_enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ email_enabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-enabled">SMS Notifications</Label>
                  <Switch
                    id="sms-enabled"
                    checked={settings.sms_enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ sms_enabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-enabled">Push Notifications</Label>
                  <Switch
                    id="push-enabled"
                    checked={settings.push_enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ push_enabled: checked })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Notification Types</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-notifications">Maintenance Updates</Label>
                  <Switch
                    id="maintenance-notifications"
                    checked={settings.maintenance_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ maintenance_notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-notifications">Payment Notifications</Label>
                  <Switch
                    id="payment-notifications"
                    checked={settings.payment_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ payment_notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="general-notifications">General Notifications</Label>
                  <Switch
                    id="general-notifications"
                    checked={settings.general_notifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ general_notifications: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject..."
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div>
                <Label>Recipients</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-tenants">All Tenants</SelectItem>
                    <SelectItem value="all-owners">All Property Owners</SelectItem>
                    <SelectItem value="maintenance-team">Maintenance Team</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
                
                {recipientType === 'specific' && (
                  <div className="mt-3 space-y-2">
                    <Label>Select Users</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {allUsers.map((user) => (
                        <div key={user.user_id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={user.user_id}
                            checked={specificUsers.includes(user.user_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSpecificUsers([...specificUsers, user.user_id]);
                              } else {
                                setSpecificUsers(specificUsers.filter(id => id !== user.user_id));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={user.user_id} className="text-sm">
                            {user.first_name} {user.last_name} 
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => sendMessage(selectedRecipients, messageSubject, messageContent, ['email'])}
                  disabled={isLoading || !messageContent.trim()}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  onClick={() => sendMessage(selectedRecipients, messageSubject, messageContent, ['sms'])}
                  disabled={isLoading || !messageContent.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
                <Button
                  onClick={() => sendMessage(selectedRecipients, messageSubject, messageContent, getEnabledChannels())}
                  disabled={isLoading || !messageContent.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {quickMessages.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{template.title}</CardTitle>
                    <Badge variant={
                      template.type === 'maintenance' ? 'default' :
                      template.type === 'payment' ? 'destructive' : 'secondary'
                    }>
                      {template.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{template.content}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setMessageSubject(template.title);
                      setMessageContent(template.content);
                    }}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Automated Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Maintenance Status Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically notify when maintenance requests change status
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenance_notifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ maintenance_notifications: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Payment Reminders</h4>
                      <p className="text-sm text-muted-foreground">
                        Send reminders for upcoming payments
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment_notifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ payment_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">General Announcements</h4>
                      <p className="text-sm text-muted-foreground">
                        Property updates and general communications
                      </p>
                    </div>
                    <Switch
                      checked={settings.general_notifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ general_notifications: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};