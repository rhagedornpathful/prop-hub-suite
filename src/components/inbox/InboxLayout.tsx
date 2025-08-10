import React, { useState } from 'react';
import { Search, Menu, Star, Archive, Tag, Users, Building, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InboxSidebar } from './InboxSidebar';
import { MessageList } from './MessageList';
import { MessageView } from './MessageView';
import { ComposeDialog } from './ComposeDialog';
import { useInboxConversations } from '@/hooks/queries/useInbox';
import { useAuth } from '@/contexts/AuthContext';

interface InboxLayoutProps {
  className?: string;
}

export const InboxLayout: React.FC<InboxLayoutProps> = ({ className }) => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('inbox');
  const [showCompose, setShowCompose] = useState(false);
  
  const { data: conversations = [], isLoading } = useInboxConversations({
    filter: selectedFilter,
    searchQuery
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const unreadCount = conversations.filter(c => c.unread_count > 0).length;

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-card`}>
        <InboxSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          onCompose={() => setShowCompose(true)}
          unreadCount={unreadCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border bg-card px-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex">
              {conversations.length} conversations
            </Badge>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Message List */}
          <div className="w-80 border-r border-border bg-card overflow-hidden">
            <MessageList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
              isLoading={isLoading}
              filter={selectedFilter}
            />
          </div>

          {/* Message View */}
          <div className="flex-1 bg-background">
            {selectedConversation ? (
              <MessageView
                conversation={selectedConversation}
                onClose={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the list to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Dialog */}
      <ComposeDialog
        open={showCompose}
        onOpenChange={setShowCompose}
      />
    </div>
  );
};