import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useMessageReactions, useAddReaction, useRemoveReaction } from '@/hooks/queries/useEnterpriseMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Smile } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  className?: string;
}

const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
  thumbs_up: '👍',
  thumbs_down: '👎'
};

export const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  messageId, 
  className = '' 
}) => {
  const { user } = useAuth();
  const { data: reactions = [], isLoading } = useMessageReactions(messageId);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Group reactions by type and count
  const reactionGroups = reactions.reduce((groups, reaction) => {
    if (!groups[reaction.reaction_type]) {
      groups[reaction.reaction_type] = {
        count: 0,
        users: [],
        hasUserReacted: false
      };
    }
    groups[reaction.reaction_type].count++;
    groups[reaction.reaction_type].users.push(reaction.user_id);
    if (reaction.user_id === user?.id) {
      groups[reaction.reaction_type].hasUserReacted = true;
    }
    return groups;
  }, {} as Record<string, { count: number; users: string[]; hasUserReacted: boolean }>);

  const handleReactionClick = async (reactionType: string) => {
    if (!user) return;

    const group = reactionGroups[reactionType];
    if (group?.hasUserReacted) {
      await removeReaction.mutateAsync({ messageId, reactionType });
    } else {
      await addReaction.mutateAsync({ messageId, reactionType });
    }
    setShowReactionPicker(false);
  };

  const addQuickReaction = async (reactionType: string) => {
    if (!user) return;
    await addReaction.mutateAsync({ messageId, reactionType });
  };

  if (isLoading) return null;

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {/* Existing Reactions */}
      {Object.entries(reactionGroups).map(([type, group]) => (
        <TooltipProvider key={type}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={group.hasUserReacted ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => handleReactionClick(type)}
                disabled={addReaction.isPending || removeReaction.isPending}
              >
                <span>{REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS] || '👍'}</span>
                <span>{group.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{group.count} reaction{group.count !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Add Reaction Button */}
      <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex items-center gap-1">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-accent"
                onClick={() => handleReactionClick(type)}
                disabled={addReaction.isPending}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Reaction on Hover */}
      {Object.keys(reactionGroups).length === 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => addQuickReaction('like')}
          disabled={addReaction.isPending}
        >
          <Smile className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
