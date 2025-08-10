import React, { useState } from 'react';
import { 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  ReplyAll, 
  Forward, 
  MoreHorizontal,
  Paperclip,
  Download,
  Building,
  User,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { InboxConversation } from '@/hooks/queries/useInbox';
import { useInboxMessages, useSendInboxMessage, useCreateInboxConversation } from '@/hooks/queries/useInbox';
import { useAuth } from '@/contexts/AuthContext';

interface MessageViewProps {
  conversation: InboxConversation;
  onClose: () => void;
}

export const MessageView: React.FC<MessageViewProps> = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [showReplyAll, setShowReplyAll] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [replyAllContent, setReplyAllContent] = useState('');
  const [forwardContent, setForwardContent] = useState('');
  const [forwardRecipients, setForwardRecipients] = useState<string[]>([]);
  
  const { data: messages = [], isLoading } = useInboxMessages(conversation.id);
  const sendMessage = useSendInboxMessage();
  const createConversation = useCreateInboxConversation();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: replyContent,
        subject: `Re: ${conversation.title || 'No subject'}`
      });
      setReplyContent('');
      setShowReply(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const handleReplyAll = async () => {
    if (!replyAllContent.trim()) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: replyAllContent,
        subject: `Re: ${conversation.title || 'No subject'}`
      });
      setReplyAllContent('');
      setShowReplyAll(false);
    } catch (error) {
      console.error('Failed to send reply all:', error);
    }
  };

  const handleForward = async () => {
    if (!forwardContent.trim() || forwardRecipients.length === 0) return;

    try {
      // Create a new conversation for forwarding
      await createConversation.mutateAsync({
        title: `Fwd: ${conversation.title || 'No subject'}`,
        type: conversation.type,
        priority: conversation.priority as any,
        content: forwardContent,
        participantIds: forwardRecipients
      });
      setForwardContent('');
      setForwardRecipients([]);
      setShowForward(false);
    } catch (error) {
      console.error('Failed to forward message:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Building className="h-4 w-4 text-orange-600" />;
      case 'property':
        return <Building className="h-4 w-4 text-indigo-600" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(conversation.type)}
              <h1 className="text-lg font-semibold truncate">
                {conversation.title || 'No subject'}
              </h1>
              {conversation.priority === 'high' && (
                <Badge variant="destructive" className="text-xs">
                  High Priority
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(conversation.last_message_at || conversation.created_at)}
              </span>
              <span>{conversation.thread_count} message{conversation.thread_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Print</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setShowReply(!showReply);
              setShowReplyAll(false);
              setShowForward(false);
            }}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setShowReplyAll(!showReplyAll);
              setShowReply(false);
              setShowForward(false);
            }}
          >
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setShowForward(!showForward);
              setShowReply(false);
              setShowReplyAll(false);
              // Pre-populate forward content with the last message
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                setForwardContent(`\n\n--- Forwarded Message ---\nFrom: ${lastMessage.sender_name}\nSubject: ${conversation.title}\n\n${lastMessage.content}`);
              }
            }}
          >
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-4">
            {/* Message Header */}
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {message.sender_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{message.sender_name || 'Unknown User'}</span>
                    {message.importance === 'high' && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(message.created_at)}
                  </span>
                </div>
                
                {message.subject && message.subject !== conversation.title && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Subject: {message.subject}
                  </p>
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="ml-13 space-y-3">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>

              {/* Attachments */}
              {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Attachments
                  </h4>
                  <div className="space-y-1">
                    {message.attachments.map((attachment: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border border-border rounded-lg">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{attachment.name || `Attachment ${idx + 1}`}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {index < messages.length - 1 && <Separator className="my-6" />}
          </div>
        ))}
      </div>

      {/* Reply Area */}
      {showReply && (
        <div className="border-t border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="h-4 w-4" />
              <span>Reply to: {conversation.sender_name || 'Unknown User'}</span>
            </div>
            
            <Textarea
              placeholder="Type your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-24 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReply(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReply}
                  disabled={!replyContent.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply All Area */}
      {showReplyAll && (
        <div className="border-t border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ReplyAll className="h-4 w-4" />
              <span>Reply to all participants in this conversation</span>
            </div>
            
            <Textarea
              placeholder="Type your reply to all participants..."
              value={replyAllContent}
              onChange={(e) => setReplyAllContent(e.target.value)}
              className="min-h-24 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReplyAll(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReplyAll}
                  disabled={!replyAllContent.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? 'Sending...' : 'Reply to All'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forward Area */}
      {showForward && (
        <div className="border-t border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Forward className="h-4 w-4" />
              <span>Forward this conversation to new recipients</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recipients</label>
              <div className="text-sm text-muted-foreground">
                Note: Forwarding will create a new conversation with selected recipients
              </div>
              {/* For now, simplified recipient selection - you could enhance this with a proper user selector */}
              <input
                type="text"
                placeholder="Enter recipient email addresses (comma-separated)"
                className="w-full p-2 border border-border rounded"
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                  setForwardRecipients(emails);
                }}
              />
            </div>
            
            <Textarea
              placeholder="Add a message to forward..."
              value={forwardContent}
              onChange={(e) => setForwardContent(e.target.value)}
              className="min-h-32 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForward(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleForward}
                  disabled={!forwardContent.trim() || forwardRecipients.length === 0 || createConversation.isPending}
                >
                  {createConversation.isPending ? 'Forwarding...' : 'Forward Message'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Reply Area - now only shows when showReply is true */}
      {/* Original reply area removed - replaced with the conditional ones above */}
    </div>
  );
};