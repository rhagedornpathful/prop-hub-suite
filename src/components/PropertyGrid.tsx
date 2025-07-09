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
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  units: number;
  occupiedUnits: number;
  monthlyRent: number;
  status: "occupied" | "vacant" | "maintenance";
  image: string;
}

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
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop"
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
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&h=300&fit=crop"
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
    image: "https://images.unsplash.com/photo-1558618666-fccd4c84cd3d?w=400&h=300&fit=crop"
  },
  {
    id: "4",
    name: "City Plaza Lofts",
    address: "321 City Plaza, Downtown",
    type: "Loft",
    units: 16,
    occupiedUnits: 14,
    monthlyRent: 2500,
    status: "occupied",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop"
  },
  {
    id: "5",
    name: "Riverside Studios",
    address: "654 River Walk, Waterfront",
    type: "Studio",
    units: 20,
    occupiedUnits: 15,
    monthlyRent: 900,
    status: "vacant",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop"
  },
  {
    id: "6",
    name: "Highland Estates",
    address: "987 Highland Dr, Suburbs",
    type: "Single Family",
    units: 1,
    occupiedUnits: 0,
    monthlyRent: 3200,
    status: "maintenance",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop"
  }
];

const PropertyCard = ({ property }: { property: Property }) => {
  const occupancyRate = (property.occupiedUnits / property.units) * 100;
  
  const statusColors = {
    occupied: "bg-success text-success-foreground",
    vacant: "bg-warning text-warning-foreground",  
    maintenance: "bg-destructive text-destructive-foreground"
  };

  const statusText = {
    occupied: "Occupied",
    vacant: "Vacant", 
    maintenance: "Maintenance"
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[property.status]}>
            {statusText[property.status]}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 text-foreground border-white/50">
            {property.type}
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
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
        </div>
      </CardContent>
    </Card>
  );
};

export function PropertyGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Properties</h2>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Building className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}