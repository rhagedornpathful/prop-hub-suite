import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingIndicatorProps {
  conversationId: string;
}

interface TypingUser {
  user_id: string;
  name?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ conversationId }) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to typing indicators
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const indicator = payload.new as any;
            
            // Don't show own typing indicator
            if (indicator.user_id === user?.id) return;

            if (indicator.is_typing) {
              // Fetch user name
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('user_id', indicator.user_id)
                .single();

              const name = profile ? `${profile.first_name} ${profile.last_name}` : 'Someone';

              setTypingUsers(prev => {
                const exists = prev.find(u => u.user_id === indicator.user_id);
                if (exists) return prev;
                return [...prev, { user_id: indicator.user_id, name }];
              });
            } else {
              setTypingUsers(prev => prev.filter(u => u.user_id !== indicator.user_id));
            }
          } else if (payload.eventType === 'DELETE') {
            const indicator = payload.old as any;
            setTypingUsers(prev => prev.filter(u => u.user_id !== indicator.user_id));
          }
        }
      )
      .subscribe();

    // Fetch initial typing users
    const fetchTypingUsers = async () => {
      const { data } = await supabase
        .from('typing_indicators')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .eq('is_typing', true)
        .neq('user_id', user?.id || '');

      if (data && data.length > 0) {
        const userIds = data.map(d => d.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);

        if (profiles) {
          setTypingUsers(profiles.map(p => ({
            user_id: p.user_id,
            name: `${p.first_name} ${p.last_name}`
          })));
        }
      }
    };

    fetchTypingUsers();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  if (typingUsers.length === 0) return null;

  const typingText = typingUsers.length === 1
    ? `${typingUsers[0].name} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
    : `${typingUsers.length} people are typing...`;

  return (
    <div className="px-6 py-2 text-sm text-muted-foreground italic flex items-center gap-2">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {typingText}
    </div>
  );
};

// Hook to set typing status
export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const setTyping = async (isTyping: boolean) => {
    if (!conversationId || !user) return;

    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: conversationId,
            user_id: user.id,
            is_typing: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'conversation_id,user_id'
          });
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating typing indicator:', error);
    }
  };

  const handleTyping = () => {
    setTyping(true);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setTyping(false);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const stopTyping = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setTyping(false);
  };

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [conversationId]);

  return { handleTyping, stopTyping };
};
