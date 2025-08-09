import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Camera,
  Paperclip,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'tenant' | 'property_manager' | 'contractor' | 'admin';
  message: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
  readBy?: string[];
}

interface Participant {
  id: string;
  name: string;
  role: 'tenant' | 'property_manager' | 'contractor' | 'admin';
  email: string;
  phone?: string;
  avatar?: string;
  isOnline?: boolean;
}

interface MaintenanceMessagingProps {
  requestId: string;
  requestTitle: string;
  participants: Participant[];
  messages: Message[];
  currentUserId: string;
  currentUserRole: string;
  onSendMessage?: (message: string, attachments?: File[]) => void;
  onClose?: () => void;
}

export const MaintenanceMessaging = ({
  requestId,
  requestTitle,
  participants,
  messages,
  currentUserId,
  currentUserRole,
  onSendMessage,
  onClose
}: MaintenanceMessagingProps) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(newMessage, attachments);
      }
      
      // Reset form
      setNewMessage("");
      setAttachments([]);
      
      // Mock success for now
      toast({
        title: "Message Sent",
        description: "Your message has been sent to all parties",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    
    if (files.length > 0) {
      toast({
        title: "Files Added",
        description: `${files.length} file(s) attached to your message`,
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tenant': return 'bg-blue-500';
      case 'property_manager': return 'bg-green-500';
      case 'contractor': return 'bg-orange-500';
      case 'admin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant': return 'Resident';
      case 'property_manager': return 'Property Manager';
      case 'contractor': return 'Contractor';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg border-0">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{requestTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Request #{requestId.slice(-8)}
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        
        {/* Participants */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm font-medium">Participants:</span>
          <div className="flex gap-1">
            {participants.map((participant) => (
              <div key={participant.id} className="relative">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.name} loading="lazy" decoding="async" />
                    ) : (
                      participant.name.split(' ').map(n => n[0]).join('')
                    )}
                  </AvatarFallback>
                </Avatar>
                {participant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message below</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            const participant = participants.find(p => p.id === message.senderId);
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {participant?.avatar ? (
                      <img src={participant.avatar} alt={participant?.name} className="h-8 w-8 rounded-full" loading="lazy" decoding="async" />
                    ) : (
                      message.senderName.split(' ').map(n => n[0]).join('')
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[80%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{message.senderName}</span>
                    <Badge 
                      className={`${getRoleColor(message.senderRole)} text-white text-xs px-2 py-0`}
                    >
                      {getRoleLabel(message.senderRole)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div
                    className={`p-3 rounded-lg inline-block ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded border ${
                              isCurrentUser ? 'border-primary-foreground/20' : 'border-border'
                            }`}
                          >
                            {attachment.type === 'image' ? (
                              <>
                                <Camera className="h-4 w-4" />
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="h-16 w-16 object-cover rounded cursor-pointer"
                                  loading="lazy"
                                  decoding="async"
                                  onClick={() => {
                                    // Open image in full view
                                    toast({
                                      title: "Photo Viewer",
                                      description: "Opening full-size image...",
                                    });
                                  }}
                                />
                              </>
                            ) : (
                              <>
                                <Paperclip className="h-4 w-4" />
                                <span className="text-xs truncate">{attachment.name}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {attachments.map((file, index) => (
              <div key={index} className="relative bg-muted p-2 rounded text-xs">
                <span className="truncate max-w-[100px] inline-block">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="ml-2 text-destructive hover:text-destructive/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="px-2"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="px-2"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="min-h-[60px] resize-none"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
            className="px-4"
          >
            {isSending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
};