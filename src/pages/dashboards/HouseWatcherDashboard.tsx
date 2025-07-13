import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, CheckCircle, AlertTriangle, Eye, Camera, FileText, Home, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';

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
}

interface PropertyCheck {
  id: string;
  property_address: string;
  check_frequency: string;
  last_check_date: string;
  next_check_date: string;
  status: string;
  special_instructions: string;
  monthly_fee: number;
}

const HouseWatcherDashboard = () => {
  const { user } = useAuth();
  const [assignedProperties, setAssignedProperties] = useState<AssignedProperty[]>([]);
  const [propertyChecks, setPropertyChecks] = useState<PropertyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHouseWatcherData();
    }
  }, [user]);

  const loadHouseWatcherData = async () => {
    try {
      setLoading(true);

      // Get house watcher record
      const { data: houseWatcher } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!houseWatcher) {
        toast({
          title: "Not a House Watcher",
          description: "You don't have house watcher permissions assigned.",
          variant: "destructive"
        });
        return;
      }

      // Load assigned properties with property details
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
            bathrooms
          )
        `)
        .eq('house_watcher_id', houseWatcher.id);

      if (propertiesError) throw propertiesError;

      const formattedProperties = properties?.map(p => ({
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
      })) || [];

      setAssignedProperties(formattedProperties);

      // Load house watching schedules
      const { data: watchingData, error: watchingError } = await supabase
        .from('house_watching')
        .select('*')
        .eq('user_id', user?.id);

      if (watchingError) throw watchingError;
      setPropertyChecks(watchingData || []);

    } catch (error: any) {
      toast({
        title: "Error Loading Data",
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

      loadHouseWatcherData();
    } catch (error: any) {
      toast({
        title: "Error Starting Check",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCheckPriority = (nextCheckDate: string) => {
    const checkDate = new Date(nextCheckDate);
    const now = new Date();
    
    if (isPast(checkDate)) {
      return { priority: 'overdue', color: 'destructive', label: 'Overdue' };
    } else if (isToday(checkDate)) {
      return { priority: 'today', color: 'default', label: 'Due Today' };
    } else if (isTomorrow(checkDate)) {
      return { priority: 'tomorrow', color: 'secondary', label: 'Due Tomorrow' };
    } else if (differenceInDays(checkDate, now) <= 7) {
      return { priority: 'week', color: 'outline', label: 'Due This Week' };
    } else {
      return { priority: 'future', color: 'outline', label: 'Upcoming' };
    }
  };

  const sortedChecks = propertyChecks.sort((a, b) => {
    const dateA = new Date(a.next_check_date);
    const dateB = new Date(b.next_check_date);
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Properties & Tasks</h1>
          <p className="text-muted-foreground">Properties assigned to you and scheduled property checks</p>
        </div>
        <Button onClick={loadHouseWatcherData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* To-Do Section - Property Checks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Property Checks To-Do</h2>
          <Badge variant="secondary">{sortedChecks.length}</Badge>
        </div>

        {sortedChecks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No property checks scheduled</p>
              <p className="text-sm text-muted-foreground mt-2">Check with your administrator to get property watch assignments.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedChecks.map((check) => {
              const priority = getCheckPriority(check.next_check_date);
              return (
                <Card key={check.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{check.property_address}</h3>
                          <Badge variant={priority.color as any}>{priority.label}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(check.next_check_date), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {check.check_frequency || 'No frequency set'}
                          </span>
                          {check.monthly_fee && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${check.monthly_fee}
                            </span>
                          )}
                        </div>

                        {check.special_instructions && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm">
                              <strong>Instructions:</strong> {check.special_instructions}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => startPropertyCheck(check.id)}
                          className="w-full"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Start Check
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Assigned Properties Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          <h2 className="text-xl font-semibold">My Assigned Properties</h2>
          <Badge variant="secondary">{assignedProperties.length}</Badge>
        </div>

        {assignedProperties.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No properties assigned</p>
              <p className="text-sm text-muted-foreground mt-2">Contact your administrator to get property assignments.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold leading-tight">{property.address}</h3>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state} {property.zip_code}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{property.property_type}</Badge>
                    {property.monthly_rent && (
                      <div className="text-right">
                        <p className="text-lg font-semibold">${property.monthly_rent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    )}
                  </div>

                  {(property.bedrooms || property.bathrooms) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.bedrooms && (
                        <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                      )}
                      {property.bathrooms && (
                        <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  )}

                  {property.notes && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <strong>Notes:</strong> {property.notes}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Assigned: {format(new Date(property.assigned_date), 'MMM dd, yyyy')}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseWatcherDashboard;