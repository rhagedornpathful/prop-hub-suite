import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  ClipboardCheck,
  Building,
  Shield,
  MapPin,
  DollarSign,
  Users,
  AlertTriangle
} from 'lucide-react';
import { PropertyImage } from '@/components/PropertyImage';
import type { PropertyWithRelations } from '@/hooks/queries/useProperties';

interface PropertyTableRowProps {
  property: PropertyWithRelations;
  onView: (property: PropertyWithRelations) => void;
  onEdit: (property: PropertyWithRelations) => void;
  onDelete: (property: PropertyWithRelations) => void;
  onScheduleCheck: (property: PropertyWithRelations) => void;
  onStartCheck: (property: PropertyWithRelations) => void;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}

export const PropertyTableRow: React.FC<PropertyTableRowProps> = ({
  property,
  onView,
  onEdit,
  onDelete,
  onScheduleCheck,
  onStartCheck,
  selected,
  onSelect
}) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return "bg-success text-success-foreground";
      case 'vacant': return "bg-warning text-warning-foreground";
      case 'maintenance': return "bg-destructive text-destructive-foreground";
      case 'inactive': return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOwnerInfo = () => {
    if (property.property_owner_associations && property.property_owner_associations.length > 0) {
      const primaryOwner = property.property_owner_associations.find(a => a.is_primary_owner);
      const ownerToShow = primaryOwner || property.property_owner_associations[0];
      const owner = ownerToShow.property_owner;
      
      const ownerName = owner.company_name || `${owner.first_name} ${owner.last_name}`;
      
      if (property.property_owner_associations.length > 1) {
        return `${ownerName} (+${property.property_owner_associations.length - 1} more)`;
      }
      
      return ownerName;
    }
    
    if (property.property_owner) {
      const owner = property.property_owner;
      return owner.company_name || `${owner.first_name} ${owner.last_name}`;
    }
    
    return "No Owner Assigned";
  };

  const hasUrgentMaintenance = (property.urgent_maintenance || 0) > 0;
  const hasPendingMaintenance = (property.pending_maintenance || 0) > 0;

  return (
    <TableRow className={selected ? "bg-muted/50" : ""}>
      <TableCell className="w-12">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded"
        />
      </TableCell>
      
      <TableCell className="w-24">
        <PropertyImage 
          imageUrl={property.images?.[0]}
          address={property.address}
          className="w-16 h-12 rounded object-cover"
        />
      </TableCell>
      
      <TableCell className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium truncate">{property.address}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {[property.city, property.state].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className={property.service_type === 'property_management' 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
          }>
            {property.service_type === 'property_management' ? (
              <>
                <Building className="h-3 w-3 mr-1" />
                Property Mgmt
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" />
                House Watch
              </>
            )}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge className={getStatusColor(property.status)}>
          {property.status || 'Active'}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium text-sm">{getOwnerInfo()}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Owner</span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        {property.service_type === 'property_management' && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-success" />
              <span className="text-sm font-medium">
                {property.monthly_rent ? `$${property.monthly_rent.toLocaleString()}` : 'N/A'}
              </span>
            </div>
            {property.bedrooms && property.bathrooms && (
              <p className="text-xs text-muted-foreground">
                {property.bedrooms}BR/{property.bathrooms}BA
              </p>
            )}
          </div>
        )}
        {property.service_type === 'house_watching' && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">House Watching</p>
            <p className="text-xs text-muted-foreground">Service Active</p>
          </div>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1">
          {hasUrgentMaintenance && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {property.urgent_maintenance} urgent
            </Badge>
          )}
          {hasPendingMaintenance && (
            <Badge variant="secondary" className="text-xs">
              {property.pending_maintenance} pending
            </Badge>
          )}
          {!hasUrgentMaintenance && !hasPendingMaintenance && (
            <span className="text-xs text-muted-foreground">No issues</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(property)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStartCheck(property)}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Start Check
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onScheduleCheck(property)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Check
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(property)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(property)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};