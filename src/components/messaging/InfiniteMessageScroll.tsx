import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { InboxMessage } from '@/hooks/queries/useInbox';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface InfiniteMessageScrollProps {
  messages: InboxMessage[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  currentUserId: string;
}

export const InfiniteMessageScroll: React.FC<InfiniteMessageScrollProps> = ({
  messages,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  currentUserId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  // Load more when scrolling to top
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reverse messages to show oldest first (bottom to top chat)
  const displayMessages = [...messages].reverse();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Load more indicator at top */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading older messages...</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Scroll up to load more</div>
          )}
        </div>
      )}

      {/* Messages */}
      {displayMessages.map((message, index) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const showDateDivider = index === 0 || 
          new Date(displayMessages[index - 1].created_at).toDateString() !== 
          new Date(message.created_at).toDateString();

        return (
          <React.Fragment key={message.id}>
            {showDateDivider && (
              <div className="flex items-center gap-4 my-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date(message.created_at).toLocaleDateString([], { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric' 
                  })}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            
            <div className={cn(
              "flex gap-3",
              isOwnMessage && "flex-row-reverse"
            )}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {message.sender_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className={cn(
                "flex flex-col max-w-[70%]",
                isOwnMessage && "items-end"
              )}>
                <div className={cn(
                  "rounded-lg p-3",
                  isOwnMessage 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                )}>
                  {message.subject && (
                    <div className={cn(
                      "font-semibold mb-1 text-sm",
                      isOwnMessage ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {message.subject}
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {message.attachments && Object.keys(message.attachments).length > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {Object.keys(message.attachments).length} attachment(s)
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                  {message.is_edited && (
                    <span className="text-xs text-muted-foreground">(edited)</span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
