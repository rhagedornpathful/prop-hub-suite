import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  username?: string;
}

interface MentionAutocompleteProps {
  conversationId: string;
  value: string;
  onChange: (value: string) => void;
  onMention?: (userId: string) => void;
  className?: string;
}

export const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
  conversationId,
  value,
  onChange,
  onMention,
  className
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Detect @ mentions
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setShowSuggestions(true);
      fetchParticipants(match[1]);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const fetchParticipants = async (query: string) => {
    try {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          profiles!inner(user_id, first_name, last_name, username)
        `)
        .eq('conversation_id', conversationId)
        .is('left_at', null);

      if (participants) {
        const users = participants
          .map(p => (p.profiles as any))
          .filter((profile: any) => {
            const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
            const username = profile.username?.toLowerCase() || '';
            const q = query.toLowerCase();
            return fullName.includes(q) || username.includes(q);
          });

        setSuggestions(users);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const insertMention = (user: User) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // Remove the @ and partial query
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
    const mention = `@${user.username || user.first_name}`;
    const newValue = beforeMention + mention + ' ' + textAfterCursor;
    
    onChange(newValue);
    onMention?.(user.user_id);
    setShowSuggestions(false);

    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = beforeMention.length + mention.length + 1;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        if (showSuggestions) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={className}
        placeholder="Type @ to mention someone..."
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="py-1">
            {suggestions.map((user, index) => (
              <button
                key={user.user_id}
                type="button"
                onClick={() => insertMention(user)}
                className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors ${
                  index === selectedIndex ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.first_name[0]}{user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.username && (
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
