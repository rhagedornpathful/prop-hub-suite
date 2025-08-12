import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Home, 
  Phone,
  Navigation,
  Clock,
  Battery,
  Wifi,
  Signal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MobileBottomNavigation from '@/components/mobile/MobileBottomNavigation';

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

interface AssignedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  assigned_date: string;
}

const HouseWatcherPhoneDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isViewingAs } = useUserRole();
  const [assignedProperties, setAssignedProperties] = useState<AssignedProperty[]>([]);
  const [propertyChecks, setPropertyChecks] = useState<PropertyCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadHouseWatcherData();
    }
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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

      if (!houseWatcher && !isViewingAs) {
        toast({
          title: "Not a House Watcher",
          description: "You don't have house watcher permissions assigned.",
          variant: "destructive"
        });
        return;
      }

      // Load sample data for demo purposes or real data if available
      if (isViewingAs && !houseWatcher) {
        // Sample data for demo
        setAssignedProperties([
          {
            id: '1',
            address: '123 Oak Street',
            city: 'Springfield',
            state: 'IL',
            notes: 'Check mail, water plants',
            assigned_date: new Date().toISOString()
          }
        ]);
        
        setPropertyChecks([
          {
            id: '1',
            property_address: '123 Oak Street',
            check_frequency: 'Weekly',
            last_check_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            next_check_date: new Date().toISOString(),
            status: 'pending',
            special_instructions: 'Check all windows and doors',
            monthly_fee: 150
          }
        ]);
      } else if (houseWatcher) {
        // Load real data
        const { data: properties } = await supabase
          .from('house_watcher_properties')
          .select(`
            id,
            notes,
            assigned_date,
            properties!inner (
              id,
              address,
              city,
              state
            )
          `)
          .eq('house_watcher_id', houseWatcher.id)
          .limit(10);

        setAssignedProperties(properties?.map(p => ({
          id: p.properties.id,
          address: p.properties.address,
          city: p.properties.city || 'N/A',
          state: p.properties.state || 'N/A',
          notes: p.notes || '',
          assigned_date: p.assigned_date,
        })) || []);

        const { data: watchingData } = await supabase
          .from('house_watching')
          .select('*')
          .eq('user_id', user?.id)
          .limit(10);

        setPropertyChecks(watchingData || []);
      }
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
        title: "Check Started",
        description: "Beginning home inspection...",
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

  const getCheckPriority = (nextCheckDate: string) => {
    const checkDate = new Date(nextCheckDate);
    
    if (isPast(checkDate)) {
      return { priority: 'overdue', color: 'destructive', label: 'OVERDUE' };
    } else if (isToday(checkDate)) {
      return { priority: 'today', color: 'default', label: 'DUE TODAY' };
    } else if (isTomorrow(checkDate)) {
      return { priority: 'tomorrow', color: 'secondary', label: 'DUE TOMORROW' };
    } else {
      return { priority: 'future', color: 'outline', label: 'UPCOMING' };
    }
  };

  const todaysChecks = propertyChecks.filter(check => 
    isToday(new Date(check.next_check_date)) || isPast(new Date(check.next_check_date))
  );

  const upcomingChecks = propertyChecks.filter(check => 
    !isToday(new Date(check.next_check_date)) && !isPast(new Date(check.next_check_date))
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-2xl"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
          <div className="h-40 bg-muted rounded-2xl"></div>
        </div>
        <MobileBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Phone Status Bar Simulation */}
      <div className="bg-card px-4 py-2 flex items-center justify-between text-xs safe-area-pt">
        <div className="flex items-center gap-1">
          <span className="font-medium">{format(currentTime, 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <Battery className="h-3 w-3" />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Good {
              currentTime.getHours() < 12 ? 'Morning' : 
              currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'
            }</h1>
            <p className="text-sm text-muted-foreground">Ready for your property checks?</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{todaysChecks.length}</div>
            <div className="text-xs text-muted-foreground">Due Today</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-gradient-primary text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{assignedProperties.length}</div>
              <div className="text-sm opacity-90">Properties</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-secondary text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{propertyChecks.length}</div>
              <div className="text-sm opacity-90">Total Checks</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Priority */}
        {todaysChecks.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-warning text-white rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysChecks.map((check) => {
                const priority = getCheckPriority(check.next_check_date);
                return (
                  <div key={check.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{check.property_address}</h4>
                        <p className="text-sm opacity-90">{check.check_frequency}</p>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {priority.label}
                      </Badge>
                    </div>
                    
                    <Button 
                      onClick={() => startHomeCheck(check.id)}
                      className="w-full bg-white text-primary hover:bg-white/90 font-semibold rounded-xl min-h-[52px]"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Start Check Now
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 rounded-xl"
                onClick={() => navigate('/messages')}
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm font-medium">Call Office</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 rounded-xl"
                onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(() => {
                      toast({
                        title: "Location verified",
                        description: "GPS location confirmed"
                      });
                    });
                  }
                }}
              >
                <Navigation className="h-6 w-6" />
                <span className="text-sm font-medium">GPS Check</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Properties */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              My Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedProperties.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No properties assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedProperties.slice(0, 3).map((property) => (
                  <div key={property.id} className="p-4 border border-border rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{property.address}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.city}, {property.state}
                        </p>
                        {property.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{property.notes}</p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => startHomeCheck(property.id)}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Check
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Checks */}
        {upcomingChecks.length > 0 && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingChecks.map((check) => (
                  <div key={check.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{check.property_address}</h4>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(check.next_check_date), 'MMM dd')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {check.check_frequency}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileBottomNavigation />
    </div>
  );
};

export default HouseWatcherPhoneDashboard;