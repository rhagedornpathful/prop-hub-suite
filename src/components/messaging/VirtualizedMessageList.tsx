import React, { useRef, useEffect } from 'react';
import { Star, Paperclip, Users, Building, Wrench, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { InboxConversation } from '@/hooks/queries/useInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColorfulAvatar } from '@/components/ui/colorful-avatar';
import { ParticipantCount } from '@/components/messaging/ParticipantCount';
import { formatMessageListTime } from '@/lib/dateFormatter';
import { truncateMessagePreview } from '@/lib/textUtils';

interface VirtualizedMessageListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  bulkMode?: boolean;
  height?: number;
}

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  conversations,
  selectedId,
  onSelect,
  selectedIds = [],
  onToggleSelect,
  bulkMode = false,
  height = 600,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-3 w-3" />;
      case 'property':
        return <Building className="h-3 w-3" />;
      case 'urgent':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
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

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    }
    return null;
  };


  const renderConversation = (conversation: InboxConversation) => {
    const isSelected = bulkMode ? selectedIds.includes(conversation.id) : selectedId === conversation.id;

    return (
      <div key={conversation.id} className="px-2 mb-1">
        <div
          className={cn(
            "p-3 rounded-lg cursor-pointer transition-colors border",
            isSelected
              ? 'bg-primary/10 border-primary/20'
              : 'hover:bg-muted/50 border-transparent',
            conversation.unread_count > 0 && 'bg-blue-50/50'
          )}
          onClick={() => bulkMode && onToggleSelect ? onToggleSelect(conversation.id) : onSelect(conversation.id)}
        >
          <div className="flex items-start gap-3">
            {bulkMode && onToggleSelect && (
              <Checkbox
                checked={selectedIds.includes(conversation.id)}
                onCheckedChange={() => onToggleSelect(conversation.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
            )}
            
            <ColorfulAvatar 
              fallback={conversation.sender_name || 'Unknown'}
              size="sm"
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "font-medium text-sm truncate",
                  conversation.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {conversation.sender_name || 'Unknown User'}
                </span>
                
                {conversation.is_starred && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                )}
                
                {getPriorityIcon(conversation.priority)}
                
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto">
                  {formatMessageListTime(conversation.last_message_at || conversation.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "text-sm truncate",
                  conversation.unread_count > 0 ? 'font-semibold' : 'font-normal'
                )}>
                  {conversation.title || conversation.last_message?.subject || 'No subject'}
                </h4>
                
                {conversation.unread_count > 0 && (
                  <Badge variant="secondary" className="text-xs h-4">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>

              {conversation.last_message && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {truncateMessagePreview(conversation.last_message.content, 100)}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs h-5", getTypeColor(conversation.type))}
                >
                  {getTypeIcon(conversation.type)}
                  <span className="ml-1">{conversation.type}</span>
                </Badge>
                
                {conversation.thread_count > 1 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {conversation.thread_count} messages
                  </Badge>
                )}
                
                {conversation.last_message?.attachments && (
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="font-medium mb-2">No conversations</h3>
        <p className="text-sm">No messages found for this filter</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ height: `${height}px` }} className="w-full">
      <div>
        {conversations.map((conversation) => renderConversation(conversation))}
      </div>
    </ScrollArea>
  );
};
