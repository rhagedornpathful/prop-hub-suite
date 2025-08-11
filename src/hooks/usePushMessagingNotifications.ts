import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const usePushMessagingNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${getAccessibleConversationIds()})`
        },
        (payload) => {
          const message = payload.new;
          if (message.sender_id !== user.id) {
            toast({
              title: "New Message",
              description: message.content.length > 50 
                ? `${message.content.substring(0, 50)}...`
                : message.content
            });
          }
        }
      )
      .subscribe();

    // Subscribe to mentions
    const mentionChannel = supabase
      .channel('user-mentions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_mentions',
          filter: `mentioned_user_id=eq.${user.id}`
        },
        (payload) => {
          toast({
            title: "You were mentioned",
            description: "Someone mentioned you in a message",
            variant: "default"
          });
        }
      )
      .subscribe();

    // Subscribe to reactions
    const reactionChannel = supabase
      .channel('message-reactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions'
        },
        (payload) => {
          // Only notify if someone else reacted to user's message
          checkIfUserMessage(payload.new.message_id).then((isUserMessage) => {
            if (isUserMessage && payload.new.user_id !== user.id) {
              toast({
                title: "New Reaction",
                description: "Someone reacted to your message"
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      messageChannel.unsubscribe();
      mentionChannel.unsubscribe();
      reactionChannel.unsubscribe();
    };
  }, [user]);

  const getAccessibleConversationIds = async (): Promise<string> => {
    if (!user) return '';
    
    const { data } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)
      .is('left_at', null);
    
    return data?.map(p => p.conversation_id).join(',') || '';
  };

  const checkIfUserMessage = async (messageId: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();
    
    return data?.sender_id === user.id;
  };
};