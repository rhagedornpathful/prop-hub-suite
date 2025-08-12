import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, Calendar, MessageSquare, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AssignedProperty {
  id: string;
  property_id: string;
  properties: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
  notes?: string;
}

interface HomeCheckSession {
  id: string;
  property_id: string;
  status: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
}

const HouseWatcherMobileDashboard = () => {
  const navigate = useNavigate();

  // Fetch assigned properties
  const { data: assignedProperties = [] } = useQuery({
    queryKey: ['house-watcher-properties'],
    queryFn: async (): Promise<AssignedProperty[]> => {
      const { data: houseWatcher } = await supabase
        .from('house_watchers')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!houseWatcher) return [];

      const { data } = await supabase
        .from('house_watcher_properties')
        .select(`
          id,
          property_id,
          notes,
          properties (
            id,
            address,
            city,
            state
          )
        `)
        .eq('house_watcher_id', houseWatcher.id);

      return data || [];
    }
  });

  // Fetch recent check sessions
  const { data: recentChecks = [] } = useQuery({
    queryKey: ['recent-checks'],
    queryFn: async (): Promise<HomeCheckSession[]> => {
      const { data } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const pendingChecks = recentChecks.filter(check => check.status === 'in_progress').length;
  const completedToday = recentChecks.filter(check => 
    check.status === 'completed' && 
    check.completed_at && 
    format(new Date(check.completed_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">House Watcher</h1>
        <p className="text-muted-foreground">Your assigned properties and tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-primary">{assignedProperties.length}</div>
            <div className="text-xs text-muted-foreground">Properties</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-warning">{pendingChecks}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-success">{completedToday}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => navigate('/property-check')}
          className="h-16 flex-col gap-2"
          variant="default"
        >
          <CheckCircle2 className="h-6 w-6" />
          <span className="text-sm">Start Check</span>
        </Button>
        <Button 
          onClick={() => navigate('/messages')}
          className="h-16 flex-col gap-2"
          variant="outline"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm">Messages</span>
        </Button>
      </div>

      {/* Assigned Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5" />
            My Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedProperties.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No properties assigned yet</p>
            </div>
          ) : (
            assignedProperties.map((property) => (
              <div
                key={property.id}
                className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/properties/${property.property_id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{property.properties.address}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.properties.city}, {property.properties.state}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                {property.notes && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {property.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Recent Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentChecks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            recentChecks.map((check) => (
              <div key={check.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Property Check</div>
                  <Badge className={`text-xs ${getStatusColor(check.status)}`}>
                    {check.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {check.scheduled_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(check.scheduled_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bottom Navigation Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default HouseWatcherMobileDashboard;