import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, CheckCircle, AlertTriangle, Eye, Camera, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AssignedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  notes: string;
  assigned_date: string;
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

interface CheckSession {
  id: string;
  property_id: string;
  status: string;
  scheduled_date: string;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  general_notes: string;
}

const HouseWatcherDashboard = () => {
  const { user } = useAuth();
  const [assignedProperties, setAssignedProperties] = useState<AssignedProperty[]>([]);
  const [propertyChecks, setPropertyChecks] = useState<PropertyCheck[]>([]);
  const [recentSessions, setRecentSessions] = useState<CheckSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    upcomingChecks: 0,
    completedThisWeek: 0,
    overdueChecks: 0
  });

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

      // Load assigned properties with proper join syntax
      const { data: properties, error: propertiesError } = await supabase
        .from('house_watcher_properties')
        .select(`
          id,
          notes,
          assigned_date,
          property_id,
          properties!inner (
            id,
            address,
            city,
            state,
            zip_code,
            property_type
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
        assigned_date: p.assigned_date
      })) || [];

      setAssignedProperties(formattedProperties);

      // Load house watching schedules
      const { data: watchingData, error: watchingError } = await supabase
        .from('house_watching')
        .select('*')
        .eq('user_id', user?.id);

      if (watchingError) throw watchingError;
      setPropertyChecks(watchingData || []);

      // Load recent check sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('property_check_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;
      setRecentSessions(sessions || []);

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const upcomingChecks = watchingData?.filter(check => 
        check.next_check_date && new Date(check.next_check_date) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      const overdueChecks = watchingData?.filter(check => 
        check.next_check_date && new Date(check.next_check_date) < now
      ).length || 0;

      const completedThisWeek = sessions?.filter(session => 
        session.completed_at && new Date(session.completed_at) >= weekAgo
      ).length || 0;

      setStats({
        totalProperties: formattedProperties.length,
        upcomingChecks,
        completedThisWeek,
        overdueChecks
      });

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

      // Refresh data
      loadHouseWatcherData();
    } catch (error: any) {
      toast({
        title: "Error Starting Check",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (nextCheckDate: string) => {
    const daysUntil = Math.ceil((new Date(nextCheckDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return 'border-red-500 bg-red-50';
    if (daysUntil <= 3) return 'border-orange-500 bg-orange-50';
    if (daysUntil <= 7) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">House Watcher Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned property inspections</p>
        </div>
        <Button onClick={loadHouseWatcherData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Assigned Properties</p>
                <p className="text-2xl font-bold">{stats.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Upcoming Checks</p>
                <p className="text-2xl font-bold">{stats.upcomingChecks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed This Week</p>
                <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overdue Checks</p>
                <p className="text-2xl font-bold">{stats.overdueChecks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Check Schedule</TabsTrigger>
          <TabsTrigger value="properties">Assigned Properties</TabsTrigger>
          <TabsTrigger value="history">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Check Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Check Schedule</CardTitle>
              <CardDescription>Upcoming and overdue property inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyChecks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No property checks scheduled</p>
                    <p className="text-sm text-muted-foreground mt-2">Check with your administrator to get property watch assignments.</p>
                  </div>
                ) : (
                  propertyChecks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(check.next_check_date)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{check.property_address}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Next Check: {check.next_check_date ? format(new Date(check.next_check_date), 'MMM dd, yyyy') : 'Not scheduled'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {check.check_frequency || 'No frequency set'}
                            </span>
                          </div>
                          {check.special_instructions && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Instructions:</strong> {check.special_instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(check.status || 'pending')}>
                            {check.status || 'pending'}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => startPropertyCheck(check.id)}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Start Check
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assigned Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Properties</CardTitle>
              <CardDescription>Properties under your watch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {assignedProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No properties assigned</p>
                    <p className="text-sm text-muted-foreground mt-2">Contact your administrator to get property assignments.</p>
                  </div>
                ) : (
                  assignedProperties.map((property) => (
                    <div key={property.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{property.address}</h3>
                          <p className="text-sm text-muted-foreground">
                            {property.city}, {property.state} {property.zip_code}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">{property.property_type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Assigned: {format(new Date(property.assigned_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {property.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Notes:</strong> {property.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Check Activity</CardTitle>
              <CardDescription>Your recent property inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground mt-2">Start your first property check to see activity here.</p>
                  </div>
                ) : (
                  recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Property Check</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.scheduled_date ? format(new Date(session.scheduled_date), 'MMM dd, yyyy') : 'No date'}
                          </p>
                          {session.general_notes && (
                            <p className="text-xs text-muted-foreground mt-1">{session.general_notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        {session.duration_minutes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.duration_minutes} minutes
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HouseWatcherDashboard;