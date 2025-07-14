import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
  FileText,
  TrendingUp,
  Clock
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
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleManageTenants = () => {
    onOpenChange(false);
    navigate('/tenants');
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(property);
    } else {
      toast({
        title: "Edit Property",
        description: "Edit functionality not available for this property type.",
      });
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(property);
    } else {
      toast({
        title: "Delete Property",
        description: "Delete functionality not available for this property type.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-bold">{property.address}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{getDisplayAddress()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={statusColors[property.status as keyof typeof statusColors] || statusColors.inactive}>
                {statusText[property.status as keyof typeof statusText] || property.status}
              </Badge>
              <Badge className="bg-primary text-primary-foreground">
                <Building className="h-3 w-3 mr-1" />
                {property.service_type === 'house_watching' ? 'House Watching' : 'Property Management'}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Key Property Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-subtle rounded-lg p-6 border">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-6 w-6 text-success" />
                <span className="font-medium text-lg">Monthly Income</span>
              </div>
              <p className="text-2xl font-bold text-success">{formatCurrency(property.monthly_rent)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {property.service_type === 'house_watching' ? 'Service fee' : 'Rental income'}
              </p>
            </div>
            
            {property.estimated_value && (
              <div className="bg-gradient-subtle rounded-lg p-6 border">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="font-medium text-lg">Property Value</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(property.estimated_value)}</p>
                <p className="text-sm text-muted-foreground mt-1">Estimated market value</p>
              </div>
            )}
            
            {property.rent_estimate && (
              <div className="bg-gradient-subtle rounded-lg p-6 border">
                <div className="flex items-center gap-3 mb-2">
                  <Home className="h-6 w-6 text-warning" />
                  <span className="font-medium text-lg">Rent Estimate</span>
                </div>
                <p className="text-2xl font-bold text-warning">{formatCurrency(property.rent_estimate)}</p>
                <p className="text-sm text-muted-foreground mt-1">Market rental estimate</p>
              </div>
            )}
          </div>

          {/* Property Image and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Property Type */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Property Type</span>
                </div>
                <p className="text-xl capitalize bg-muted px-4 py-2 rounded-lg">
                  {property.property_type?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>
              
              {/* Property Specs */}
              {(property.bedrooms || property.bathrooms || property.square_feet) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Specifications</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {property.bedrooms && (
                      <div className="bg-muted px-4 py-3 rounded-lg text-center">
                        <Bed className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-semibold">{property.bedrooms}</div>
                        <div className="text-sm text-muted-foreground">Bedrooms</div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="bg-muted px-4 py-3 rounded-lg text-center">
                        <Bath className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-semibold">{property.bathrooms}</div>
                        <div className="text-sm text-muted-foreground">Bathrooms</div>
                      </div>
                    )}
                    {property.square_feet && (
                      <div className="bg-muted px-4 py-3 rounded-lg text-center">
                        <Square className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-semibold">{property.square_feet.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Sq Ft</div>
                      </div>
                    )}
                  </div>
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
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            <Button variant="outline" onClick={handleManageTenants}>
              <Users className="h-4 w-4 mr-2" />
              Manage Tenants
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleDeleteClick}
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