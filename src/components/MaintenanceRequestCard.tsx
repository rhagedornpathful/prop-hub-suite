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
  description: string | null;
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  scheduled_date: string | null;
  due_date: string | null;
  assigned_to: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  properties?: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  };
  assigned_user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
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

  // Default to general category since we don't have category field in the current data model
  const CategoryIcon = Wrench;
  const categoryColor = "bg-gray-500";

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
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
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
                {request.assigned_user && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Assigned to: {request.assigned_user.first_name} {request.assigned_user.last_name}</span>
                  </div>
                )}
                {request.properties && (
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3" />
                    <span className="truncate">
                      {request.properties.address}
                      {request.properties.city && `, ${request.properties.city}`}
                      {request.properties.state && `, ${request.properties.state}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                {request.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium text-primary">
                      Scheduled: {new Date(request.scheduled_date).toLocaleDateString()} at {new Date(request.scheduled_date).toLocaleTimeString()}
                    </span>
                  </div>
                )}
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

        {/* Cost Information */}
        {(request.estimated_cost || request.actual_cost) && (
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div className="space-y-1">
              {request.estimated_cost && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Estimated: </span>
                  <span className="font-medium">${request.estimated_cost}</span>
                </div>
              )}
              {request.actual_cost && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Actual: </span>
                  <span className="font-medium">${request.actual_cost}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        {request.due_date && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-600">
              Due: {new Date(request.due_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};