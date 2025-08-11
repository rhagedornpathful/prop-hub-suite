import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'thumbs_up' | 'thumbs_down';
  created_at: string;
}

export interface MessageMention {
  id: string;
  message_id: string;
  mentioned_user_id: string;
  created_at: string;
  read_at: string | null;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_shared: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  mention_notifications: boolean;
  message_notifications: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageSearchResult {
  message_id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  created_at: string;
  rank: number;
}

// Message Reactions
export const useMessageReactions = (messageId: string) => {
  return useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: async (): Promise<MessageReaction[]> => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as MessageReaction[];
    },
    enabled: !!messageId,
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ messageId, reactionType }: { messageId: string; reactionType: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        })
        .select()
        .single();

      if (error) throw error;

      // Log analytics
      await supabase.rpc('log_message_analytics', {
        conv_id: null,
        msg_id: messageId,
        event_type: 'reaction_added',
        user_id: user.id,
        metadata: { reaction_type: reactionType }
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', data.message_id] });
      toast({
        title: "Reaction added",
        description: "Your reaction has been added to the message"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add reaction",
        variant: "destructive"
      });
    }
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ messageId, reactionType }: { messageId: string; reactionType: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) throw error;
      return { messageId, reactionType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', data.messageId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove reaction",
        variant: "destructive"
      });
    }
  });
};

// Message Search
export const useMessageSearch = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      query, 
      conversationId, 
      limit = 50, 
      offset = 0 
    }: { 
      query: string; 
      conversationId?: string; 
      limit?: number; 
      offset?: number; 
    }): Promise<MessageSearchResult[]> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('search_messages', {
        search_query: query,
        user_id_param: user.id,
        conversation_id_param: conversationId || null,
        limit_param: limit,
        offset_param: offset
      });

      if (error) throw error;
      return data || [];
    },
    onError: (error: any) => {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search messages",
        variant: "destructive"
      });
    }
  });
};

// Message Templates
export const useMessageTemplates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['message-templates', user?.id],
    queryFn: async (): Promise<MessageTemplate[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateMessageTemplate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, content, category, isShared }: { 
      name: string; 
      content: string; 
      category?: string; 
      isShared?: boolean; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          user_id: user.id,
          name,
          content,
          category,
          is_shared: isShared || false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({
        title: "Template created",
        description: "Message template has been saved successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive"
      });
    }
  });
};

// Notification Preferences
export const useNotificationPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async (): Promise<NotificationPreferences | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive"
      });
    }
  });
};

// User mentions
export const useUserMentions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-mentions', user?.id],
    queryFn: async (): Promise<MessageMention[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('message_mentions')
        .select(`
          *,
          message:messages(*)
        `)
        .eq('mentioned_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useMarkMentionAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentionId: string) => {
      const { error } = await supabase
        .from('message_mentions')
        .update({ read_at: new Date().toISOString() })
        .eq('id', mentionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mentions'] });
    }
  });
};

// File upload for attachments
export const useUploadAttachment = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `message-attachments/${fileName}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    }
  });
};