import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Eye,
  Calendar,
  Shield,
  Clock,
  Plus
} from "lucide-react";

interface Property {
  id: string;
  address: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  monthly_rent: number;
  status: string;
}

interface HouseWatchingProperty {
  id: string;
  property_address: string;
  owner_name: string;
  check_frequency: string;
  status: string;
  next_check_date: string;
  monthly_fee: number;
}

export function CombinedPropertyOverview() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [houseWatchingProperties, setHouseWatchingProperties] = useState<HouseWatchingProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch regular properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .limit(6);

      if (propertiesError) throw propertiesError;

      // Fetch house watching properties
      const { data: houseWatchingData, error: houseWatchingError } = await supabase
        .from('house_watching')
        .select('*')
        .limit(6);

      if (houseWatchingError) throw houseWatchingError;

      setProperties(propertiesData || []);
      setHouseWatchingProperties(houseWatchingData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {property.address}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.property_type}</span>
            </div>
          </div>
          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">{property.bedrooms}BR/{property.bathrooms}BA</div>
                <div className="text-xs text-muted-foreground">Bedrooms/Baths</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <div>
                <div className="text-sm font-medium">${property.monthly_rent}</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const HouseWatchingCard = ({ property }: { property: HouseWatchingProperty }) => {
    const nextCheckDate = property.next_check_date ? new Date(property.next_check_date) : null;
    const isOverdue = nextCheckDate && nextCheckDate < new Date();
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {property.property_address}
              </CardTitle>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Owner: {property.owner_name}</span>
              </div>
            </div>
            <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{property.check_frequency}</div>
                  <div className="text-xs text-muted-foreground">Check frequency</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <div>
                  <div className="text-sm font-medium">${property.monthly_fee}</div>
                  <div className="text-xs text-muted-foreground">monthly fee</div>
                </div>
              </div>
            </div>
            
            {nextCheckDate && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    Next check: {nextCheckDate.toLocaleDateString()}
                  </div>
                  {isOverdue && (
                    <div className="text-xs text-destructive">Overdue</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-lg"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Property Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Property Management</h2>
            <p className="text-muted-foreground">Your rental properties and tenant management</p>
          </div>
          <Button className="bg-gradient-primary hover:bg-primary-dark">
            <Building className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
        
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first rental property</p>
            <Button className="bg-gradient-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </Card>
        )}
      </div>

      {/* House Watching Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">House Watching</h2>
            <p className="text-muted-foreground">Properties you're monitoring for owners</p>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Add House Watch
          </Button>
        </div>
        
        {houseWatchingProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houseWatchingProperties.map((property) => (
              <HouseWatchingCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed border-2">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No House Watching Services</h3>
            <p className="text-muted-foreground mb-4">Start monitoring properties for homeowners</p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add House Watch Service
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}