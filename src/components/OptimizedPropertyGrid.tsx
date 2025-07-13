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
  ClipboardCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PropertyDetailsDialog } from "@/components/PropertyDetailsDialog";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
import { HouseWatchingImageUpload } from "@/components/HouseWatchingImageUpload";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<'properties'>;
type HouseWatchingProperty = Tables<'house_watching'>;

interface TransformedProperty {
  id: string;
  serviceType: 'property_management' | 'house_watching';
  rawData: Property | HouseWatchingProperty;
}

const PropertyManagementCard = ({ property }: { property: Property }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return "bg-success text-success-foreground";
      case 'vacant': return "bg-warning text-warning-foreground";
      case 'maintenance': return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'active': return "Active";
      case 'vacant': return "Vacant";
      case 'maintenance': return "Maintenance";
      default: return "Unknown";
    }
  };

  const handleViewProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "View Property",
      description: `Opening details for ${property.address}`,
    });
    // TODO: Open property details dialog or navigate to property page
  };

  const handleManageTenants = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Manage Tenants",
      description: `Opening tenant management for ${property.address}`,
    });
    // TODO: Navigate to tenants page or open tenant management modal
  };

  const handleStartPropertyCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/property-check?property=${property.id}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden cursor-pointer">
      <div className="relative">
        <PropertyImageUpload 
          propertyId={property.id}
          currentImage={property.images?.[0]}
        />
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(property.status)}>
            {getStatusText(property.status)}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 text-foreground border-white/50">
            {property.property_type || "Property"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-primary text-primary-foreground">
            <Building className="h-3 w-3 mr-1" />
            Property Management
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
              <span className="text-sm">{property.city}, {property.state}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground hover:text-primary transition-colors">
              <UserCheck className="h-3 w-3" />
              <span className="text-xs">Property Owner</span>
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStartPropertyCheck}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Property Check
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4">
            {property.bedrooms && property.bathrooms && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{property.bedrooms}BR/{property.bathrooms}BA</div>
                  <div className="text-xs text-muted-foreground">Bedrooms/Baths</div>
                </div>
              </div>
            )}
            {property.monthly_rent && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <div>
                  <div className="text-sm font-medium">${property.monthly_rent}</div>
                  <div className="text-xs text-muted-foreground">monthly rent</div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(property.square_feet || property.estimated_value) && (
            <div className="grid grid-cols-2 gap-4">
              {property.square_feet && (
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{property.square_feet.toLocaleString()} sq ft</div>
                    <div className="text-xs text-muted-foreground">Square feet</div>
                  </div>
                </div>
              )}
              {property.estimated_value && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">${property.estimated_value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Estimated value</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleViewProperty}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleManageTenants}
            >
              <Users className="h-4 w-4 mr-2" />
              Tenants
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HouseWatchingCard = ({ property }: { property: HouseWatchingProperty }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return "bg-success text-success-foreground";
      case 'inactive': return "bg-muted text-muted-foreground";
      case 'pending': return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'active': return "Active";
      case 'inactive': return "Inactive";
      case 'pending': return "Pending";
      default: return "Unknown";
    }
  };

  const nextCheckDate = property.next_check_date ? new Date(property.next_check_date) : null;
  const lastCheckDate = property.last_check_date ? new Date(property.last_check_date) : null;
  const isOverdue = nextCheckDate && nextCheckDate < new Date();

  const handleScheduleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Schedule Check",
      description: `Opening schedule dialog for ${property.property_address}`,
    });
    // TODO: Open schedule dialog/modal
  };

  const handleViewReports = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "View Reports",
      description: `Opening reports for ${property.property_address}`,
    });
    // TODO: Navigate to reports page or open reports modal
  };

  const handleStartPropertyCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/property-check?property=${property.id}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden cursor-pointer">
      <div className="relative">
        <HouseWatchingImageUpload 
          propertyId={property.id}
        />
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(property.status)}>
            {getStatusText(property.status)}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 text-foreground border-white/50">
            {property.check_frequency} checks
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-primary text-primary-foreground">
            <Shield className="h-3 w-3 mr-1" />
            House Watching
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {property.property_address}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">Owner: {property.owner_name || "Not specified"}</span>
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStartPropertyCheck}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Property Check
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Service
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                End Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Service Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium capitalize">{property.check_frequency}</div>
                <div className="text-xs text-muted-foreground">check frequency</div>
              </div>
            </div>
            {property.monthly_fee && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <div>
                  <div className="text-sm font-medium">${property.monthly_fee}</div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Check Dates */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Last Check:</span>
                <div className="font-medium">
                  {lastCheckDate ? lastCheckDate.toLocaleDateString() : "Not checked"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Next Check:</span>
                <div className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {nextCheckDate ? nextCheckDate.toLocaleDateString() : "Not scheduled"}
                  {isOverdue && <span className="text-xs block text-destructive">Overdue</span>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleScheduleCheck}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleViewReports}
            >
              <Eye className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface OptimizedPropertyGridProps {
  properties?: Property[];
  houseWatchingProperties?: HouseWatchingProperty[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function OptimizedPropertyGrid({ 
  properties = [], 
  houseWatchingProperties = [], 
  isLoading, 
  onRefresh 
}: OptimizedPropertyGridProps) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Properties</h2>
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="shadow-md border-0">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-48 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalProperties = properties.length + houseWatchingProperties.length;
  
  // Debug logging
  console.log("All properties:", properties);
  console.log("House watching properties:", houseWatchingProperties);
  console.log("Properties with property_management service_type:", properties.filter(p => p.service_type === 'property_management'));
  console.log("Properties with house_watching service_type:", properties.filter(p => p.service_type === 'house_watching'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Properties</h2>
          <p className="text-muted-foreground">
            Showing {totalProperties} properties ({properties.filter(p => p.service_type === 'property_management').length} management, {properties.filter(p => p.service_type === 'house_watching').length + houseWatchingProperties.length} house watching)
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-dark"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Building className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
      
      {totalProperties === 0 ? (
        <Card className="p-12 text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first property or house watching service</p>
          <Button 
            className="bg-gradient-primary hover:bg-primary-dark"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Building className="h-4 w-4 mr-2" />
            Add Your First Property
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Property Management Cards - only properties with service_type = 'property_management' */}
          {properties
            .filter(property => property.service_type === 'property_management')
            .map((property) => (
              <PropertyManagementCard key={`pm-${property.id}`} property={property} />
            ))}
          
          {/* House Watching Cards from properties table - properties with service_type = 'house_watching' */}
          {properties
            .filter(property => property.service_type === 'house_watching')
            .map((property) => (
              <HouseWatchingCard key={`hw-props-${property.id}`} property={{
                id: property.id,
                property_address: property.address,
                owner_name: 'Property Owner', // We'll need to get this from relations
                check_frequency: 'weekly', // Default - should be stored in properties or related table
                monthly_fee: property.monthly_rent || 0,
                status: property.status,
                last_check_date: null,
                next_check_date: null,
                user_id: property.user_id,
                start_date: '',
                created_at: property.created_at,
                updated_at: property.updated_at,
                end_date: null,
                notes: null,
                key_location: null,
                emergency_contact: null,
                special_instructions: null,
                owner_contact: null,
              }} />
            ))}
          
          {/* House Watching Cards from house_watching table */}
          {houseWatchingProperties.map((property) => (
            <HouseWatchingCard key={`hw-${property.id}`} property={property} />
          ))}
        </div>
      )}

      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPropertyAdded={() => {
          toast({
            title: "Property Added",
            description: "Your new property has been added to the portfolio.",
          });
          onRefresh?.();
        }}
      />
    </div>
  );
}