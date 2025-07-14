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
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
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
  
  // Property Management specific
  propertyData?: PropertyWithRelations;
  
  // House Watching specific  
  houseWatchingData?: HouseWatchingProperty;
}

interface PropertyCardProps {
  property: UnifiedPropertyData;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Debug logging
  console.log('PropertyCard - property:', property);
  console.log('PropertyCard - property.type:', property.type);

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

  const handleEditProperty = () => {
    if (isPropertyManagement) {
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: "Edit Service",
        description: "House watching service editing coming soon!",
      });
    }
  };

  const handleDeleteProperty = () => {
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden cursor-pointer">
      <div className="relative">
        {/* Conditional Image Upload Component */}
        {isPropertyManagement ? (
          <PropertyImageUpload 
            propertyId={property.id}
            currentImage={propertyManagementData?.images?.[0]}
          />
        ) : (
          <HouseWatchingImageUpload 
            propertyId={property.id}
            currentImage={undefined}
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(property.status)}>
            {getStatusText(property.status)}
          </Badge>
        </div>
        
        {/* Type-specific Top Left Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 text-foreground border-white/50">
            {isPropertyManagement 
              ? propertyManagementData?.property_type || "Property"
              : `${houseWatchingData?.check_frequency} checks`
            }
          </Badge>
        </div>
        
        {/* Service Type Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-primary text-primary-foreground">
            {isPropertyManagement ? (
              <>
                <Building className="h-3 w-3 mr-1" />
                Property Management
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" />
                House Watching
              </>
            )}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {property.address}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.displayAddress}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground hover:text-primary transition-colors">
              <UserCheck className="h-3 w-3" />
              <span className="text-xs">Owner: {getOwnerInfo()}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
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
              <DropdownMenuItem onClick={handleEditProperty}>
                <Edit className="h-4 w-4 mr-2" />
                {isPropertyManagement ? "Edit Property" : "Edit Service"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDeleteProperty}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isPropertyManagement ? "Delete Property" : "End Service"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Type-specific Content */}
          {isPropertyManagement ? (
            <>
              {/* Property Management Details */}
              <div className="grid grid-cols-2 gap-4">
                {propertyManagementData?.bedrooms && propertyManagementData?.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{propertyManagementData.bedrooms}BR/{propertyManagementData.bathrooms}BA</div>
                      <div className="text-xs text-muted-foreground">Bedrooms/Baths</div>
                    </div>
                  </div>
                )}
                {propertyManagementData?.monthly_rent && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-sm font-medium">${propertyManagementData.monthly_rent}</div>
                      <div className="text-xs text-muted-foreground">monthly rent</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Property Details */}
              {(propertyManagementData?.square_feet || propertyManagementData?.estimated_value) && (
                <div className="grid grid-cols-2 gap-4">
                  {propertyManagementData?.square_feet && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{propertyManagementData.square_feet.toLocaleString()} sq ft</div>
                        <div className="text-xs text-muted-foreground">Square feet</div>
                      </div>
                    </div>
                  )}
                  {propertyManagementData?.estimated_value && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">${propertyManagementData.estimated_value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Estimated value</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Maintenance Summary */}
              {(propertyManagementData?.maintenance_requests?.length || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Wrench className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {propertyManagementData?.maintenance_requests?.length} maintenance request{(propertyManagementData?.maintenance_requests?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(propertyManagementData?.pending_maintenance || 0) > 0 && `${propertyManagementData?.pending_maintenance} pending`}
                      {(propertyManagementData?.urgent_maintenance || 0) > 0 && (
                        <span className="text-destructive ml-2 font-medium">
                          {propertyManagementData?.urgent_maintenance} urgent
                        </span>
                      )}
                    </div>
                  </div>
                  {(propertyManagementData?.urgent_maintenance || 0) > 0 && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* House Watching Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold capitalize text-foreground">{houseWatchingData?.check_frequency}</div>
                    <div className="text-sm text-muted-foreground">check frequency</div>
                  </div>
                </div>
                {houseWatchingData?.monthly_fee && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-foreground">${houseWatchingData.monthly_fee}</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Check Status */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Last Check:</div>
                    <div className="text-base font-semibold text-foreground">
                      {houseWatchingData?.last_check_date ? new Date(houseWatchingData.last_check_date).toLocaleDateString() : "Not checked"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Next Check:</div>
                    <div className={`text-base font-semibold ${
                      houseWatchingData?.next_check_date && new Date(houseWatchingData.next_check_date) < new Date() 
                        ? 'text-destructive' 
                        : 'text-foreground'
                    }`}>
                      {houseWatchingData?.next_check_date ? new Date(houseWatchingData.next_check_date).toLocaleDateString() : "Not scheduled"}
                      {houseWatchingData?.next_check_date && new Date(houseWatchingData.next_check_date) < new Date() && (
                        <span className="block text-xs font-medium text-destructive mt-1">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Action Buttons - Type Specific */}
          <div className="border-t border-border/50 pt-4 mt-4">
            {isPropertyManagement ? (
              <div className="flex gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 px-2 text-xs font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
                  onClick={handleViewProperty}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 px-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                  onClick={handleViewMaintenance}
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  Maintenance
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 px-2 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300"
                  onClick={handleViewReports}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Reports
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 px-3 text-xs font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
                  onClick={handleScheduleCheck}
                >
                  <Calendar className="h-3 w-3 mr-1.5" />
                  Schedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 px-3 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300"
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
}