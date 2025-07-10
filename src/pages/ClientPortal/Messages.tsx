import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Send,
  MessageSquare,
  Search,
  Plus,
  Paperclip,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building
} from "lucide-react";

const ClientMessages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [conversations] = useState([
    {
      id: 1,
      subject: "Weekly Check - Oak Street Property",
      participants: [
        { name: "Mike Rodriguez", role: "Property Manager", avatar: "MR" },
        { name: "You", role: "Property Owner", avatar: "YO" }
      ],
      lastMessage: "Thanks for the update! The property looks great.",
      lastMessageTime: "2024-01-08 2:30 PM",
      unreadCount: 0,
      status: "Active",
      property: "456 Oak Street",
      messages: [
        {
          id: 1,
          sender: "Mike Rodriguez",
          content: "Hi Sarah, I've completed the weekly check for your Oak Street property. Everything looks great! Pool is clean and chemicals are balanced. All systems are functioning normally.",
          timestamp: "2024-01-08 10:45 AM",
          type: "text",
          isOwn: false
        },
        {
          id: 2,
          sender: "Mike Rodriguez",
          content: "I've attached the photos from today's inspection. Let me know if you have any questions!",
          timestamp: "2024-01-08 10:47 AM",
          type: "text",
          isOwn: false,
          attachments: [
            { name: "pool_inspection.jpg", type: "image" },
            { name: "exterior_check.jpg", type: "image" }
          ]
        },
        {
          id: 3,
          sender: "You",
          content: "Thanks for the update! The property looks great. I noticed the pool cleaner mentioned in the report - is that scheduled for this week?",
          timestamp: "2024-01-08 2:30 PM",
          type: "text",
          isOwn: true
        }
      ]
    },
    {
      id: 2,
      subject: "Sprinkler System Issue - Pine Avenue",
      participants: [
        { name: "Sarah Chen", role: "Property Manager", avatar: "SC" },
        { name: "You", role: "Property Owner", avatar: "YO" }
      ],
      lastMessage: "I'll have the technician come out tomorrow.",
      lastMessageTime: "2024-01-07 4:15 PM",
      unreadCount: 2,
      status: "Urgent",
      property: "123 Pine Avenue",
      messages: [
        {
          id: 1,
          sender: "Sarah Chen",
          content: "Hi Sarah, during today's inspection I noticed that sprinkler head #4 in the front yard needs adjustment. It's spraying onto the sidewalk instead of the lawn.",
          timestamp: "2024-01-07 3:45 PM",
          type: "text",
          isOwn: false
        },
        {
          id: 2,
          sender: "You",
          content: "Thanks for catching that! Can you schedule someone to fix it?",
          timestamp: "2024-01-07 4:00 PM",
          type: "text",
          isOwn: true
        },
        {
          id: 3,
          sender: "Sarah Chen",
          content: "I'll have the technician come out tomorrow. Should be a quick fix.",
          timestamp: "2024-01-07 4:15 PM",
          type: "text",
          isOwn: false
        }
      ]
    },
    {
      id: 3,
      subject: "Holiday Decorations Update",
      participants: [
        { name: "Mike Rodriguez", role: "Property Manager", avatar: "MR" },
        { name: "You", role: "Property Owner", avatar: "YO" }
      ],
      lastMessage: "All decorations have been safely stored in the garage.",
      lastMessageTime: "2024-01-04 11:20 AM",
      unreadCount: 0,
      status: "Completed",
      property: "456 Oak Street",
      messages: [
        {
          id: 1,
          sender: "You",
          content: "Hi Mike, can you help remove the holiday decorations from the front of the house?",
          timestamp: "2024-01-02 9:00 AM",
          type: "text",
          isOwn: true
        },
        {
          id: 2,
          sender: "Mike Rodriguez",
          content: "Of course! I can take care of that this week. Where would you like me to store them?",
          timestamp: "2024-01-02 9:30 AM",
          type: "text",
          isOwn: false
        },
        {
          id: 3,
          sender: "You",
          content: "The garage would be perfect. There's a storage area in the back corner.",
          timestamp: "2024-01-02 10:00 AM",
          type: "text",
          isOwn: true
        },
        {
          id: 4,
          sender: "Mike Rodriguez",
          content: "All decorations have been safely stored in the garage. I've attached a photo showing where everything is stored.",
          timestamp: "2024-01-04 11:20 AM",
          type: "text",
          isOwn: false,
          attachments: [
            { name: "decorations_stored.jpg", type: "image" }
          ]
        }
      ]
    }
  ]);

  const [propertyManagers] = useState([
    {
      id: 1,
      name: "Mike Rodriguez",
      email: "mike@latitudepremier.com",
      phone: "(555) 234-5678",
      properties: ["456 Oak Street"],
      avatar: "MR"
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@latitudepremier.com",
      phone: "(555) 345-6789",
      properties: ["123 Pine Avenue"],
      avatar: "SC"
    }
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedConversationData = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation)
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Urgent": return "bg-destructive text-destructive-foreground";
      case "Active": return "bg-primary text-primary-foreground";
      case "Completed": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Urgent": return <AlertCircle className="h-3 w-3" />;
      case "Active": return <MessageSquare className="h-3 w-3" />;
      case "Completed": return <CheckCircle className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });

    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`${window.location.pathname.includes('/demo') ? '/demo' : ''}/client-portal`)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
              <p className="text-sm text-muted-foreground">
                {selectedConversationData 
                  ? selectedConversationData.subject
                  : "Communication center"
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-0 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground text-sm line-clamp-1">
                            {conversation.subject}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Building className="h-3 w-3" />
                          <span>{conversation.property}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                      <Badge className={`${getStatusColor(conversation.status)} text-xs`}>
                        {getStatusIcon(conversation.status)}
                        <span className="ml-1">{conversation.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2">
            {selectedConversationData ? (
              <Card className="shadow-md border-0 h-full flex flex-col">
                {/* Conversation Header */}
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-foreground">{selectedConversationData.subject}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {selectedConversationData.property}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {selectedConversationData.participants.filter(p => p.name !== "You")[0]?.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversationData.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.attachments && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs opacity-75">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs text-muted-foreground mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                          <span>{message.sender} • {formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                      {!message.isOwn && (
                        <Avatar className="w-8 h-8 mr-2 order-1">
                          <AvatarFallback className="text-xs">
                            {selectedConversationData.participants.find(p => p.name === message.sender)?.avatar || "PM"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-primary hover:bg-primary-dark"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-md border-0 h-full">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a Conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to view messages and communicate with your property managers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Property Managers Section */}
        <Card className="mt-6 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Property Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyManagers.map((manager) => (
                <div key={manager.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{manager.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{manager.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {manager.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {manager.phone}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Properties: {manager.properties.join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientMessages;