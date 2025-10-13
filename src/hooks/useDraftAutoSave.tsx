import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DraftAutoSaveProps {
  conversationId?: string;
  content: string;
  subject?: string;
  draftType?: 'reply' | 'compose' | 'forward';
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export const useDraftAutoSave = ({
  conversationId,
  content,
  subject,
  draftType = 'reply',
  enabled = true,
  metadata = {}
}: DraftAutoSaveProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!enabled || !user || content === lastSavedRef.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      if (content.trim().length === 0) {
        // Delete draft if content is empty
        if (conversationId) {
          await supabase
            .from('message_drafts')
            .delete()
            .eq('user_id', user.id)
            .eq('conversation_id', conversationId)
            .eq('draft_type', draftType);
        }
        return;
      }

      try {
        const { error } = await supabase
          .from('message_drafts')
          .upsert({
            user_id: user.id,
            conversation_id: conversationId || null,
            content,
            subject: subject || null,
            draft_type: draftType,
            metadata,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,conversation_id,draft_type'
          });

        if (error) throw error;

        lastSavedRef.current = content;
        console.log('Draft auto-saved');
      } catch (error) {
        console.error('Error auto-saving draft:', error);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, subject, conversationId, draftType, enabled, user, metadata]);

  const loadDraft = async (): Promise<{ content: string; subject?: string; metadata?: any } | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('message_drafts')
        .select('content, subject, metadata')
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId || null)
        .eq('draft_type', draftType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  };

  const deleteDraft = async () => {
    if (!user) return;

    try {
      await supabase
        .from('message_drafts')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId || null)
        .eq('draft_type', draftType);

      lastSavedRef.current = '';
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  return { loadDraft, deleteDraft };
};
