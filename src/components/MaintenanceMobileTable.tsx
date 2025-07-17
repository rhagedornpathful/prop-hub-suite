import React from 'react';
import { ResponsiveDataGrid } from './ResponsiveDataGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Building,
  AlertTriangle,
  CheckCircle,
  Play,
  Eye
} from 'lucide-react';
import { formatDate } from 'date-fns';

interface MaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  property_id: string;
  property?: {
    address: string;
    city?: string;
  };
  user_id: string;
  assigned_to?: string;
  assigned_user?: {
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  scheduled_date?: string;
  completed_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  contractor_name?: string;
}

interface MaintenanceMobileTableProps {
  requests: MaintenanceRequest[];
  onRequestClick?: (request: MaintenanceRequest) => void;
  onAssign?: (request: MaintenanceRequest) => void;
  onStart?: (request: MaintenanceRequest) => void;
  onView?: (request: MaintenanceRequest) => void;
  loading?: boolean;
}

export function MaintenanceMobileTable({
  requests,
  onRequestClick,
  onAssign,
  onStart,
  onView,
  loading = false
}: MaintenanceMobileTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'in_progress':
        return <Play className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'cancelled':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Request',
      shortLabel: 'Request',
      render: (value: string, request: MaintenanceRequest, isMobile: boolean) => (
        <div>
          <div className="font-medium text-base">{value}</div>
          {request.description && !isMobile && (
            <div className="text-sm text-muted-foreground mt-1 truncate">
              {request.description.length > 60 
                ? `${request.description.substring(0, 60)}...`
                : request.description
              }
            </div>
          )}
        </div>
      )
    },
    {
      key: 'property',
      label: 'Property',
      shortLabel: 'Prop.',
      mobileSecondary: true,
      render: (_, request: MaintenanceRequest, isMobile: boolean) => (
        <div className="flex items-center gap-2">
          <Building className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className={isMobile ? "truncate text-sm" : ""}>
            {request.property?.address || 'Unknown Property'}
          </span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      shortLabel: 'Pri.',
      mobileSecondary: true,
      render: (value: string) => (
        <Badge className={`${getPriorityColor(value)} text-xs`}>
          {value.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      shortLabel: 'Status',
      mobileSecondary: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge className={`${getStatusColor(value)} text-xs`}>
            {value.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      )
    },
    {
      key: 'assigned_to',
      label: 'Assigned',
      shortLabel: 'Assigned',
      mobileHidden: true,
      render: (_, request: MaintenanceRequest) => {
        if (!request.assigned_to) {
          return <span className="text-muted-foreground text-sm">Unassigned</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span className="text-sm">
              {request.assigned_user 
                ? `${request.assigned_user.first_name || ''} ${request.assigned_user.last_name || ''}`.trim()
                : request.contractor_name || 'Assigned'
              }
            </span>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Created',
      shortLabel: 'Created',
      mobileHidden: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">
            {formatDate(new Date(value), 'MMM dd, yyyy')}
          </span>
        </div>
      )
    },
    {
      key: 'estimated_cost',
      label: 'Cost',
      shortLabel: 'Cost',
      mobileHidden: true,
      render: (value: number, request: MaintenanceRequest) => {
        const cost = request.actual_cost || value;
        if (!cost) return <span className="text-muted-foreground text-sm">-</span>;
        
        return (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">{cost.toLocaleString()}</span>
            </div>
            {request.actual_cost && value && request.actual_cost !== value && (
              <div className="text-xs text-muted-foreground">
                Est: ${value.toLocaleString()}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const actions = [
    {
      label: 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: (request: MaintenanceRequest) => onView?.(request),
      variant: 'outline' as const
    },
    ...(onAssign ? [{
      label: 'Assign',
      icon: <User className="w-4 h-4" />,
      onClick: (request: MaintenanceRequest) => onAssign(request),
      variant: 'default' as const,
      mobileHidden: false
    }] : []),
    ...(onStart ? [{
      label: 'Start',
      icon: <Play className="w-4 h-4" />,
      onClick: (request: MaintenanceRequest) => onStart(request),
      variant: 'default' as const,
      mobileHidden: false
    }] : [])
  ];

  return (
    <ResponsiveDataGrid
      data={requests}
      columns={columns}
      actions={actions}
      title="Maintenance Requests"
      subtitle={`${requests.length} requests`}
      searchable={true}
      loading={loading}
      emptyMessage="No maintenance requests found"
      onRowClick={onRequestClick}
      primaryKey="id"
      itemsPerPage={15}
    />
  );
}