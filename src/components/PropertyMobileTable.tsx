import React from 'react';
import { ResponsiveDataGrid } from './ResponsiveDataGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Home, 
  User,
  Eye,
  Edit,
  Calendar,
  Trash2
} from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  monthly_rent?: number;
  estimated_value?: number;
  status?: string;
  owner_id?: string;
  property_owner?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
  service_type?: string;
  created_at: string;
}

interface PropertyMobileTableProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onView?: (property: Property) => void;
  onScheduleMaintenance?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  loading?: boolean;
  showOwner?: boolean;
}

export function PropertyMobileTable({
  properties,
  onPropertyClick,
  onEdit,
  onView,
  onScheduleMaintenance,
  onDelete,
  loading = false,
  showOwner = true
}: PropertyMobileTableProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceTypeColor = (serviceType?: string) => {
    switch (serviceType) {
      case 'property_management':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'house_watching':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOwnerName = (property: Property) => {
    if (!property.property_owner) return 'No Owner';
    const { first_name, last_name, company_name } = property.property_owner;
    return company_name || `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown';
  };

  const columns = [
    {
      key: 'address',
      label: 'Property',
      shortLabel: 'Address',
      render: (value: string, property: Property, isMobile: boolean) => (
        <div>
          <div className="font-medium text-base flex items-start gap-2">
            <Building className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>{value}</span>
          </div>
          {(property.city || property.state) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>
                {[property.city, property.state].filter(Boolean).join(', ')}
                {property.zip_code && ` ${property.zip_code}`}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'property_type',
      label: 'Type',
      shortLabel: 'Type',
      mobileSecondary: true,
      render: (value?: string, property?: Property) => (
        <div className="space-y-1">
          {value && (
            <Badge variant="outline" className="text-xs">
              {value.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
          {property?.service_type && (
            <Badge className={`${getServiceTypeColor(property.service_type)} text-xs`}>
              {property.service_type.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      shortLabel: 'Details',
      mobileSecondary: true,
      render: (_, property: Property, isMobile: boolean) => {
        const details = [];
        if (property.bedrooms) details.push(`${property.bedrooms}br`);
        if (property.bathrooms) details.push(`${property.bathrooms}ba`);
        if (property.square_feet) details.push(`${property.square_feet.toLocaleString()}sf`);
        
        return details.length > 0 ? (
          <div className="flex items-center gap-2">
            <Home className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm">{details.join(' • ')}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      }
    },
    {
      key: 'monthly_rent',
      label: 'Rent',
      shortLabel: 'Rent',
      mobileSecondary: true,
      render: (value?: number, property?: Property) => {
        const rent = value || property?.estimated_value;
        if (!rent) return <span className="text-muted-foreground text-sm">-</span>;
        
        return (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">{rent.toLocaleString()}</span>
              {value && <span className="text-xs text-muted-foreground">/mo</span>}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      shortLabel: 'Status',
      mobileHidden: true,
      render: (value?: string) => (
        <Badge className={`${getStatusColor(value)} text-xs`}>
          {(value || 'active').toUpperCase()}
        </Badge>
      )
    },
    ...(showOwner ? [{
      key: 'property_owner',
      label: 'Owner',
      shortLabel: 'Owner',
      mobileHidden: true,
      render: (_, property: Property) => (
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{getOwnerName(property)}</span>
        </div>
      )
    }] : [])
  ];

  const actions = [
    {
      label: 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: (property: Property) => onView?.(property),
      variant: 'outline' as const
    },
    ...(onEdit ? [{
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: (property: Property) => onEdit(property),
      variant: 'outline' as const,
      mobileHidden: false
    }] : []),
    ...(onScheduleMaintenance ? [{
      label: 'Maintenance',
      icon: <Calendar className="w-4 h-4" />,
      onClick: (property: Property) => onScheduleMaintenance(property),
      variant: 'default' as const,
      mobileHidden: false
    }] : []),
    ...(onDelete ? [{
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (property: Property) => onDelete(property),
      variant: 'destructive' as const,
      mobileHidden: false
    }] : [])
  ];

  return (
    <ResponsiveDataGrid
      data={properties}
      columns={columns}
      actions={actions}
      title="Properties"
      subtitle={`${properties.length} properties`}
      searchable={true}
      loading={loading}
      emptyMessage="No properties found"
      onRowClick={onPropertyClick}
      primaryKey="id"
      itemsPerPage={12}
    />
  );
}