import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface InboxConversation {
  id: string;
  title: string | null;
  type: string;
  priority: string;
  property_id: string | null;
  maintenance_request_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  status: string;
  is_archived: boolean;
  is_starred: boolean;
  thread_count: number;
  sender_name: string | null;
  recipient_names: string[] | null;
  labels: string[];
  participants: any[];
  last_message?: {
    id: string;
    content: string;
    subject: string | null;
    sender_id: string;
    created_at: string;
    sender_name: string;
    attachments: any;
  };
  unread_count: number;
}

export interface InboxMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  subject: string | null;
  message_type: string;
  importance: string;
  attachments: any;
  reply_to_id: string | null;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  is_draft: boolean;
  is_edited: boolean;
  cc_recipients: string[] | null;
  bcc_recipients: string[] | null;
  sender_name: string;
  deliveries: any[];
}

export const useInboxConversations = ({ filter, searchQuery }: { filter: string; searchQuery: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inbox-conversations', user?.id, filter, searchQuery],
    queryFn: async (): Promise<InboxConversation[]> => {
      if (!user) return [];

      let query = supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(*)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      // Apply filters
      switch (filter) {
        case 'starred':
          query = query.eq('is_starred', true);
          break;
        case 'archived':
          query = query.eq('is_archived', true);
          break;
        case 'sent':
          query = query.eq('created_by', user.id).eq('is_archived', false);
          break;
        case 'drafts':
          // For drafts, we need to find conversations that have draft messages
          const { data: draftConversations } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('sender_id', user.id)
            .eq('is_draft', true);
          
          const draftConvIds = draftConversations?.map(m => m.conversation_id) || [];
          if (draftConvIds.length === 0) {
            // Return empty if no drafts
            return [];
          }
          query = query.in('id', draftConvIds);
          break;
        case 'maintenance':
          query = query.eq('type', 'maintenance');
          break;
        case 'properties':
          query = query.eq('type', 'property');
          break;
        case 'tenants':
          query = query.eq('type', 'tenant');
          break;
        case 'inbox':
        default:
          // Show only received conversations (not created by current user)
          query = query.eq('is_archived', false).neq('created_by', user.id);
          break;
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,sender_name.ilike.%${searchQuery}%`);
      }

      const { data: conversations, error } = await query;

      if (error) throw error;

      // Fetch all labels for these conversations for current user in one query
      const convIds = (conversations || []).map(c => c.id);
      let labelsByConv: Record<string, string[]> = {};
      if (convIds.length > 0) {
        const { data: labels } = await supabase
          .from('conversation_labels')
          .select('conversation_id,label')
          .eq('user_id', user.id)
          .in('conversation_id', convIds);
        labelsByConv = (labels || []).reduce((acc: Record<string, string[]>, row: any) => {
          acc[row.conversation_id] = acc[row.conversation_id] || [];
          acc[row.conversation_id].push(row.label);
          return acc;
        }, {});
      }

      // Get last message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Get last message - for drafts show draft messages, otherwise show non-draft
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, subject, sender_id, created_at, attachments')
            .eq('conversation_id', conv.id)
            .eq('is_draft', filter === 'drafts')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get sender name for last message
          let senderName = 'Unknown User';
          if (lastMessage?.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', lastMessage.sender_id)
              .maybeSingle();
            
            if (profile) {
              senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            }
          }

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
                .eq('is_draft', false)
                .then(({ data }) => data?.map(m => m.id) || [])
            );

          const unreadCount = unreadMessages?.length || 0;

          return {
            ...conv,
            labels: labelsByConv[conv.id] || [],
            last_message: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              subject: lastMessage.subject,
              sender_id: lastMessage.sender_id,
              created_at: lastMessage.created_at,
              sender_name: senderName,
              attachments: lastMessage.attachments
            } : undefined,
            unread_count: unreadCount
          } as InboxConversation;
        })
      );

      // Sort pinned/starred (is_starred) and then by time
      return conversationsWithMessages;
    },
    enabled: !!user,
  });
};

export const useInboxMessages = (conversationId: string, filter?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inbox-messages', conversationId, user?.id, filter],
    queryFn: async (): Promise<InboxMessage[]> => {
      if (!conversationId || !user) return [];

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_draft', filter === 'drafts')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender names
      const messagesWithSenders = await Promise.all(
        (messages || []).map(async (msg) => {
          let senderName = 'Unknown User';
          if (msg.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', msg.sender_id)
              .maybeSingle();
            
            if (profile) {
              senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            }
          }

          return {
            ...msg,
            sender_name: senderName,
            deliveries: []
          } as InboxMessage;
        })
      );

      return messagesWithSenders;
    },
    enabled: !!conversationId && !!user,
  });
};

export const useSendInboxMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      subject,
      importance = 'normal',
      attachments 
    }: { 
      conversationId: string; 
      content: string; 
      subject?: string;
      importance?: string;
      attachments?: any; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get sender name for optimistic update
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim()
        : 'Unknown User';

      const optimisticMessage: InboxMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        subject,
        importance,
        message_type: 'text',
        attachments,
        is_draft: false,
        reply_to_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        is_edited: false,
        cc_recipients: null,
        bcc_recipients: null,
        sender_name: senderName,
        deliveries: []
      };

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          subject,
          importance,
          message_type: 'text',
          attachments,
          is_draft: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation thread count and last message time
      const { data: currentConv } = await supabase
        .from('conversations')
        .select('thread_count')
        .eq('id', conversationId)
        .single();

      await supabase
        .from('conversations')
        .update({
          thread_count: (currentConv?.thread_count || 0) + 1,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return { ...data, sender_name: senderName, deliveries: [] };
    },
    onMutate: async ({ conversationId, content, subject, importance, attachments }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['inbox-messages', conversationId] });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<InboxMessage[]>(['inbox-messages', conversationId, user?.id]);
      
      // Get sender name
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim()
        : 'Unknown User';

      // Optimistically update to the new value
      const optimisticMessage: InboxMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user!.id,
        content,
        subject,
        importance: importance || 'normal',
        message_type: 'text',
        attachments,
        is_draft: false,
        reply_to_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null,
        is_edited: false,
        cc_recipients: null,
        bcc_recipients: null,
        sender_name: senderName,
        deliveries: []
      };

      queryClient.setQueryData<InboxMessage[]>(
        ['inbox-messages', conversationId, user?.id],
        (old) => [...(old || []), optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['inbox-messages', variables.conversationId, user?.id],
          context.previousMessages
        );
      }
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-messages', data.conversation_id] });
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully'
      });
    },
  });
};

export const useCreateInboxConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      title, 
      type, 
      priority = 'normal',
      content,
      participantIds,
      propertyId,
      maintenanceRequestId 
    }: { 
      title: string; 
      type: string; 
      priority?: string;
      content: string;
      participantIds: string[];
      propertyId?: string;
      maintenanceRequestId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get sender name
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim()
        : 'Unknown User';

      // Get recipient names
      const { data: recipientProfiles } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .in('user_id', participantIds);

      const recipientNames = recipientProfiles?.map(p => 
        `${p.first_name || ''} ${p.last_name || ''}`.trim()
      ) || [];

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          type,
          priority,
          property_id: propertyId,
          maintenance_request_id: maintenanceRequestId,
          created_by: user.id,
          sender_name: senderName,
          recipient_names: recipientNames,
          thread_count: 1
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const uniqueIds = Array.from(new Set([user.id, ...participantIds]));
      const participants = uniqueIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'participant'
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Send initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content,
          subject: title,
          message_type: 'text',
          importance: priority === 'high' ? 'high' : 'normal',
          is_draft: false
        });

      if (messageError) throw messageError;

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  });
};

// New: toggle star (pin)
export const useToggleStarConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, isStarred }: { conversationId: string; isStarred: boolean }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ is_starred: isStarred, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
    }
  });
};

// New: archive/unarchive
export const useArchiveConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, isArchived }: { conversationId: string; isArchived: boolean }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });
    }
  });
};

// New: labels management (also used to mute via label 'muted')
export const useConversationLabels = (conversationId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetch = async (): Promise<string[]> => {
    if (!conversationId || !user) return [];
    const { data, error } = await supabase
      .from('conversation_labels')
      .select('label')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId);
    if (error) throw error;
    return (data || []).map(r => r.label);
  };

  const add = async (label: string, color?: string) => {
    if (!conversationId || !user) return;
    const { error } = await supabase
      .from('conversation_labels')
      .insert({ user_id: user.id, conversation_id: conversationId, label, color });
    if (error) throw error;
  };

  const remove = async (label: string) => {
    if (!conversationId || !user) return;
    const { error } = await supabase
      .from('conversation_labels')
      .delete()
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId)
      .eq('label', label);
    if (error) throw error;
  };

  const toggleMute = async (mute: boolean) => {
    const labels = await fetch();
    const isMuted = labels.includes('muted');
    if (mute && !isMuted) await add('muted', '#999999');
    if (!mute && isMuted) await remove('muted');
  };

  return { fetch, add, remove, toggleMute };
};

// New: edit message content
export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, conversationId, newContent }: { messageId: string; conversationId: string; newContent: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ content: newContent, edited_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
      return { conversationId };
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['inbox-messages', conversationId] });
    }
  });
};

// New: delete (soft-delete)
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
      return { conversationId };
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['inbox-messages', conversationId] });
      toast({ title: 'Message deleted' });
    }
  });
};