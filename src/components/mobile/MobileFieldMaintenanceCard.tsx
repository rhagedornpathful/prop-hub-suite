import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone,
  MessageSquare,
  Camera,
  CheckCircle,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  created_date: string;
  property?: {
    address: string;
    city?: string;
    state?: string;
  };
  tenant?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  assigned_to?: string;
}

interface MobileFieldMaintenanceCardProps {
  request: MaintenanceRequest;
  onStatusUpdate: (requestId: string, status: string) => void;
  onNavigate?: () => void;
}

export const MobileFieldMaintenanceCard: React.FC<MobileFieldMaintenanceCardProps> = ({
  request,
  onStatusUpdate,
  onNavigate
}) => {
  const { toast } = useToast();

  const getPriorityColor = (priority: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    onStatusUpdate(request.id, newStatus);
    toast({
      title: "Status Updated",
      description: `Maintenance request marked as ${newStatus.replace('_', ' ')}`
    });
  };

  const handleCallTenant = () => {
    if (request.tenant?.phone) {
      window.location.href = `tel:${request.tenant.phone}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "Tenant phone number not available",
        variant: "destructive"
      });
    }
  };

  const handleTakePhoto = () => {
    // This would typically open camera
    toast({
      title: "Camera",
      description: "Photo capture feature would open here"
    });
  };

  const handleGetDirections = () => {
    if (request.property?.address) {
      const address = encodeURIComponent(
        `${request.property.address}, ${request.property.city || ''}, ${request.property.state || ''}`
      );
      window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
    }
  };

  return (
    <Card 
      className={`shadow-lg border-0 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl ${
        request.priority === 'urgent' ? 'ring-2 ring-destructive/20' : ''
      }`}
      onClick={onNavigate}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {request.title}
            </h3>
            {request.property && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {request.property.address}
                  {request.property.city && `, ${request.property.city}`}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <Badge 
              variant={getPriorityColor(request.priority)} 
              className="text-xs font-medium"
            >
              {request.priority.toUpperCase()}
            </Badge>
            <Badge 
              variant={getStatusColor(request.status)} 
              className="text-xs"
            >
              {request.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {request.description}
          </p>
        )}

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(request.created_date), 'MMM dd, h:mm a')}</span>
          </div>
          {request.tenant && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>
                {request.tenant.first_name} {request.tenant.last_name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          {/* Primary Actions */}
          {request.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('in_progress')}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl min-h-[44px]"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Start Work
            </Button>
          )}
          
          {request.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              className="bg-success hover:bg-success/90 text-white rounded-xl min-h-[44px]"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-1">
            {request.tenant?.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCallTenant}
                className="flex-1 rounded-xl min-h-[44px]"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleGetDirections}
              className="flex-1 rounded-xl min-h-[44px]"
            >
              <MapPin className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleTakePhoto}
              className="flex-1 rounded-xl min-h-[44px]"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Urgent Alert */}
        {request.priority === 'urgent' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              Urgent: Immediate attention required
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};