import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SmartComposeButtonProps {
  conversationId: string;
  onSuggestionSelect: (suggestion: string) => void;
}

export const SmartComposeButton: React.FC<SmartComposeButtonProps> = ({
  conversationId,
  onSuggestionSelect
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      // Get last few messages for context
      const { data: messages } = await supabase
        .from('messages')
        .select('content, sender_id')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!messages || messages.length === 0) {
        setSuggestions(['Thank you for your message.', 'I appreciate your update.', 'I will look into this right away.']);
        return;
      }

      // Simple context-based suggestions (in production, call AI API)
      const lastMessage = messages[0].content.toLowerCase();
      const contextSuggestions: string[] = [];

      if (lastMessage.includes('thank')) {
        contextSuggestions.push("You're welcome! Let me know if you need anything else.");
      }
      if (lastMessage.includes('?')) {
        contextSuggestions.push('I will get back to you with that information shortly.');
      }
      if (lastMessage.includes('urgent') || lastMessage.includes('asap')) {
        contextSuggestions.push('I understand the urgency and will prioritize this immediately.');
      }

      contextSuggestions.push('Thank you for bringing this to my attention.');
      contextSuggestions.push('I appreciate the update. I will review this and respond soon.');

      setSuggestions(contextSuggestions.slice(0, 3));
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast({ title: 'Error generating suggestions', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Smart Compose
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <div className="text-sm font-medium mb-3">Suggested Replies</div>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating suggestions...
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full text-left p-3 rounded-md border border-border hover:bg-accent transition-colors text-sm"
                  onClick={() => {
                    onSuggestionSelect(suggestion);
                    setIsOpen(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
