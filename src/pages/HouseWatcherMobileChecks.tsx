import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Camera, AlertTriangle, Home, MapPin, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CheckSession {
  id: string;
  property_id: string;
  status: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  general_notes?: string;
}

interface AssignedProperty {
  id: string;
  property_id: string;
  properties: {
    id: string;
    address: string;
    city: string;
    state: string;
  };
}

const HouseWatcherMobileChecks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

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

  // Fetch check sessions
  const { data: checkSessions = [] } = useQuery({
    queryKey: ['check-sessions'],
    queryFn: async (): Promise<CheckSession[]> => {
      const { data } = await supabase
        .from('home_check_sessions')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      return data || [];
    }
  });

  // Start new check session
  const startCheckMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('home_check_sessions')
        .insert({
          user_id: user.user.id,
          property_id: propertyId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['check-sessions'] });
      navigate(`/house-watcher/check/${session.id}`);
      toast({
        title: "Check Started",
        description: "House check session has been started.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start check session",
        variant: "destructive",
      });
    }
  });

  const filteredProperties = assignedProperties.filter(property =>
    property.properties.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.properties.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const activeChecks = checkSessions.filter(session => session.status === 'in_progress');
  const completedChecks = checkSessions.filter(session => session.status === 'completed');

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">House Checks</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Active Checks */}
      {activeChecks.length > 0 && (
        <Card className="border-warning">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <AlertTriangle className="h-5 w-5" />
              Active Checks ({activeChecks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeChecks.map((session) => {
              const property = assignedProperties.find(p => p.property_id === session.property_id);
              return (
                <div
                  key={session.id}
                  className="border border-warning/20 rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/house-watcher/check/${session.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">
                      {property?.properties.address || 'Unknown Property'}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                      In Progress
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Started {session.started_at && format(new Date(session.started_at), 'MMM dd, HH:mm')}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Start New Check */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Start New Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No properties available</p>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{property.properties.address}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.properties.city}, {property.properties.state}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startCheckMutation.mutate(property.property_id)}
                    disabled={startCheckMutation.isPending}
                    className="h-8"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Checks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5" />
            Recent Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedChecks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No completed checks yet</p>
            </div>
          ) : (
            completedChecks.slice(0, 10).map((session) => {
              const property = assignedProperties.find(p => p.property_id === session.property_id);
              return (
                <div
                  key={session.id}
                  className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/house-watcher/check/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">
                      {property?.properties.address || 'Unknown Property'}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                      Completed
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.completed_at && format(new Date(session.completed_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                  {session.general_notes && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {session.general_notes.substring(0, 100)}...
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HouseWatcherMobileChecks;