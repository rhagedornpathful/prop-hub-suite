import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Eye,
  Edit,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  Phone,
  Mail,
  Share2,
  Archive,
  Trash2,
  Camera,
  FileText,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  monthly_rent?: number;
  status?: string;
  property_type?: string;
  service_type?: string;
  property_owner?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
  };
}

interface MobilePropertyActionsProps {
  property: Property;
  onEdit?: () => void;
  onView?: () => void;
  onScheduleMaintenance?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export const MobilePropertyActions: React.FC<MobilePropertyActionsProps> = ({
  property,
  onEdit,
  onView,
  onScheduleMaintenance,
  onArchive,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Property: ${property.address}`,
          text: `Check out this property: ${property.address}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Property link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePhotoCapture = () => {
    toast({
      title: "Camera",
      description: "Camera feature will be available soon",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const quickActions = [
    {
      icon: Eye,
      label: 'View Details',
      description: 'View full property information',
      color: 'bg-blue-100 text-blue-600',
      action: () => {
        onView?.();
        setIsOpen(false);
      }
    },
    {
      icon: Edit,
      label: 'Edit Property',
      description: 'Update property information',
      color: 'bg-purple-100 text-purple-600',
      action: () => {
        onEdit?.();
        setIsOpen(false);
      }
    },
    {
      icon: Calendar,
      label: 'Schedule Maintenance',
      description: 'Book maintenance or inspection',
      color: 'bg-orange-100 text-orange-600',
      action: () => {
        onScheduleMaintenance?.();
        setIsOpen(false);
      }
    },
    {
      icon: Camera,
      label: 'Take Photos',
      description: 'Capture property images',
      color: 'bg-green-100 text-green-600',
      action: handlePhotoCapture
    },
    {
      icon: Share2,
      label: 'Share Property',
      description: 'Share property details',
      color: 'bg-indigo-100 text-indigo-600',
      action: handleShare
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Create property report',
      color: 'bg-teal-100 text-teal-600',
      action: () => {
        toast({
          title: "Report",
          description: "Report generation will be available soon",
        });
      }
    }
  ];

  const adminActions = [
    {
      icon: Archive,
      label: 'Archive Property',
      description: 'Move to archived properties',
      color: 'bg-yellow-100 text-yellow-600',
      action: () => {
        onArchive?.();
        setIsOpen(false);
      }
    },
    {
      icon: Trash2,
      label: 'Delete Property',
      description: 'Permanently remove property',
      color: 'bg-red-100 text-red-600',
      action: () => {
        onDelete?.();
        setIsOpen(false);
      }
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-left">Property Actions</SheetTitle>
          
          {/* Property Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{property.address}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {[property.city, property.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {property.monthly_rent && (
                    <div className="flex items-center gap-1 mt-2">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        ${property.monthly_rent.toLocaleString()}/mo
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-2">
                  <Badge className={`${getStatusColor(property.status)} text-xs`}>
                    {(property.status || 'active').toUpperCase()}
                  </Badge>
                  {property.service_type && (
                    <Badge variant="outline" className="text-xs">
                      {property.service_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Owner Contact */}
          {property.property_owner && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Owner Contact</h3>
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {property.property_owner.first_name} {property.property_owner.last_name}
                    </p>
                    {property.property_owner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`tel:${property.property_owner.phone}`}
                          className="text-sm text-blue-600"
                        >
                          {property.property_owner.phone}
                        </a>
                      </div>
                    )}
                    {property.property_owner.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`mailto:${property.property_owner.email}`}
                          className="text-sm text-blue-600"
                        >
                          {property.property_owner.email}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin Actions */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Management Actions</h3>
            <div className="space-y-2">
              {adminActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};