import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

interface SmartRepliesProps {
  messageContent: string;
  onSelectReply: (reply: string) => void;
}

export const SmartReplies = ({ messageContent, onSelectReply }: SmartRepliesProps) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReplies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-replies', {
        body: { message: messageContent }
      });

      if (error) throw error;

      setSuggestions(data.replies || []);
    } catch (error) {
      console.error('Error generating smart replies:', error);
      toast({
        title: "Error",
        description: "Failed to generate smart replies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {suggestions.length === 0 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={generateReplies}
          disabled={loading}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Smart Replies'}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Suggested replies:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSelectReply(reply)}
                className="text-left h-auto whitespace-normal"
              >
                {reply}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateReplies}
            disabled={loading}
          >
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
};
