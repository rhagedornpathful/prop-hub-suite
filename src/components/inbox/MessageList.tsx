import React, { useState } from 'react';
import { Star, Paperclip, Users, Building, Wrench, AlertTriangle, Clock, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { InboxConversation } from '@/hooks/queries/useInbox';

interface MessageListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  filter: string;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  bulkMode?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  filter,
  selectedIds = [],
  onToggleSelect,
  bulkMode = false
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Loading...</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 border border-border rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-medium mb-2">No conversations</h3>
            <p className="text-sm">No messages found for this filter</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
              const isSelected = bulkMode ? selectedIds.includes(conversation.id) : selectedId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
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
                    <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {conversation.sender_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

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
                        {formatTime(conversation.last_message_at || conversation.created_at)}
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
                        {conversation.last_message.content}
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
            )})}
          </div>
        )}
      </div>
    </div>
  );
};