import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MessageCircle, Send, Search, Filter, Clock, User, Building, Wrench, Users } from "lucide-react";
import { useState } from "react";

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [senderFilter, setSenderFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");

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
      thread: [
        {
          id: 1,
          sender: "Sarah Johnson",
          senderType: "client",
          message: "The AC in my apartment stopped working this morning. It's getting very hot and I have a baby at home. Can someone please come fix this today?",
          timestamp: "2024-07-10T14:30:00"
        }
      ]
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
      thread: [
        {
          id: 1,
          sender: "Mike's Property Inspections",
          senderType: "contractor",
          message: "Completed monthly inspection. Found minor issues in Unit 4B - kitchen faucet leak and bathroom tile grout needs attention. Photos attached.",
          timestamp: "2024-07-10T10:15:00"
        }
      ]
    },
    {
      id: 3,
      subject: "Rent Payment Confirmation",
      sender: "Internal System",
      senderType: "internal",
      property: "789 Pine St, Apt 1C",
      timestamp: "2024-07-10T09:00:00",
      priority: "low",
      status: "read",
      preview: "Rent payment received for July 2024. Amount: $1,100.00...",
      thread: [
        {
          id: 1,
          sender: "Internal System",
          senderType: "internal",
          message: "Rent payment received for July 2024. Amount: $1,100.00. Payment method: Bank transfer. Transaction ID: TXN-789456123",
          timestamp: "2024-07-10T09:00:00"
        }
      ]
    },
    {
      id: 4,
      subject: "Lease Renewal Question",
      sender: "John Smith",
      senderType: "client",
      property: "123 Main St, Apt 4B",
      timestamp: "2024-07-09T16:45:00",
      priority: "medium",
      status: "replied",
      preview: "Hi, I wanted to discuss renewing my lease for another year. What are the terms...",
      thread: [
        {
          id: 1,
          sender: "John Smith",
          senderType: "client",
          message: "Hi, I wanted to discuss renewing my lease for another year. What are the terms and conditions? Also, is there any possibility of rent adjustment?",
          timestamp: "2024-07-09T16:45:00"
        },
        {
          id: 2,
          sender: "Property Manager",
          senderType: "internal",
          message: "Hi John, thank you for your interest in renewing. I'll prepare the renewal documents with current market rates and email them to you by tomorrow.",
          timestamp: "2024-07-09T17:30:00"
        }
      ]
    },
    {
      id: 5,
      subject: "Work Order Completion - Plumbing",
      sender: "ABC Plumbing Services",
      senderType: "contractor",
      property: "456 Oak Ave, Unit 1B",
      timestamp: "2024-07-09T13:20:00",
      priority: "medium",
      status: "read",
      preview: "Work order #WO-005 has been completed. Replaced kitchen faucet and fixed leak...",
      thread: [
        {
          id: 1,
          sender: "ABC Plumbing Services",
          senderType: "contractor",
          message: "Work order #WO-005 has been completed. Replaced kitchen faucet and fixed leak. Total time: 2 hours. Invoice will be sent separately. Customer was satisfied with the work.",
          timestamp: "2024-07-09T13:20:00"
        }
      ]
    },
    {
      id: 6,
      subject: "Team Meeting Notes",
      sender: "Property Manager",
      senderType: "internal",
      property: "All Properties",
      timestamp: "2024-07-09T11:00:00",
      priority: "low",
      status: "read",
      preview: "Weekly team meeting summary: Discussed maintenance schedules, new tenant onboarding...",
      thread: [
        {
          id: 1,
          sender: "Property Manager",
          senderType: "internal",
          message: "Weekly team meeting summary: Discussed maintenance schedules, new tenant onboarding process improvements, and Q3 budget planning. Next meeting scheduled for July 16th.",
          timestamp: "2024-07-09T11:00:00"
        }
      ]
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
          <Button className="bg-gradient-primary hover:bg-primary-dark">
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                  <MessageCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Messages</CardTitle>
                  <User className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <p className="text-xs text-muted-foreground">From tenants</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contractor Updates</CardTitle>
                  <Wrench className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">2</div>
                  <p className="text-xs text-muted-foreground">Work updates</p>
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

            {/* Messages Interface */}
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
                      {filteredMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                            message.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
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

              {/* Quick Actions & Compose */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common message templates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Send Rent Reminder
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Wrench className="w-4 h-4 mr-2" />
                      Request Maintenance Update
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

                {/* Quick Compose */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Reply</CardTitle>
                    <CardDescription>Send a quick message</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john">John Smith (Tenant)</SelectItem>
                        <SelectItem value="sarah">Sarah Johnson (Tenant)</SelectItem>
                        <SelectItem value="mike">Mike's Plumbing (Contractor)</SelectItem>
                        <SelectItem value="team">Internal Team</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </CardContent>
                </Card>

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
      </div>
    </div>
  );
};

export default Messages;