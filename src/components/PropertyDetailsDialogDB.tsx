import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Edit,
  Trash2,
  UserCheck,
  Home,
  Tag,
  FileText
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<'properties'>;

interface PropertyDetailsDialogDBProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyDetailsDialogDB({ property, open, onOpenChange, onEdit, onDelete }: PropertyDetailsDialogDBProps) {
  if (!property) return null;

  const statusColors = {
    active: "bg-success text-success-foreground",
    vacant: "bg-warning text-warning-foreground",  
    maintenance: "bg-destructive text-destructive-foreground",
    inactive: "bg-muted text-muted-foreground",
  };

  const statusText = {
    active: "Active",
    vacant: "Vacant", 
    maintenance: "Under Maintenance",
    inactive: "Inactive",
  };

  const getDisplayAddress = () => {
    const parts = [property.street_address || property.address, property.city, property.state, property.zip_code].filter(Boolean);
    return parts.join(', ');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not set';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{property.address}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Image and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gradient-subtle border">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.address}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Building className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={statusColors[property.status as keyof typeof statusColors] || statusColors.inactive}>
                    {statusText[property.status as keyof typeof statusText] || property.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-primary text-primary-foreground">
                    <Building className="h-3 w-3 mr-1" />
                    {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{getDisplayAddress()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="font-medium">Property Type</span>
                  </div>
                  <p className="text-lg capitalize">{property.property_type?.replace('_', ' ') || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-success" />
                    <span className="font-medium">Monthly Rent</span>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(property.monthly_rent)}</p>
                </div>
              </div>
              
              {property.bedrooms || property.bathrooms || property.square_feet ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    <span className="font-medium">Property Details</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                    )}
                    {property.square_feet && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.square_feet.toLocaleString()} sq ft</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {property.estimated_value && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-success" />
                    <span className="font-medium">Estimated Value</span>
                  </div>
                  <p className="text-lg font-semibold text-success">{formatCurrency(property.estimated_value)}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Specifications */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Specifications</h4>
                <div className="space-y-3">
                  {property.year_built && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built:</span>
                      <span className="font-medium">{property.year_built}</span>
                    </div>
                  )}
                  {property.lot_size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot Size:</span>
                      <span className="font-medium">{property.lot_size}</span>
                    </div>
                  )}
                  {property.gate_code && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gate Code:</span>
                      <span className="font-medium font-mono">{property.gate_code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {amenity.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">Description</span>
                </div>
                <p className="text-muted-foreground">{property.description}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onEdit?.(property)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Tenants
            </Button>
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
      </DialogContent>
    </Dialog>
  );
}