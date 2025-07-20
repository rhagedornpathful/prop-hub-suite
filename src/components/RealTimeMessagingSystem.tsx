import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  MoreVertical,
  Search,
  UserPlus,
  Archive,
  Pin
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachments?: any[];
  edited?: boolean;
  conversation_id: string;
}

interface Conversation {
  id: string;
  title: string;
  participants: string[];
  last_message?: Message;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  updated_at: string;
}

interface RealTimeMessagingSystemProps {
  conversationId?: string;
  onConversationChange?: (conversationId: string) => void;
}

export const RealTimeMessagingSystem: React.FC<RealTimeMessagingSystemProps> = ({
  conversationId,
  onConversationChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setupRealtimeSubscriptions();
      loadConversations();
    }
    
    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.conversation_id === conversationId) {
            setMessages(prev => [...prev, newMessage]);
            
            // Play notification sound for messages from others
            if (newMessage.sender_id !== user?.id) {
              playNotificationSound();
            }
          }
          
          // Update conversation list
          loadConversations();
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel('typing')
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const typingUsers = Object.keys(state).filter(userId => userId !== user?.id);
        setIsTyping(typingUsers);
      })
      .subscribe();

    // Subscribe to user presence
    const presenceChannel = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => [...prev, key]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(id => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(user_id),
          last_message:messages(content, sender_id, created_at)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithCounts = await Promise.all(
        (data || []).map(async (conv) => {
          // Get unread count
          const { count } = await supabase
            .from('message_deliveries')
            .select('*', { count: 'exact' })
            .eq('user_id', user?.id)
            .is('read_at', null)
            .in(
              'message_id',
              await supabase
                .from('messages')
                .select('id')
                .eq('conversation_id', conv.id)
                .then(({ data }) => data?.map(m => m.id) || [])
            );

          const lastMessage = conv.last_message?.[0];
          return {
            ...conv,
            unread_count: count || 0,
            participants: conv.participants.map((p: any) => p.user_id),
            last_message: lastMessage ? {
              id: 'temp-' + Date.now(),
              content: lastMessage.content,
              sender_id: lastMessage.sender_id,
              sender_name: 'Unknown User',
              created_at: lastMessage.created_at,
              message_type: 'text' as const,
              conversation_id: conv.id
            } : undefined,
            is_pinned: false,
            is_archived: false
          };
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []).map(msg => ({
        ...msg,
        sender_name: 'Unknown User',
        message_type: (msg.message_type as 'text' | 'image' | 'file' | 'system') || 'text',
        attachments: Array.isArray(msg.attachments) ? msg.attachments : []
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = async (convId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_deliveries')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)
        .in(
          'message_id',
          await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', convId)
            .then(({ data }) => data?.map(m => m.id) || [])
        );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleTyping = async () => {
    if (!conversationId || !user) return;

    const typingChannel = supabase.channel('typing');
    await typingChannel.track({
      user_id: user.id,
      conversation_id: conversationId,
      typing_at: new Date().toISOString()
    });

    // Stop typing after 3 seconds
    setTimeout(() => {
      typingChannel.untrack();
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Messages</h3>
            <Button size="sm" variant="outline">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-1 ${
                  conversationId === conv.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
                onClick={() => onConversationChange?.(conv.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                  <div className="flex items-center space-x-1">
                    {conv.is_pinned && <Pin className="h-3 w-3 text-gray-400" />}
                    {conv.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 min-w-5 px-1">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {conv.last_message && (
                  <p className="text-xs text-gray-500 truncate">
                    {conv.last_message.content}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex -space-x-1">
                    {conv.participants.slice(0, 3).map((participantId, index) => (
                      <Avatar key={participantId} className="h-5 w-5 border border-white">
                        <AvatarFallback className="text-xs">
                          {index + 1}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {conv.participants.length > 3 && (
                      <div className="h-5 w-5 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{conv.participants.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(conv.updated_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {conversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold">
                  {conversations.find(c => c.id === conversationId)?.title || 'Conversation'}
                </h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span>{onlineUsers.length} online</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user?.id;
                  const showDate = index === 0 || formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                          {!isCurrentUser && (
                            <p className="text-xs text-gray-500 mb-1">{message.sender_name}</p>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTime(message.created_at)}
                              {message.edited && ' (edited)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-500 p-3 rounded-lg">
                      <p className="text-sm">
                        {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeMessagingSystem;