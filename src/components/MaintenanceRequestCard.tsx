import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  MoreHorizontal,
  User,
  Calendar,
  Clock,
  Camera,
  Send,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Home,
  Zap,
  Droplets,
  Wind
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  createdAt: string;
  updatedAt: string;
  tenantName: string;
  tenantEmail: string;
  propertyAddress: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  images?: string[];
  messages?: Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    isFromTenant: boolean;
  }>;
}

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  onStatusChange?: (id: string, status: string) => void;
  onAssign?: (id: string, assignedTo: string) => void;
  userRole?: 'admin' | 'property_manager' | 'tenant' | 'contractor';
}

const categoryIcons = {
  plumbing: Droplets,
  electrical: Zap,
  hvac: Wind,
  appliances: Home,
  general: Wrench,
};

const categoryColors = {
  plumbing: "bg-blue-500",
  electrical: "bg-yellow-500", 
  hvac: "bg-green-500",
  appliances: "bg-purple-500",
  general: "bg-gray-500",
};

export const MaintenanceRequestCard = ({ 
  request, 
  onStatusChange, 
  onAssign, 
  userRole = 'property_manager' 
}: MaintenanceRequestCardProps) => {
  const { toast } = useToast();
  const [showMessages, setShowMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const CategoryIcon = categoryIcons[request.category as keyof typeof categoryIcons] || Wrench;
  const categoryColor = categoryColors[request.category as keyof typeof categoryColors] || "bg-gray-500";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(request.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Request status changed to ${newStatus}`,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      // Here you would send the message to your backend
      // For now, we'll just show a success message
      toast({
        title: "Message Sent",
        description: "Your message has been sent to all parties",
      });
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const canManageRequest = userRole === 'admin' || userRole === 'property_manager';
  const isContractor = userRole === 'contractor';
  const isTenant = userRole === 'tenant';

  return (
    <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${categoryColor}`}>
              <CategoryIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight mb-1">
                {request.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={`${getStatusColor(request.status)} text-white text-xs`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={`${getPriorityColor(request.priority)} text-white text-xs`}>
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{request.tenantName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-3 w-3" />
                  <span className="truncate">{request.propertyAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {canManageRequest && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('assigned')}>
                  <User className="h-4 w-4 mr-2" />
                  Assign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start Work
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {request.description && (
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {request.description}
            </p>
          </div>
        )}

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Attached Photos</p>
            <div className="grid grid-cols-2 gap-2">
              {request.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Issue photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Open image in full view
                      toast({
                        title: "Photo Viewer",
                        description: "Opening full-size image...",
                      });
                    }}
                  />
                  {index === 3 && request.images!.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{request.images!.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Information */}
        {(request.estimatedCost || request.actualCost) && (
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div className="space-y-1">
              {request.estimatedCost && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Estimated: </span>
                  <span className="font-medium">${request.estimatedCost}</span>
                </div>
              )}
              {request.actualCost && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Actual: </span>
                  <span className="font-medium">${request.actualCost}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communication
              {request.messages && request.messages.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {request.messages.length}
                </Badge>
              )}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMessages(!showMessages)}
            >
              {showMessages ? "Hide" : "Show"}
            </Button>
          </div>

          {showMessages && (
            <div className="space-y-3">
              {/* Recent Messages */}
              {request.messages && request.messages.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {request.messages.slice(-3).map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.isFromTenant ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.isFromTenant
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="mb-1">{message.message}</p>
                        <p className="text-xs opacity-70">
                          {message.sender} • {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No messages yet
                </p>
              )}

              {/* New Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};