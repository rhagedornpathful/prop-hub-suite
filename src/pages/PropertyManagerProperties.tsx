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

import { PropertiesGridSkeleton } from '@/components/PropertyManagerLoadingStates';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface ManagedProperty {
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
  // Property management details
  property_management?: {
    id: string;
    check_frequency: string;
    last_check_date: string;
    next_check_date: string;
    monthly_fee: number;
    owner_name: string;
    owner_contact: string;
    emergency_contact: string;
    special_instructions: string;
    service_notes: string;
  };
}

const PropertyManagerProperties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isViewingAs } = useUserRole();
  const { isMobile } = useMobileDetection();
  const [managedProperties, setManagedProperties] = useState<ManagedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadManagedProperties();
    }
  }, [user]);

  const loadManagedProperties = async () => {
    try {
      setLoading(true);

      // Load all properties managed by property manager or sample data
      if (isViewingAs) {
        // Load sample properties for View As mode
        const { data: sampleProperties, error: sampleError } = await supabase
          .from('properties')
          .select('*')
          .limit(5);

        if (sampleError) throw sampleError;

        const formattedSampleProperties = sampleProperties?.map(p => ({
          id: p.id,
          address: p.address,
          city: p.city || 'N/A',
          state: p.state || 'N/A',
          zip_code: p.zip_code || 'N/A',
          property_type: p.property_type || 'Unknown',
          notes: 'Sample property management assignment',
          assigned_date: new Date().toISOString(),
          monthly_rent: p.monthly_rent,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          gate_code: p.gate_code,
        })) || [];

        setManagedProperties(formattedSampleProperties);
      } else {
        // Load actual managed properties based on property manager assignments
        const { data: assignments, error: assignmentsError } = await supabase
          .from('property_manager_assignments')
          .select(`
            id,
            assigned_at,
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
          .eq('manager_user_id', user?.id);

        if (assignmentsError) throw assignmentsError;

        // Get property service assignments for additional management details
        const propertyIds = assignments?.map(a => a.properties.id) || [];
        const { data: serviceData } = await supabase
          .from('property_service_assignments')
          .select('*')
          .in('property_id', propertyIds);

        const formattedProperties = assignments?.map(a => {
          const service = serviceData?.find(s => s.property_id === a.properties.id);
          return {
            id: a.properties.id,
            address: a.properties.address,
            city: a.properties.city || 'N/A',
            state: a.properties.state || 'N/A',
            zip_code: a.properties.zip_code || 'N/A',
            property_type: a.properties.property_type || 'Unknown',
            notes: '',
            assigned_date: a.assigned_at,
            monthly_rent: a.properties.monthly_rent,
            bedrooms: a.properties.bedrooms,
            bathrooms: a.properties.bathrooms,
            gate_code: a.properties.gate_code,
            property_management: service ? {
              id: service.id,
              check_frequency: 'monthly', // Default
              last_check_date: '',
              next_check_date: '',
              monthly_fee: service.monthly_fee,
              owner_name: '',
              owner_contact: '',
              emergency_contact: '',
              special_instructions: '',
              service_notes: '',
            } : undefined
          };
        }) || [];

        setManagedProperties(formattedProperties);
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

  const startPropertyCheck = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_check_sessions')
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
        title: "Property Check Started",
        description: "You can now begin documenting your property inspection.",
      });

      navigate(`/property-check/${data.id}`);
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

  const filteredProperties = managedProperties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <PropertiesGridSkeleton />;
  }

  return (
    <div className={`space-y-8 ${isMobile ? 'pb-20' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Managed Properties</h1>
          <p className="text-muted-foreground">
            Properties under your management • {managedProperties.length} total
          </p>
        </div>
        <Button onClick={() => navigate('/property-manager-home')} variant="outline">
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
            Total Revenue: ${managedProperties.reduce((sum, p) => sum + (p.property_management?.monthly_fee || 0), 0).toLocaleString()}/month
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
                : 'Contact your administrator to get property management assignments.'
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
                  {property.monthly_rent && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Monthly Rent:</span>
                      <div className="font-medium">${property.monthly_rent.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Management Info */}
                {property.property_management && (
                  <div className="p-3 bg-muted rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Management Fee</span>
                      <Badge variant="secondary">${property.property_management.monthly_fee}/month</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Check Frequency: {property.property_management.check_frequency}</div>
                      {property.property_management.next_check_date && (
                        <div>Next Check: {format(new Date(property.property_management.next_check_date), 'MMM dd, yyyy')}</div>
                      )}
                    </div>
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
                    <div className="text-sm font-medium mb-1">Management Notes</div>
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
                    onClick={() => startPropertyCheck(property.id)}
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
      
    </div>
  );
};

export default PropertyManagerProperties;