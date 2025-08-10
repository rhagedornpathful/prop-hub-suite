import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Eye, Camera, FileText, Home, DollarSign, Search, Calendar, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { HouseWatcherMobileNavigation } from '@/components/HouseWatcherMobileNavigation';
import { PropertiesGridSkeleton } from '@/components/HouseWatcherLoadingStates';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface AssignedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  notes: string;
  assigned_date: string;
  monthly_rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  gate_code?: string;
  // From house_watching table
  house_watching?: {
    id: string;
    check_frequency: string;
    last_check_date: string;
    next_check_date: string;
    monthly_fee: number;
    owner_name: string;
    owner_contact: string;
    emergency_contact: string;
    special_instructions: string;
    key_location: string;
  };
}

const HouseWatcherProperties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isViewingAs } = useUserRole();
  const { isMobile } = useMobileDetection();
  const [assignedProperties, setAssignedProperties] = useState<AssignedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadAssignedProperties();
    }
  }, [user]);

  const loadAssignedProperties = async () => {
    try {
      setLoading(true);

      // Get house watcher record
      const { data: houseWatcher } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!houseWatcher && !isViewingAs) {
        toast({
          title: "Not a House Watcher",
          description: "You don't have house watcher permissions assigned.",
          variant: "destructive"
        });
        return;
      }

      if (isViewingAs && !houseWatcher) {
        // Load sample properties for View As mode
        const { data: sampleProperties, error: sampleError } = await supabase
          .from('properties')
          .select('*')
          .limit(3);

        if (sampleError) throw sampleError;

        const formattedSampleProperties = sampleProperties?.map(p => ({
          id: p.id,
          address: p.address,
          city: p.city || 'N/A',
          state: p.state || 'N/A',
          zip_code: p.zip_code || 'N/A',
          property_type: p.property_type || 'Unknown',
          notes: 'Sample assignment for demo purposes',
          assigned_date: new Date().toISOString(),
          monthly_rent: p.monthly_rent,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          gate_code: p.gate_code,
        })) || [];

        setAssignedProperties(formattedSampleProperties);
      } else if (houseWatcher) {
        // Load actual assigned properties
        const { data: properties, error: propertiesError } = await supabase
          .from('house_watcher_properties')
          .select(`
            id,
            notes,
            assigned_date,
            properties!inner (
              id,
              address,
              city,
              state,
              zip_code,
              property_type,
              monthly_rent,
              bedrooms,
              bathrooms,
              gate_code
            )
          `)
          .eq('house_watcher_id', houseWatcher.id);

        if (propertiesError) throw propertiesError;

        // Get house watching details for each property
        const propertyIds = properties?.map(p => p.properties.id) || [];
        const { data: watchingData } = await supabase
          .from('house_watching')
          .select('*')
          .in('id', propertyIds);

        const formattedProperties = properties?.map(p => {
          const watching = watchingData?.find(w => w.id === p.properties.id);
          return {
            id: p.properties.id,
            address: p.properties.address,
            city: p.properties.city || 'N/A',
            state: p.properties.state || 'N/A',
            zip_code: p.properties.zip_code || 'N/A',
            property_type: p.properties.property_type || 'Unknown',
            notes: p.notes || '',
            assigned_date: p.assigned_date,
            monthly_rent: p.properties.monthly_rent,
            bedrooms: p.properties.bedrooms,
            bathrooms: p.properties.bathrooms,
            gate_code: p.properties.gate_code,
            house_watching: watching ? {
              id: watching.id,
              check_frequency: watching.check_frequency,
              last_check_date: watching.last_check_date,
              next_check_date: watching.next_check_date,
              monthly_fee: watching.monthly_fee,
              owner_name: watching.owner_name,
              owner_contact: watching.owner_contact,
              emergency_contact: watching.emergency_contact,
              special_instructions: watching.special_instructions,
              key_location: watching.key_location,
            } : undefined
          };
        }) || [];

        setAssignedProperties(formattedProperties);
      }

    } catch (error: any) {
      toast({
        title: "Error Loading Properties",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startHomeCheck = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('home_check_sessions')
        .insert({
          property_id: propertyId,
          user_id: user?.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Home Check Started",
        description: "You can now begin documenting your home inspection.",
      });

      navigate(`/home-check/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error Starting Check",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const viewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const filteredProperties = assignedProperties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <PropertiesGridSkeleton />
        {isMobile && <HouseWatcherMobileNavigation />}
      </>
    );
  }

  return (
    <div className={`space-y-8 ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Assigned Properties</h1>
          <p className="text-muted-foreground">
            Properties under your care • {assignedProperties.length} total
          </p>
        </div>
        <Button onClick={() => navigate('/house-watcher-home')} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Schedule
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search properties..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Badge variant="secondary">
            {filteredProperties.length} properties
          </Badge>
          <Badge variant="outline">
            Total Revenue: ${assignedProperties.reduce((sum, p) => sum + (p.house_watching?.monthly_fee || 0), 0).toLocaleString()}/month
          </Badge>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No properties match your search' : 'No properties assigned'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Contact your administrator to get property assignments.'
              }
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-tight">{property.address}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.city}, {property.state} {property.zip_code}
                    </p>
                  </div>
                  <Badge variant="outline">{property.property_type}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Property Details */}
                <div className="grid grid-cols-2 gap-4">
                  {property.bedrooms && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Bedrooms:</span>
                      <div className="font-medium">{property.bedrooms}</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Bathrooms:</span>
                      <div className="font-medium">{property.bathrooms}</div>
                    </div>
                  )}
                </div>

                {/* House Watching Info */}
                {property.house_watching && (
                  <div className="p-3 bg-muted rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Check Schedule</span>
                      <Badge variant="secondary">${property.house_watching.monthly_fee}/month</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Frequency: {property.house_watching.check_frequency}</div>
                      {property.house_watching.next_check_date && (
                        <div>Next Check: {format(new Date(property.house_watching.next_check_date), 'MMM dd, yyyy')}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Owner Contact Info */}
                {property.house_watching?.owner_name && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm font-medium mb-1">Owner Contact</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {property.house_watching.owner_name}
                      </div>
                      {property.house_watching.owner_contact && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {property.house_watching.owner_contact}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {property.house_watching?.special_instructions && (
                  <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</div>
                    <div className="text-sm text-yellow-700">
                      {property.house_watching.special_instructions}
                    </div>
                  </div>
                )}

                {/* Key Location */}
                {property.house_watching?.key_location && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Key Location:</span>
                    <div className="font-medium">{property.house_watching.key_location}</div>
                  </div>
                )}

                {/* Gate Code */}
                {property.gate_code && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Gate Code:</span>
                    <div className="font-medium font-mono">{property.gate_code}</div>
                  </div>
                )}

                {/* Assignment Notes */}
                {property.notes && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm font-medium mb-1">Assignment Notes</div>
                    <div className="text-sm text-muted-foreground">{property.notes}</div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Assigned: {format(new Date(property.assigned_date), 'MMM dd, yyyy')}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => viewProperty(property.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => startHomeCheck(property.id)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {isMobile && <HouseWatcherMobileNavigation />}
    </div>
  );
};

export default HouseWatcherProperties;