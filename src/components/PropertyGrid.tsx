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
  Shield
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
}

type Property = PropertyManagementProperty | HouseWatchingProperty;

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Sunset Apartments",
    address: "123 Main St, Downtown",
    type: "Apartment Complex",
    units: 24,
    occupiedUnits: 22,
    monthlyRent: 1200,
    status: "occupied",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    serviceType: "property_management"
  },
  {
    id: "2", 
    name: "Oak Tree Condos",
    address: "456 Oak Ave, Midtown",
    type: "Condominium",
    units: 12,
    occupiedUnits: 10,
    monthlyRent: 1800,
    status: "occupied",
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&h=300&fit=crop",
    serviceType: "property_management"
  },
  {
    id: "3",
    name: "Garden View Townhomes",
    address: "789 Garden Rd, Suburbs",
    type: "Townhouse",
    units: 8,
    occupiedUnits: 6,
    monthlyRent: 2200,
    status: "occupied",
    image: "https://images.unsplash.com/photo-1558618666-fccd4c84cd3d?w=400&h=300&fit=crop",
    serviceType: "property_management"
  },
  {
    id: "4",
    name: "Riverside Estate",
    address: "654 River Walk, Waterfront",
    checkFrequency: "weekly",
    monthlyFee: 180,
    status: "active",
    lastCheckDate: "2024-01-08",
    nextCheckDate: "2024-01-15",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop",
    serviceType: "house_watching"
  },
  {
    id: "5",
    name: "Highland Estates",
    address: "987 Highland Dr, Suburbs",
    type: "Single Family",
    units: 1,
    occupiedUnits: 0,
    monthlyRent: 3200,
    status: "maintenance",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop",
    serviceType: "property_management"
  },
  {
    id: "6",
    name: "Lakeside Cabin",
    address: "321 Lake Shore Dr, Mountain View",
    checkFrequency: "bi-weekly",
    monthlyFee: 240,
    status: "active",
    lastCheckDate: "2024-01-05",
    nextCheckDate: "2024-01-19",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
    serviceType: "house_watching"
  }
];

const PropertyCard = ({ property, onClick, onEdit, onDelete }: { 
  property: Property; 
  onClick: () => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}) => {
  const isPropertyManagement = property.serviceType === "property_management";
  const isHouseWatching = property.serviceType === "house_watching";
  
  // Property Management specific calculations
  const occupancyRate = isPropertyManagement 
    ? (property.occupiedUnits / property.units) * 100 
    : 0;
  
  // Status colors for different service types
  const propertyManagementStatusColors = {
    occupied: "bg-success text-success-foreground",
    vacant: "bg-warning text-warning-foreground",  
    maintenance: "bg-destructive text-destructive-foreground"
  };
  
  const houseWatchingStatusColors = {
    active: "bg-success text-success-foreground",
    inactive: "bg-muted text-muted-foreground",
    pending: "bg-warning text-warning-foreground"
  };

  const propertyManagementStatusText = {
    occupied: "Occupied",
    vacant: "Vacant", 
    maintenance: "Maintenance"
  };
  
  const houseWatchingStatusText = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending"
  };

  const statusColors = isPropertyManagement ? propertyManagementStatusColors : houseWatchingStatusColors;
  const statusText = isPropertyManagement ? propertyManagementStatusText : houseWatchingStatusText;

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[property.status as keyof typeof statusColors]}>
            {statusText[property.status as keyof typeof statusText]}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 text-foreground border-white/50">
            {isPropertyManagement ? property.type : 
             isHouseWatching ? `${property.checkFrequency} checks` : "House Watching"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-primary text-primary-foreground">
            {isPropertyManagement ? (
              <Building className="h-3 w-3 mr-1" />
            ) : (
              <Shield className="h-3 w-3 mr-1" />
            )}
            {isPropertyManagement ? "Property Mgmt" : "House Watching"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {property.name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.address}</span>
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
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(property);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => {
                e.stopPropagation();
                onDelete(property);
              }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {isPropertyManagement && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{property.units} Units</div>
                    <div className="text-xs text-muted-foreground">
                      {property.occupiedUnits} occupied
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <div>
                    <div className="text-sm font-medium">${property.monthlyRent}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-medium">{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Tenants
                </Button>
              </div>
            </>
          )}
          
          {isHouseWatching && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium capitalize">{property.checkFrequency}</div>
                    <div className="text-xs text-muted-foreground">check frequency</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <div>
                    <div className="text-sm font-medium">${property.monthlyFee}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last Check:</span>
                    <div className="font-medium">{property.lastCheckDate}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Check:</span>
                    <div className="font-medium">{property.nextCheckDate}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function PropertyGrid() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const { toast } = useToast();

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      // In a real app, you would delete from the database here
      toast({
        title: "Property Deleted",
        description: `${propertyToDelete.name} has been removed from your portfolio.`,
      });
      setIsDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handlePropertyAdded = () => {
    toast({
      title: "Property Added",
      description: "Your new property has been added to the portfolio.",
    });
  };

  const handlePropertyUpdated = () => {
    toast({
      title: "Property Updated",
      description: "Property details have been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Properties</h2>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-dark"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Building className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property}
            onClick={() => handlePropertyClick(property)}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
          />
        ))}
      </div>

      <PropertyDetailsDialog
        property={selectedProperty}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
      />

      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPropertyAdded={handlePropertyAdded}
      />

      <AddPropertyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPropertyAdded={handlePropertyUpdated}
        editProperty={selectedProperty}
        mode="edit"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}