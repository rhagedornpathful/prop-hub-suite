import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InboxMessage } from './useInbox';

const PAGE_SIZE = 50;

export const useInboxMessagesInfinite = (conversationId: string) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['inbox-messages-infinite', conversationId, user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<InboxMessage[]> => {
      if (!conversationId || !user) return [];

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_draft', false)
        .order('created_at', { ascending: false }) // Newest first for infinite scroll
        .range(from, to);

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
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!conversationId && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
