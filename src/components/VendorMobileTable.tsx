import React from 'react';
import { ResponsiveDataGrid } from './ResponsiveDataGrid';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  Phone, 
  Mail, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Calendar,
  Edit,
  MoreHorizontal 
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  averageResponseTime: number;
  phone: string;
  email: string;
  address: string;
  specialties: string[];
  hourlyRate: number;
  availability: "available" | "busy" | "unavailable";
  lastActive: string;
  joinedDate: string;
  notes: string;
}

interface VendorMobileTableProps {
  vendors: Vendor[];
  onVendorClick?: (vendor: Vendor) => void;
  onSchedule?: (vendor: Vendor) => void;
  onEdit?: (vendor: Vendor) => void;
  loading?: boolean;
}

export function VendorMobileTable({
  vendors,
  onVendorClick,
  onSchedule,
  onEdit,
  loading = false
}: VendorMobileTableProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRatingStars = (rating: number, isMobile: boolean) => {
    const size = isMobile ? "w-3 h-3" : "w-4 h-4";
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Vendor',
      shortLabel: 'Name',
      mobileSecondary: false,
      render: (value: string, vendor: Vendor, isMobile: boolean) => (
        <div className="flex items-center gap-3">
          <Avatar className={isMobile ? "h-8 w-8" : "h-10 w-10"}>
            <AvatarFallback>
              {vendor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{vendor.name}</div>
            <Badge 
              variant="secondary" 
              className={`text-xs mt-1 ${getAvailabilityColor(vendor.availability)}`}
            >
              {vendor.availability}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      shortLabel: 'Cat.',
      mobileSecondary: true,
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      shortLabel: 'Rating',
      mobileSecondary: true,
      render: (value: number, vendor: Vendor, isMobile: boolean) => (
        <div>
          {getRatingStars(value, isMobile)}
          {!isMobile && (
            <div className="text-xs text-muted-foreground mt-1">
              {vendor.totalJobs} jobs
            </div>
          )}
        </div>
      )
    },
    {
      key: 'hourlyRate',
      label: 'Rate',
      shortLabel: 'Rate',
      mobileSecondary: true,
      render: (value: number, vendor: Vendor, isMobile: boolean) => (
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <DollarSign className="w-3 h-3" />
            <span className="font-medium">{value}/hr</span>
          </div>
          {!isMobile && (
            <div className="text-xs text-muted-foreground">
              {vendor.averageResponseTime}h response
            </div>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      shortLabel: 'Phone',
      mobileHidden: true,
      render: (value: string, vendor: Vendor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3" />
            {value}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3 h-3" />
            {vendor.email}
          </div>
        </div>
      )
    },
    {
      key: 'completionRate',
      label: 'Performance',
      shortLabel: 'Perf.',
      mobileHidden: true,
      render: (_, vendor: Vendor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle className="w-3 h-3 text-green-600" />
            {Math.round((vendor.completedJobs / vendor.totalJobs) * 100)}% completed
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-3 h-3 text-blue-600" />
            {vendor.averageResponseTime}h response
          </div>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Schedule',
      icon: <Calendar className="w-4 h-4" />,
      onClick: (vendor: Vendor) => onSchedule?.(vendor),
      variant: 'default' as const
    },
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: (vendor: Vendor) => onEdit?.(vendor),
      variant: 'outline' as const,
      mobileHidden: false
    }
  ];

  return (
    <ResponsiveDataGrid
      data={vendors}
      columns={columns}
      actions={actions}
      title="Vendor Directory"
      subtitle={`${vendors.length} vendors available`}
      searchable={true}
      loading={loading}
      emptyMessage="No vendors found"
      onRowClick={onVendorClick}
      primaryKey="id"
    />
  );
}