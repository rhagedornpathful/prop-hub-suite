import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialog } from "@/components/mobile/MobileDialog";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  Shield,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react";

interface PropertyManagementProperty {
  id: string;
  name: string;
  address: string;
  type: string;
  units: number;
  occupiedUnits: number;
  monthlyRent: number;
  status: "occupied" | "vacant" | "maintenance";
  image: string;
  serviceType: "property_management";
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company_name?: string;
  };
}

interface HouseWatchingProperty {
  id: string;
  name: string;
  address: string;
  checkFrequency: "weekly" | "bi-weekly" | "monthly";
  monthlyFee: number;
  status: "active" | "inactive" | "pending";
  lastCheckDate: string;
  nextCheckDate: string;
  image: string;
  serviceType: "house_watching";
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company_name?: string;
  };
}

type Property = PropertyManagementProperty | HouseWatchingProperty;

interface PropertyDetailsDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyDetailsDialog({ property, open, onOpenChange, onEdit, onDelete }: PropertyDetailsDialogProps) {
  if (!property) return null;

  const isPropertyManagement = property.serviceType === "property_management";
  const isHouseWatching = property.serviceType === "house_watching";
  
  const occupancyRate = isPropertyManagement 
    ? (property.occupiedUnits / property.units) * 100 
    : 0;

  const statusColors = {
    occupied: "bg-success text-success-foreground",
    vacant: "bg-warning text-warning-foreground",  
    maintenance: "bg-destructive text-destructive-foreground",
    active: "bg-success text-success-foreground",
    inactive: "bg-muted text-muted-foreground",
    pending: "bg-warning text-warning-foreground"
  };

  const statusText = {
    occupied: "Occupied",
    vacant: "Vacant", 
    maintenance: "Under Maintenance",
    active: "Active Monitoring",
    inactive: "Inactive",
    pending: "Pending Setup"
  };

  const isMobile = useMobileDetection();
  const DialogWrapper = isMobile ? MobileDialog : Dialog;
  const ContentWrapper = isMobile ? "div" : DialogContent;

  return (
    <DialogWrapper open={open} onOpenChange={onOpenChange}>
      <ContentWrapper className={isMobile ? "p-4" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{property.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Image and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.name}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={statusColors[property.status as keyof typeof statusColors]}>
                    {statusText[property.status as keyof typeof statusText]}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-primary text-primary-foreground">
                    {isPropertyManagement ? (
                      <Building className="h-3 w-3 mr-1" />
                    ) : (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    {isPropertyManagement ? "Property Management" : "House Watching"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{property.address}</span>
              </div>
              
              {isPropertyManagement && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <span className="font-medium">Property Type</span>
                      </div>
                      <p className="text-lg">{property.type}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        <span className="font-medium">Monthly Rent</span>
                      </div>
                      <p className="text-lg font-semibold">${property.monthlyRent.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Occupancy</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{property.occupiedUnits} of {property.units} units occupied</span>
                        <span className="font-semibold">{occupancyRate.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {isHouseWatching && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="font-medium">Check Frequency</span>
                      </div>
                      <p className="text-lg capitalize">{property.checkFrequency}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        <span className="font-medium">Monthly Fee</span>
                      </div>
                      <p className="text-lg font-semibold">${property.monthlyFee}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-medium">Last Check</span>
                      </div>
                      <p className="text-lg">{property.lastCheckDate}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-success" />
                        <span className="font-medium">Next Check</span>
                      </div>
                      <p className="text-lg">{property.nextCheckDate}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Additional Details */}
          {isPropertyManagement && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Bed className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="text-lg font-semibold">3-4</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Bath className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="text-lg font-semibold">2-3</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Square className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sq Ft</p>
                    <p className="text-lg font-semibold">1,200+</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isHouseWatching && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Monitoring Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Security Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Regular security checks</li>
                    <li>• Property maintenance monitoring</li>
                    <li>• Emergency response protocol</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>owner@example.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Owner Details Card */}
          {property.owner && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Property Owner</h3>
              <div className="p-4 bg-muted rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {property.owner.company_name || property.owner.name}
                        </h4>
                        {property.owner.company_name && (
                          <p className="text-sm text-muted-foreground">{property.owner.name}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{property.owner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{property.owner.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/demo/property-owners/${property.owner.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onEdit?.(property)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            {isPropertyManagement && (
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Tenants
              </Button>
            )}
            {isHouseWatching && (
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Check
              </Button>
            )}
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete?.(property)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </DialogWrapper>
  );
}