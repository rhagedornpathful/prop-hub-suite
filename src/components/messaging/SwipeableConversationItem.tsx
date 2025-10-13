import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Archive, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SwipeableConversationItemProps {
  children: React.ReactNode;
  onArchive?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
  isStarred?: boolean;
}

export const SwipeableConversationItem: React.FC<SwipeableConversationItemProps> = ({
  children,
  onArchive,
  onDelete,
  onStar,
  isStarred,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setIsSwiping(true);
      // Limit swipe to 200px
      const offset = Math.max(-200, Math.min(200, eventData.deltaX));
      setSwipeOffset(offset);
    },
    onSwiped: () => {
      setIsSwiping(false);
      
      // If swiped far enough, trigger action
      if (swipeOffset > 100 && onStar) {
        onStar();
      } else if (swipeOffset < -100 && onArchive) {
        onArchive();
      }
      
      // Reset
      setTimeout(() => setSwipeOffset(0), 200);
    },
    trackMouse: false,
    trackTouch: true,
  });

  const getBackgroundColor = () => {
    if (swipeOffset > 50) return 'bg-yellow-100';
    if (swipeOffset < -50) return 'bg-blue-100';
    return 'bg-background';
  };

  return (
    <div className="relative overflow-hidden" {...handlers}>
      {/* Background actions */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-between px-4 transition-colors",
        getBackgroundColor()
      )}>
        {/* Left action - Star */}
        <div className={cn(
          "flex items-center gap-2 transition-opacity",
          swipeOffset > 50 ? 'opacity-100' : 'opacity-0'
        )}>
          <Star className={cn(
            "h-5 w-5",
            isStarred ? "fill-yellow-500 text-yellow-500" : "text-yellow-600"
          )} />
          <span className="text-sm font-medium text-yellow-700">
            {isStarred ? 'Unstar' : 'Star'}
          </span>
        </div>

        {/* Right action - Archive */}
        <div className={cn(
          "flex items-center gap-2 transition-opacity",
          swipeOffset < -50 ? 'opacity-100' : 'opacity-0'
        )}>
          <span className="text-sm font-medium text-blue-700">Archive</span>
          <Archive className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "relative bg-background transition-transform",
          isSwiping ? "duration-0" : "duration-200"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
