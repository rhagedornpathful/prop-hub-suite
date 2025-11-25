import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Shield,
  UserCheck,
  Home,
  Gauge,
  TrendingUp,
  ClipboardCheck,
  Wrench,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PropertyImage } from "@/components/PropertyImage";
import { HouseWatchingImageUpload } from "@/components/HouseWatchingImageUpload";
import { SchedulePropertyCheckDialog } from "@/components/SchedulePropertyCheckDialog";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { useNavigate } from "react-router-dom";
import type { PropertyWithRelations } from "@/hooks/queries/useProperties";
import type { Tables } from "@/integrations/supabase/types";

type HouseWatchingProperty = Tables<'house_watching'>;

interface UnifiedPropertyData {
  id: string;
  type: 'property_management' | 'house_watching';
  // Common fields
  address: string;
  displayAddress?: string;
  status: string | null;
  images?: string[] | null;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Property Management specific
  propertyData?: PropertyWithRelations;
  
  // House Watching specific  
  houseWatchingData?: HouseWatchingProperty;
}

interface PropertyCardProps {
  property: UnifiedPropertyData;
}

// Memoized PropertyCard component for performance
const PropertyCard = React.memo(({ property }: PropertyCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isPropertyManagement = property.type === 'property_management';
  const isHouseWatching = property.type === 'house_watching';

  // Extract data based on type
  const propertyManagementData = property.propertyData;
  const houseWatchingData = property.houseWatchingData;

  // Common status handling
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return "bg-success text-success-foreground";
      case 'vacant': return "bg-warning text-warning-foreground";
      case 'maintenance': return "bg-destructive text-destructive-foreground";
      case 'inactive': return "bg-muted text-muted-foreground";
      case 'pending': return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'active': return "Active";
      case 'vacant': return "Vacant"; 
      case 'maintenance': return "Maintenance";
      case 'inactive': return "Inactive";
      case 'pending': return "Pending";
      default: return "Unknown";
    }
  };

  // Get owner/contact information
  const getOwnerInfo = () => {
    if (isPropertyManagement && propertyManagementData?.property_owner_associations) {
      const associations = propertyManagementData.property_owner_associations;
      if (associations.length === 0) {
        return "No Owner Assigned";
      }
      
      // Show primary owner first, or first owner if no primary
      const primaryOwner = associations.find(a => a.is_primary_owner);
      const ownerToShow = primaryOwner || associations[0];
      const owner = ownerToShow.property_owner;
      
      const ownerName = owner.company_name || `${owner.first_name} ${owner.last_name}`;
      
      // If there are multiple owners, show count
      if (associations.length > 1) {
        return `${ownerName} (+${associations.length - 1} more)`;
      }
      
      return ownerName;
    }
    
    // Fallback to old property_owner field for backward compatibility
    if (isPropertyManagement && propertyManagementData?.property_owner) {
      const owner = propertyManagementData.property_owner;
      return owner.company_name || `${owner.first_name} ${owner.last_name}`;
    }
    
    if (isHouseWatching && houseWatchingData?.owner_name) {
      return houseWatchingData.owner_name;
    }
    
    return "No Owner Assigned";
  };

  // Event handlers
  const handleViewProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/properties/${property.id}`);
  };

  const handleEditProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPropertyManagement) {
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: "Edit Service",
        description: "House watching service editing coming soon!",
      });
    }
  };

  const handleDeleteProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = isPropertyManagement ? "Delete Property" : "End Service";
    const description = isPropertyManagement 
      ? "Property deletion functionality coming soon!" 
      : "House watching service termination coming soon!";
    
    toast({ title, description });
  };

  const handleScheduleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScheduleDialogOpen(true);
  };

  const handleStartPropertyCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/property-check?property=${property.id}`);
  };

  const handleViewMaintenance = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/maintenance');
  };

  const handleViewReports = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/client-portal/reports');
  };

  const handleManageTenants = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/tenants');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer border border-border/50 hover:border-primary/20">
      <div className="relative overflow-hidden bg-muted/30">
        <PropertyImage 
          imageUrl={isPropertyManagement ? propertyManagementData?.images?.[0] : property.images?.[0]}
          address={property.address}
        />
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <Badge className={`${getStatusColor(property.status)} shadow-sm`}>
            {getStatusText(property.status)}
          </Badge>
        </div>
        
        {/* Service Type Badge - Bottom Left */}
        <div className="absolute bottom-2 left-2">
          <Badge className={isPropertyManagement 
            ? "bg-background/90 text-foreground border border-primary/20 shadow-sm backdrop-blur-sm" 
            : "bg-background/90 text-foreground border border-secondary/20 shadow-sm backdrop-blur-sm"
          }>
            {isPropertyManagement ? (
              <>
                <Building className="h-3 w-3 mr-1.5" />
                Property Management
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1.5" />
                House Watching
              </>
            )}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
              {(() => {
                // Always clean the address to show only street address
                let cleanAddress = property.address;
                
                // Try to remove city from various possible sources
                const possibleCities = [
                  isPropertyManagement ? propertyManagementData?.city : null,
                  property.city, // Direct city field
                  // Extract city from address pattern like "Street, City"
                  property.address.includes(',') ? property.address.split(',').pop()?.trim() : null
                ].filter(Boolean);
                
                // Remove any of these cities from the end of the address
                possibleCities.forEach(city => {
                  if (city) {
                    cleanAddress = cleanAddress.replace(new RegExp(`,?\\s*${city}\\s*$`, 'i'), '').trim();
                  }
                });
                
                return cleanAddress;
              })()}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{property.displayAddress || ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserCheck className="h-3.5 w-3.5" />
              <span className="truncate">{getOwnerInfo()}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewProperty}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStartPropertyCheck}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Property Check
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleScheduleCheck}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Property Check
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleEditProperty(e)}>
                <Edit className="h-4 w-4 mr-2" />
                {isPropertyManagement ? "Edit Property" : "Edit Service"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteProperty(e)}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isPropertyManagement ? "Delete Property" : "End Service"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 pt-3">
        <div className="space-y-3">
          {/* Type-specific Content */}
          {isPropertyManagement ? (
            <>
              {/* Property Management Details */}
              <div className="grid grid-cols-2 gap-3">
                {propertyManagementData?.bedrooms && propertyManagementData?.bathrooms && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <Home className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{propertyManagementData.bedrooms}BR / {propertyManagementData.bathrooms}BA</div>
                      <div className="text-xs text-muted-foreground">Bed/Bath</div>
                    </div>
                  </div>
                )}
                {propertyManagementData?.monthly_rent && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20">
                    <DollarSign className="h-4 w-4 text-success shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">${propertyManagementData.monthly_rent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Monthly</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance Summary */}
              {(propertyManagementData?.maintenance_requests?.length || 0) > 0 && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <Wrench className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {propertyManagementData?.maintenance_requests?.length} Request{(propertyManagementData?.maintenance_requests?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(propertyManagementData?.pending_maintenance || 0) > 0 && `${propertyManagementData?.pending_maintenance} pending`}
                      {(propertyManagementData?.urgent_maintenance || 0) > 0 && (
                        <span className="text-destructive ml-1.5 font-medium">
                          • {propertyManagementData?.urgent_maintenance} urgent
                        </span>
                      )}
                    </div>
                  </div>
                  {(propertyManagementData?.urgent_maintenance || 0) > 0 && (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* House Watching Details */}
              <div className="grid grid-cols-2 gap-3">
                {houseWatchingData?.check_frequency && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold capitalize">{houseWatchingData.check_frequency}</div>
                      <div className="text-xs text-muted-foreground">Frequency</div>
                    </div>
                  </div>
                )}
                {houseWatchingData?.monthly_fee && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20">
                    <DollarSign className="h-4 w-4 text-success shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">${houseWatchingData.monthly_fee}</div>
                      <div className="text-xs text-muted-foreground">Monthly</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Check Status Alert */}
              {houseWatchingData?.next_check_date && new Date(houseWatchingData.next_check_date) < new Date() && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-destructive">Check Overdue</div>
                    <div className="text-xs text-muted-foreground">
                      Scheduled check is past due
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Action Buttons - Type Specific */}
          <div className="border-t border-border/50 pt-4 mt-4">
            {isPropertyManagement ? (
              <div className="flex flex-wrap gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-h-[44px] px-2 text-base font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
                  onClick={handleViewProperty}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-h-[44px] px-2 text-base font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                  onClick={handleViewMaintenance}
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  Maintenance
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-h-[44px] px-2 text-base font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300"
                  onClick={handleViewReports}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Reports
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-h-[44px] px-3 text-base font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
                  onClick={handleScheduleCheck}
                >
                  <Calendar className="h-3 w-3 mr-1.5" />
                  Schedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-h-[44px] px-3 text-base font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300"
                  onClick={handleViewReports}
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  Reports
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Dialogs */}
      <SchedulePropertyCheckDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        propertyId={property.id}
        propertyAddress={property.address}
      />
      
      {isPropertyManagement && propertyManagementData && (
        <AddPropertyDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editProperty={propertyManagementData}
          mode="edit"
          onPropertyAdded={() => {
            setIsEditDialogOpen(false);
            toast({
              title: "Success",
              description: "Property updated successfully!",
            });
          }}
        />
      )}
    </Card>
  );
});

// Add display name for better debugging
PropertyCard.displayName = 'PropertyCard';

export { PropertyCard };