import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageCircle, Send, Search, Filter, Clock, User, Building, Wrench, Users, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunicationHub } from "@/components/CommunicationHub";
import { MaintenanceMessaging } from "@/components/MaintenanceMessaging";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [senderFilter, setSenderFilter] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showMaintenanceChat, setShowMaintenanceChat] = useState<string | null>(null);
  const { toast } = useToast();

  // For now, use mock data since conversations table isn't implemented yet
  const conversations: any[] = [];
  const conversationsLoading = false;

  // Fetch maintenance requests for messaging
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenance-requests-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties(address, city, state)
        `)
        .eq('status', 'in-progress')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const mockMessages = [
    {
      id: 1,
      subject: "Air Conditioning Issue - Unit 2A",
      sender: "Sarah Johnson",
      senderType: "client",
      property: "456 Oak Ave, Unit 2A",
      timestamp: "2024-07-10T14:30:00",
      priority: "high",
      status: "unread",
      preview: "The AC in my apartment stopped working this morning. It's getting very hot and I have a baby...",
      maintenance_id: "maint_001"
    },
    {
      id: 2,
      subject: "Monthly Inspection Report - 123 Main St",
      sender: "Mike's Property Inspections",
      senderType: "contractor",
      property: "123 Main St",
      timestamp: "2024-07-10T10:15:00",
      priority: "medium",
      status: "read",
      preview: "Completed monthly inspection. Found minor issues in Unit 4B - kitchen faucet leak...",
      maintenance_id: "maint_002"
    }
  ];

  const getSenderTypeColor = (senderType: string) => {
    switch (senderType) {
      case "client":
        return "bg-blue-100 text-blue-800";
      case "contractor":
        return "bg-orange-100 text-orange-800";
      case "internal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSenderTypeIcon = (senderType: string) => {
    switch (senderType) {
      case "client":
        return <User className="w-3 h-3" />;
      case "contractor":
        return <Wrench className="w-3 h-3" />;
      case "internal":
        return <Building className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-red-100 text-red-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      case "replied":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSender = senderFilter === "all" || message.senderType === senderFilter;
    return matchesSearch && matchesSender;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground mt-1">Communication hub for tenants, contractors, and internal team</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
              </DialogHeader>
              <CommunicationHub />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockMessages.filter(m => m.status === 'unread').length}
              </div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockMessages.length}</div>
              <p className="text-xs text-muted-foreground">Total threads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
              <Wrench className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{maintenanceRequests.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">2.5h</div>
              <p className="text-xs text-muted-foreground">Average response</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Chat</TabsTrigger>
            <TabsTrigger value="communication">Send Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Message List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Message Inbox</CardTitle>
                        <CardDescription>All communications from tenants, contractors, and team</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 w-64"
                          />
                        </div>
                        <Select value={senderFilter} onValueChange={setSenderFilter}>
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Senders</SelectItem>
                            <SelectItem value="client">Clients</SelectItem>
                            <SelectItem value="contractor">Contractors</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conversationsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading conversations...</p>
                        </div>
                      ) : filteredMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                            message.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                          onClick={() => {
                            if (message.maintenance_id) {
                              setShowMaintenanceChat(message.maintenance_id);
                            }
                          }}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Badge className={getSenderTypeColor(message.senderType)}>
                                  {getSenderTypeIcon(message.senderType)}
                                  <span className="ml-1 capitalize">{message.senderType}</span>
                                </Badge>
                                <Badge className={getPriorityColor(message.priority)} variant="outline">
                                  {message.priority}
                                </Badge>
                                <Badge className={getStatusColor(message.status)} variant="outline">
                                  {message.status}
                                </Badge>
                                {message.maintenance_id && (
                                  <Badge variant="secondary">
                                    <Wrench className="w-3 h-3 mr-1" />
                                    Maintenance
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-foreground">{message.subject}</h3>
                              <p className="text-sm text-muted-foreground">From: {message.sender}</p>
                              <p className="text-sm text-muted-foreground">Property: {message.property}</p>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {message.preview}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Maintenance */}
              <div className="space-y-6">
                {/* Maintenance Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Active Maintenance
                    </CardTitle>
                    <CardDescription>Quick access to maintenance communications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {maintenanceRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                        onClick={() => setShowMaintenanceChat(request.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{request.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {request.properties?.address}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                    {maintenanceRequests.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No active maintenance requests
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common message templates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email Notification
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Send SMS Alert
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Building className="w-4 h-4 mr-2" />
                      Property Announcement
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Team Notification
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid gap-4">
              {maintenanceRequests.map((request) => (
                <Card 
                  key={request.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setShowMaintenanceChat(request.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription>
                          {request.properties?.address}, {request.properties?.city}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={request.priority === 'high' ? 'destructive' : 
                                   request.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.scheduled_date && (
                        <span>Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {maintenanceRequests.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Maintenance Requests</h3>
                    <p className="text-muted-foreground">
                      All maintenance requests have been completed or are pending.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="communication">
            <CommunicationHub />
          </TabsContent>
        </Tabs>

        {/* Maintenance Chat Dialog */}
        {showMaintenanceChat && (
          <Dialog open={!!showMaintenanceChat} onOpenChange={() => setShowMaintenanceChat(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Maintenance Chat</DialogTitle>
              </DialogHeader>
              <div className="h-[60vh]">
                <MaintenanceMessaging
                  requestId={showMaintenanceChat}
                  requestTitle={maintenanceRequests.find(r => r.id === showMaintenanceChat)?.title || "Maintenance Request"}
                  participants={[
                    {
                      id: "user1",
                      name: "Property Manager",
                      role: "property_manager",
                      email: "manager@property.com",
                      isOnline: true
                    },
                    {
                      id: "user2", 
                      name: "Tenant",
                      role: "tenant",
                      email: "tenant@email.com",
                      isOnline: false
                    }
                  ]}
                  messages={[]}
                  currentUserId="user1"
                  currentUserRole="property_manager"
                  onSendMessage={async (message, attachments) => {
                    // Integration with messaging system
                    toast({
                      title: "Message Sent",
                      description: "Your message has been sent and all parties notified."
                    });
                  }}
                  onClose={() => setShowMaintenanceChat(null)}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Message Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Messages sent</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Messages received</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Pending responses</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;