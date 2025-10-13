import React, { useState } from 'react';
import { Search, Menu, Users, Settings, SplitSquareHorizontal, CheckSquare, BarChart3, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InboxSidebar } from './InboxSidebar';
import { MessageList } from './MessageList';
import { MessageView } from './MessageView';
import { ComposeDialog } from './ComposeDialog';
import { BulkActionsToolbar } from '@/components/messaging/BulkActionsToolbar';
import { AdvancedSearchDialog } from '@/components/messaging/AdvancedSearchDialog';
import { ThreadManagementDialog } from '@/components/messaging/ThreadManagementDialog';
import { MessageTemplatesDialog } from '@/components/messaging/MessageTemplatesDialog';
import { ConversationInsights } from '@/components/messaging/ConversationInsights';
import { NotificationSettingsDialog } from '@/components/messaging/NotificationSettingsDialog';
import { useInboxConversations, useInboxMessages } from '@/hooks/queries/useInbox';
import { useAuth } from '@/contexts/AuthContext';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

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
  const [layoutDensity, setLayoutDensity] = useState<'comfortable' | 'compact'>('comfortable');
  
  // Bulk actions
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  
  // Phase 3 dialogs
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showThreadManagement, setShowThreadManagement] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  
  const { data: conversations = [], isLoading } = useInboxConversations({
    filter: selectedFilter,
    searchQuery
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const unreadCount = conversations.filter(c => c.unread_count > 0).length;
  
  const { data: messages = [] } = useInboxMessages(selectedConversationId || '', selectedFilter);

  // Phase 3 handlers
  const handleAdvancedSearch = (filters: any) => {
    console.log('Advanced search:', filters);
    setShowAdvancedSearch(false);
  };

  const handleThreadSplit = (conversationId: string, messageIds: string[]) => {
    console.log('Split thread:', conversationId, messageIds);
  };

  const handleThreadMerge = (conversationIds: string[], targetId: string) => {
    console.log('Merge threads:', conversationIds, 'into', targetId);
  };

  const handleAutoCategorize = (conversationId: string) => {
    console.log('Auto-categorize:', conversationId);
  };

  const handleInsertTemplate = (template: any, variables: any) => {
    console.log('Insert template:', template, variables);
    setShowTemplates(false);
  };

  return (
    <Card className="border-primary/20 bg-gradient-glass backdrop-blur-sm shadow-colored hover:shadow-glow transition-all duration-300 h-full overflow-hidden">
      {/* Enhanced Header */}
      <div className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search messages, contacts, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-background/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-4">
          <TabsList className="h-8">
            <TabsTrigger value="messages" className="h-7 text-xs">Messages</TabsTrigger>
            <TabsTrigger value="insights" className="h-7 text-xs">Insights</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-primary/90">
              {unreadCount} unread
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowAdvancedSearch(true)}
            title="Advanced search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowTemplates(true)}
            title="Message templates"
          >
            <FileText className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowNotificationSettings(true)}
            title="Notification settings"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button
            variant={bulkMode ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => {
              setBulkMode(!bulkMode);
              if (bulkMode) setSelectedConversationIds([]);
            }}
            title="Bulk actions"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {bulkMode ? 'Cancel' : 'Select'}
          </Button>

          {selectedConversationIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShowThreadManagement(true)}
              title="Thread management"
            >
              Thread Actions
            </Button>
          )}
        </div>
      </div>

      {/* Resizable Main Content */}
      <TabsContent value="messages" className="flex-1 h-[calc(100%-56px)] m-0">
        <div className="h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* Sidebar Panel */}
          <ResizablePanel
            defaultSize={sidebarCollapsed ? 3 : 20}
            minSize={3}
            maxSize={30}
            className="min-w-0"
          >
            <InboxSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              onCompose={() => setShowCompose(true)}
              unreadCount={unreadCount}
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />

          {/* Message List Panel */}
          <ResizablePanel
            defaultSize={30}
            minSize={25}
            maxSize={50}
            className="min-w-0"
          >
            <div className="h-full border-r border-border/50 bg-card/30 flex flex-col">
              {bulkMode && (
                <BulkActionsToolbar
                  selectedIds={selectedConversationIds}
                  onClearSelection={() => setSelectedConversationIds([])}
                  onComplete={() => setBulkMode(false)}
                />
              )}
              <div className="flex-1 overflow-hidden">
                <MessageList
                  conversations={conversations}
                  selectedId={selectedConversationId}
                  onSelect={setSelectedConversationId}
                  isLoading={isLoading}
                  filter={selectedFilter}
                  bulkMode={bulkMode}
                  selectedIds={selectedConversationIds}
                  onToggleSelect={(id) => {
                    setSelectedConversationIds(prev =>
                      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                    );
                  }}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />

          {/* Message View Panel */}
          <ResizablePanel
            defaultSize={50}
            minSize={40}
            className="min-w-0"
          >
            <div className="h-full bg-background/30">
              {selectedConversation ? (
                <MessageView
                  conversation={selectedConversation}
                  onClose={() => setSelectedConversationId(null)}
                  filter={selectedFilter}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Choose a conversation from the list to view messages, or create a new conversation to get started.
                    </p>
                    <Button 
                      onClick={() => setShowCompose(true)}
                      className="mt-6"
                    >
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
      </TabsContent>

      <TabsContent value="insights" className="flex-1 h-[calc(100%-56px)] m-0 overflow-auto">
        <ConversationInsights
          conversations={conversations}
          messages={messages}
        />
      </TabsContent>

      {/* Compose Dialog */}
      <ComposeDialog
        open={showCompose}
        onOpenChange={setShowCompose}
      />

      {/* Phase 3 Dialogs */}
      <AdvancedSearchDialog
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        onSearch={handleAdvancedSearch}
      />

      <ThreadManagementDialog
        open={showThreadManagement}
        onOpenChange={setShowThreadManagement}
        conversations={conversations}
        selectedConversations={selectedConversationIds}
        onSplit={handleThreadSplit}
        onMerge={handleThreadMerge}
        onAutoCategorize={handleAutoCategorize}
      />

      <MessageTemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onInsertTemplate={handleInsertTemplate}
      />

      <NotificationSettingsDialog
        open={showNotificationSettings}
        onOpenChange={setShowNotificationSettings}
      />
    </Card>
  );
};