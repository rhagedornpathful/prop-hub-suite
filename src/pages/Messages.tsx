import React, { useState } from 'react';
import { MessageCircle, MessageSquare, User, Clock, Filter, Search, Plus, Wrench, Phone, Mail, Users, Settings, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { CommunicationHub } from '@/components/CommunicationHub';
import { MaintenanceMessaging } from '@/components/MaintenanceMessaging';
import VideoCallSystem from '@/components/VideoCallSystem';
import EnhancedEmailTemplates from '@/components/EnhancedEmailTemplates';
import { 
  useConversations, 
  useConversationMessages, 
  useSendMessage, 
  useCreateConversation, 
  useMarkAsRead,
  type Conversation 
} from '@/hooks/queries/useConversations';
import { useMaintenanceRequests } from '@/hooks/queries/useMaintenanceRequests';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [senderFilter, setSenderFilter] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showMaintenanceChat, setShowMaintenanceChat] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Fetch conversations and maintenance requests
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  const { data: messages = [] } = useConversationMessages(selectedConversation);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = (conversation.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         conversation.participants.some(p => 
                           `${p.user_id}`.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesFilter = senderFilter === "all" || 
                         conversation.participants.some(p => p.role === senderFilter);
    
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: newMessage.trim()
      });
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tenant': return 'bg-blue-100 text-blue-800';
      case 'contractor': return 'bg-green-100 text-green-800';
      case 'owner_investor': return 'bg-purple-100 text-purple-800';
      case 'property_manager': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tenant': return <User className="h-3 w-3" />;
      case 'contractor': return <Wrench className="h-3 w-3" />;
      case 'owner_investor': return <Users className="h-3 w-3" />;
      case 'property_manager': return <Settings className="h-3 w-3" />;
      case 'admin': return <Settings className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getConversationTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'property_inquiry': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Calculate stats
  const totalConversations = conversations.length;
  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  const activeMaintenanceCount = maintenanceRequests.filter(req => req.status === 'in-progress').length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Messages</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Communication hub for tenants, contractors, and internal team
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Unread Messages</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">Requires attention</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-red-100 flex-shrink-0">
                  <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Active Conversations</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalConversations}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">Total threads</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-100 flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Maintenance Requests</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{activeMaintenanceCount}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">In progress</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-orange-100 flex-shrink-0">
                  <Wrench className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Response Time</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">2.5h</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">Average response</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-green-100 flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversations" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <TabsList className="grid w-full sm:w-auto grid-cols-5 h-auto">
              <TabsTrigger value="conversations" className="text-xs sm:text-sm">Chat</TabsTrigger>
              <TabsTrigger value="maintenance" className="text-xs sm:text-sm">Maintenance</TabsTrigger>
              <TabsTrigger value="video" className="text-xs sm:text-sm">Video Calls</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
              <TabsTrigger value="communication" className="text-xs sm:text-sm">Hub</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowNewConversation(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Message</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <TabsContent value="conversations" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Conversations List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="pb-3">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Conversations</CardTitle>
                      <CardDescription className="text-sm">
                        All active message threads
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 mt-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={senderFilter} onValueChange={setSenderFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="tenant">Tenants</SelectItem>
                          <SelectItem value="contractor">Contractors</SelectItem>
                          <SelectItem value="owner_investor">Owners</SelectItem>
                          <SelectItem value="property_manager">Managers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {conversationsLoading ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Loading conversations...</p>
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No conversations found</p>
                          <p className="text-sm text-gray-400">Start a new conversation</p>
                        </div>
                      ) : (
                        filteredConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => handleConversationSelect(conversation.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm truncate">
                                  {conversation.title || `${conversation.type} Conversation`}
                                </h4>
                                {conversation.unread_count! > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="secondary" className={`${getConversationTypeColor(conversation.type)} text-xs`}>
                                {conversation.type}
                              </Badge>
                            </div>
                            
                            {conversation.last_message && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                <span className="font-medium">{conversation.last_message.sender_name}:</span> {conversation.last_message.content}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-1">
                                {conversation.participants.slice(0, 3).map((participant, index) => (
                                  <Avatar key={participant.id} className="h-6 w-6 border border-white">
                                    <AvatarFallback className="text-xs">
                                      U{index + 1}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {conversation.participants.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                                    <span className="text-xs text-gray-600">+{conversation.participants.length - 3}</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {conversation.last_message_at ? formatTimestamp(conversation.last_message_at) : formatTimestamp(conversation.created_at)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message View */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {conversations.find(c => c.id === selectedConversation)?.title || 'Conversation'}
                          </CardTitle>
                          <CardDescription>
                            {conversations.find(c => c.id === selectedConversation)?.participants.length} participants
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {conversations.find(c => c.id === selectedConversation)?.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender_id === user?.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              {message.sender_id !== user?.id && (
                                <p className="text-xs font-medium mb-1 opacity-80">
                                  {message.sender_name}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTimestamp(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        >
                          Send
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a conversation to start messaging</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Active Maintenance
                  </CardTitle>
                  <CardDescription>
                    Quick access to maintenance communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {maintenanceRequests && maintenanceRequests.length > 0 ? (
                    <div className="space-y-3">
                      {maintenanceRequests.filter(req => req.status === 'in-progress').map((request) => (
                        <div
                          key={request.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setShowMaintenanceChat(request.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{request.title}</h4>
                            <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                              {request.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.property?.address}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(request.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active maintenance requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common message templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email Notification
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Schedule Phone Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Communication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Group Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <CommunicationHub />
          </TabsContent>
        </Tabs>

        {/* New Message Dialog */}
        <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <CommunicationHub />
          </DialogContent>
        </Dialog>

        {/* Maintenance Chat Dialog */}
        {showMaintenanceChat && (
          <Dialog open={!!showMaintenanceChat} onOpenChange={() => setShowMaintenanceChat(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Maintenance Chat</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                {/* TODO: Update MaintenanceMessaging component to work with new messaging database */}
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">Maintenance chat coming soon with the new messaging system</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Messages;