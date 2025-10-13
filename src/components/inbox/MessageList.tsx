import React, { useState } from 'react';
import { Star, Paperclip, Users, Building, Wrench, AlertTriangle, Clock, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { InboxConversation } from '@/hooks/queries/useInbox';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { SwipeableConversationItem } from '@/components/messaging/SwipeableConversationItem';
import { MessageListSkeleton } from '@/components/ui/skeleton-loaders';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';
import { ColorfulAvatar } from '@/components/ui/colorful-avatar';
import { ParticipantCount } from '@/components/messaging/ParticipantCount';
import { formatMessageListTime } from '@/lib/dateFormatter';
import { truncateMessagePreview } from '@/lib/textUtils';

interface MessageListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  filter: string;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  bulkMode?: boolean;
  onArchive?: (id: string) => void;
  onStar?: (id: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  filter,
  selectedIds = [],
  onToggleSelect,
  bulkMode = false,
  onArchive,
  onStar
}) => {
  const { listRef } = useKeyboardNavigation({
    items: conversations,
    selectedId,
    onSelect,
    getItemId: (conv) => conv.id,
    enabled: !bulkMode,
  });
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


  const getFilterTitle = () => {
    switch (filter) {
      case 'inbox':
        return 'Inbox';
      case 'starred':
        return 'Starred';
      case 'sent':
        return 'Sent';
      case 'drafts':
        return 'Drafts';
      case 'archived':
        return 'Archived';
      case 'maintenance':
        return 'Maintenance';
      case 'properties':
        return 'Property Related';
      case 'tenants':
        return 'Tenant Messages';
      case 'urgent':
        return 'Urgent';
      default:
        return 'Messages';
    }
  };

  if (isLoading) {
    return <MessageListSkeleton count={8} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">{getFilterTitle()}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversation List */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Conversations"
      >
        {conversations.length === 0 ? (
          <EnhancedEmptyState 
            type={filter === 'all' ? 'inbox' : filter as any}
          />
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation, index) => {
              const isSelected = bulkMode ? selectedIds.includes(conversation.id) : selectedId === conversation.id;
              
              return (
                <SwipeableConversationItem
                  key={conversation.id}
                  onArchive={onArchive ? () => onArchive(conversation.id) : undefined}
                  onStar={onStar ? () => onStar(conversation.id) : undefined}
                  isStarred={conversation.is_starred}
                >
                  <div
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors border focus:outline-none focus:ring-2 focus:ring-primary",
                      isSelected
                        ? 'bg-primary/10 border-primary/20'
                        : 'hover:bg-muted/50 border-transparent',
                      conversation.unread_count > 0 && 'bg-blue-50/50'
                    )}
                    onClick={() => bulkMode && onToggleSelect ? onToggleSelect(conversation.id) : onSelect(conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        bulkMode && onToggleSelect ? onToggleSelect(conversation.id) : onSelect(conversation.id);
                      }
                    }}
                >
                  <div className="flex items-start gap-3">
                    {/* Bulk Select Checkbox */}
                    {bulkMode && onToggleSelect && (
                      <Checkbox
                        checked={selectedIds.includes(conversation.id)}
                        onCheckedChange={() => onToggleSelect(conversation.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    )}
                    
                    {/* Avatar */}
                    <ColorfulAvatar 
                      fallback={conversation.sender_name || 'Unknown'}
                      size="sm"
                      className="flex-shrink-0"
                    />

                  <div className="flex-1 min-w-0">
                    {/* Header */}
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

                    {/* Subject */}
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

                    {/* Preview */}
                    {conversation.last_message && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {truncateMessagePreview(conversation.last_message.content, 100)}
                      </p>
                    )}

                    {/* Footer */}
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
                </SwipeableConversationItem>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};