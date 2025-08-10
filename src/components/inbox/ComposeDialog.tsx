import React, { useState, useEffect } from 'react';
import { X, Send, Paperclip, Users, Building, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/queries/useProfiles';
import { useProperties } from '@/hooks/queries/useProperties';
import { useUserRole } from '@/hooks/useUserRole';
import { useCreateInboxConversation } from '@/hooks/queries/useInbox';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    conversationId: string;
    subject: string;
  };
}

export const ComposeDialog: React.FC<ComposeDialogProps> = ({
  open,
  onOpenChange,
  replyTo
}) => {
  const { user } = useAuth();
  const { isAdmin, isPropertyManager } = useUserRole();
  const { data: profiles = [] } = useProfiles();
  const { data: propertiesData } = useProperties();
  
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [messageType, setMessageType] = useState<'general' | 'maintenance' | 'property'>('general');
  const [relatedProperty, setRelatedProperty] = useState<string>('');
  const [recipientType, setRecipientType] = useState<'individual' | 'group'>('individual');
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const createConversation = useCreateInboxConversation();

  useEffect(() => {
    if (replyTo) {
      setSubject(`Re: ${replyTo.subject}`);
    }
  }, [replyTo]);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setRecipients([]);
      setSubject('');
      setContent('');
      setPriority('normal');
      setMessageType('general');
      setRelatedProperty('');
      setRecipientType('individual');
      setSelectedGroup('');
    }
  }, [open]);

  const isAdminUser = isAdmin();
  const isPropertyManagerUser = isPropertyManager();
  const properties = Array.isArray(propertiesData) ? propertiesData : (propertiesData?.properties || []);

  const groupOptions = [
    { value: 'all-tenants', label: 'All Tenants', icon: Users },
    { value: 'all-owners', label: 'All Property Owners', icon: Building },
    { value: 'maintenance-team', label: 'Maintenance Team', icon: AlertTriangle },
  ];

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;

    try {
      let participantIds: string[] = [];

      if (recipientType === 'individual') {
        participantIds = recipients;
      } else {
        // Handle group messaging logic here
        // This would need to be implemented based on your specific requirements
        switch (selectedGroup) {
          case 'all-tenants':
            // Get all tenant user IDs
            break;
          case 'all-owners':
            // Get all owner user IDs  
            break;
          case 'maintenance-team':
            // Get all maintenance team user IDs
            break;
        }
      }

      await createConversation.mutateAsync({
        title: subject,
        type: messageType,
        priority,
        content,
        participantIds,
        propertyId: relatedProperty || undefined
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'property':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-lg font-semibold">
            {replyTo ? 'Reply' : 'Compose Message'}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Message Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="property">Property Related</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Recipients</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="individual"
                  checked={recipientType === 'individual'}
                  onCheckedChange={() => setRecipientType('individual')}
                />
                <Label htmlFor="individual">Individual</Label>
              </div>
              {(isAdminUser || isPropertyManagerUser) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="group"
                    checked={recipientType === 'group'}
                    onCheckedChange={() => setRecipientType('group')}
                  />
                  <Label htmlFor="group">Group</Label>
                </div>
              )}
            </div>

            {recipientType === 'individual' ? (
              <div className="space-y-2">
                <Select onValueChange={(value) => {
                  if (value && !recipients.includes(value)) {
                    setRecipients([...recipients, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select users..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.first_name} {profile.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((recipientId) => {
                      const profile = profiles.find(p => p.user_id === recipientId);
                      return (
                        <Badge key={recipientId} variant="secondary" className="flex items-center gap-1">
                          {profile?.first_name} {profile?.last_name}
                          <X 
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setRecipients(recipients.filter(id => id !== recipientId))}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group..." />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Related Property (optional) */}
          {(messageType === 'property' || messageType === 'maintenance') && (
            <div className="space-y-2">
              <Label>Related Property (Optional)</Label>
              <Select value={relatedProperty} onValueChange={setRelatedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="min-h-32 resize-none"
            />
          </div>

          {/* Tags/Labels */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTypeColor(messageType)}>
              {messageType}
            </Badge>
            {(priority === 'high' || priority === 'urgent') && (
              <Badge variant="destructive">
                {priority === 'urgent' ? 'Urgent' : 'High Priority'}
              </Badge>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!subject.trim() || !content.trim() || createConversation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {createConversation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};