import { LucideIcon, Inbox, MessageSquare, Search, Archive, Star, Trash2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EnhancedEmptyStateProps {
  type: 'inbox' | 'sent' | 'drafts' | 'archive' | 'starred' | 'trash' | 'search' | 'conversation';
  searchQuery?: string;
  onAction?: () => void;
  className?: string;
}

const emptyStateConfig: Record<string, {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  illustration: string;
}> = {
  inbox: {
    icon: Inbox,
    title: "Your inbox is empty",
    description: "When you receive new messages, they'll appear here. Start a new conversation to get things going!",
    actionLabel: "Compose Message",
    illustration: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
  },
  sent: {
    icon: MessageSquare,
    title: "No sent messages",
    description: "Messages you send will appear here. Compose a new message to get started.",
    actionLabel: "Compose Message",
    illustration: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
  },
  drafts: {
    icon: MessageSquare,
    title: "No drafts saved",
    description: "Start composing a message and it will automatically save as a draft.",
    actionLabel: "Compose Message",
    illustration: "M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4z"
  },
  archive: {
    icon: Archive,
    title: "No archived conversations",
    description: "Archive conversations you want to keep but don't need in your main inbox.",
    illustration: "M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27z"
  },
  starred: {
    icon: Star,
    title: "No starred messages",
    description: "Star important messages to find them easily later.",
    illustration: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
  },
  trash: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Deleted messages will stay here for 30 days before being permanently removed.",
    illustration: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "We couldn't find any messages matching your search. Try different keywords or filters.",
    illustration: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
  },
  conversation: {
    icon: MessageSquare,
    title: "No messages yet",
    description: "Start the conversation by sending the first message.",
    actionLabel: "Send Message",
    illustration: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
  }
};

export const EnhancedEmptyState = ({ 
  type, 
  searchQuery, 
  onAction,
  className 
}: EnhancedEmptyStateProps) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center min-h-[400px] animate-fade-in",
      className
    )}>
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
          <Icon className="w-12 h-12 text-muted-foreground/50" />
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-primary/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2">
        {config.title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {type === 'search' && searchQuery 
          ? `No results for "${searchQuery}". Try different keywords or filters.`
          : config.description
        }
      </p>

      {/* Action */}
      {config.actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="hover-scale">
          {config.actionLabel}
        </Button>
      )}

      {/* Tips */}
      {type === 'search' && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg max-w-md">
          <p className="text-sm text-muted-foreground font-medium mb-2">Search tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            <li>• Try more general keywords</li>
            <li>• Check for typos</li>
            <li>• Remove filters to broaden results</li>
          </ul>
        </div>
      )}
    </div>
  );
};
