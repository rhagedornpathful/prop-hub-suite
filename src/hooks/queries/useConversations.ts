import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  title: string | null;
  type: string;
  property_id: string | null;
  maintenance_request_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  status: string;
  participants: ConversationParticipant[];
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender_name: string;
  };
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  left_at: string | null;
  last_read_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachments: any;
  reply_to_id: string | null;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender_name: string;
  deliveries: MessageDelivery[];
}

export interface MessageDelivery {
  id: string;
  message_id: string;
  user_id: string;
  delivered_at: string;
  read_at: string | null;
}

export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) return [];

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(*)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get last message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, sender_id, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count for this conversation
          const { data: unreadMessages } = await supabase
            .from('message_deliveries')
            .select('id')
            .eq('user_id', user.id)
            .is('read_at', null)
            .in('message_id', 
              await supabase
                .from('messages')
                .select('id')
                .eq('conversation_id', conv.id)
                .then(({ data }) => data?.map(m => m.id) || [])
            );

          const unreadCount = unreadMessages?.length || 0;

          return {
            ...conv,
            last_message: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              sender_id: lastMessage.sender_id,
              created_at: lastMessage.created_at,
              sender_name: 'Unknown User'
            } : undefined,
            unread_count: unreadCount
          };
        })
      );

      return conversationsWithMessages;
    },
    enabled: !!user,
  });
};

export const useConversationMessages = (conversationId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation-messages', conversationId, user?.id],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId || !user) return [];

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (messages || []).map(msg => ({
        ...msg,
        sender_name: 'Unknown User',
        deliveries: []
      }));
    },
    enabled: !!conversationId && !!user,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      attachments 
    }: { 
      conversationId: string; 
      content: string; 
      attachments?: any; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text',
          attachments
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate conversations and messages queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', data.conversation_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      title, 
      type, 
      propertyId, 
      maintenanceRequestId, 
      participantIds 
    }: { 
      title?: string; 
      type: string; 
      propertyId?: string; 
      maintenanceRequestId?: string; 
      participantIds: string[]; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating conversation with:', { title, type, propertyId, maintenanceRequestId, participantIds });

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          type,
          property_id: propertyId,
          maintenance_request_id: maintenanceRequestId,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) {
        console.error('Conversation insert failed:', convError);
        throw convError;
      }

      console.log('Conversation created:', conversation);

      // Add participants - ensure creator is always included and no duplicates
      const uniqueIds = Array.from(new Set([user.id, ...participantIds]));
      console.log('Adding participants:', uniqueIds);
      
      const participants = uniqueIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'participant'
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) {
        console.error('Participants insert failed:', participantsError);
        throw participantsError;
      }

      console.log('Participants added successfully');
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Success",
        description: "Conversation created successfully"
      });
    },
    onError: (error: any) => {
      console.error('useCreateConversation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create conversation. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_deliveries')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)
        .in('message_id', 
          await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conversationId)
            .then(({ data }) => data?.map(m => m.id) || [])
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};