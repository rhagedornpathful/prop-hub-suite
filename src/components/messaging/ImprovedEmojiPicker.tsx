import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const emojiCategories = {
  recent: ['👍', '❤️', '😊', '😂', '🎉', '🔥'],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  objects: ['🎉', '🎊', '🎁', '🎈', '🎆', '🎇', '✨', '🔥', '💯', '⭐', '🌟', '💫', '🏆', '🥇', '🥈', '🥉', '🎯', '🎪', '🎨'],
};

interface ImprovedEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const ImprovedEmojiPicker: React.FC<ImprovedEmojiPickerProps> = ({ onEmojiSelect }) => {
  const [open, setOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>(
    JSON.parse(localStorage.getItem('recentEmojis') || '[]')
  );

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    
    // Update recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 18);
    setRecentEmojis(newRecent);
    localStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="smileys">😀</TabsTrigger>
            <TabsTrigger value="gestures">👍</TabsTrigger>
            <TabsTrigger value="hearts">❤️</TabsTrigger>
            <TabsTrigger value="objects">🎉</TabsTrigger>
          </TabsList>
          
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <TabsContent key={category} value={category} className="p-2 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-6 gap-1">
                {(category === 'recent' ? recentEmojis : emojis).map((emoji, index) => (
                  <button
                    key={`${emoji}-${index}`}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-2 text-2xl hover:bg-accent rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {category === 'recent' && recentEmojis.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent emojis
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
