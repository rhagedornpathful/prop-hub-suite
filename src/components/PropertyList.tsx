import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  ClipboardCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchedulePropertyCheckDialog } from "@/components/SchedulePropertyCheckDialog";
import { useNavigate } from "react-router-dom";

interface PropertyListProps {
  properties?: any[];
  isLoading?: boolean;
  onEdit?: (property: any) => void;
  onDelete?: (property: any) => void;
  onView?: (property: any) => void;
}

export function PropertyList({ properties = [], isLoading, onEdit, onDelete, onView }: PropertyListProps) {
  const navigate = useNavigate();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  if (isLoading) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No properties found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const transformedProperties = properties.map(prop => ({
    id: prop.id,
    name: prop.address,
    address: prop.address,
    type: prop.property_type || 'Unknown',
    monthlyRent: prop.monthly_rent || 0,
    status: prop.status === 'active' ? 'Active' : 'Inactive',
    serviceType: prop.service_type || 'property_management',
    bedrooms: prop.bedrooms || 0,
    bathrooms: prop.bathrooms || 0,
    squareFeet: prop.square_feet || 0,
    _dbData: prop
  }));

  return (
    <Card className="shadow-md border-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformedProperties.map((property) => (
              <TableRow key={property.id} className="hover:bg-muted/50">
                <TableCell className="py-4">
                  <div>
                    <div className="font-medium text-foreground">{property.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {property.address}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {property.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="font-medium">${property.monthlyRent.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {property.bedrooms > 0 && `${property.bedrooms} bed • `}
                    {property.bathrooms > 0 && `${property.bathrooms} bath`}
                    {property.squareFeet > 0 && ` • ${property.squareFeet} sq ft`}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      property.status === 'Active' 
                        ? "bg-success text-success-foreground" 
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {property.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary text-primary-foreground">
                    {property.serviceType === 'property_management' ? (
                      <>
                        <Building className="h-3 w-3 mr-1" />
                        Property Mgmt
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        House Watching
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(property)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/property-check?property=${property.id}`)}>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Start Property Check
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedProperty(property);
                        setScheduleDialogOpen(true);
                      }}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Property Check
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(property)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Property
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(property)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Property
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      {selectedProperty && (
        <SchedulePropertyCheckDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          propertyId={selectedProperty.id}
          propertyAddress={selectedProperty.address}
        />
      )}
    </Card>
  );
}