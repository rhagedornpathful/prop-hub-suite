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
    <Button 
      variant="outline" 
      size="icon" 
      className="h-6 w-6 shadow-sm"
      onClick={(e) => {
        e.stopPropagation();
        onView?.();
      }}
    >
      <MoreVertical className="h-3 w-3" />
    </Button>
  );
};