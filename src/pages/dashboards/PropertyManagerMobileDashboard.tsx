import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Wrench, MessageSquare, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
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
    monthly_rent?: number;
  };
}

interface MaintenanceRequest {
  id: string;
  title: string;
  priority: string;
  status: string;
  property_id: string;
  created_at: string;
  properties: {
    address: string;
  };
}

interface TenantInfo {
  id: string;
  first_name: string;
  last_name: string;
  property_id: string;
  monthly_rent?: number;
  properties: {
    address: string;
  };
}

const PropertyManagerMobileDashboard = () => {
  const navigate = useNavigate();

  // Fetch assigned properties
  const { data: assignedProperties = [] } = useQuery({
    queryKey: ['pm-assigned-properties'],
    queryFn: async (): Promise<AssignedProperty[]> => {
      const { data } = await supabase
        .from('property_manager_assignments')
        .select(`
          id,
          property_id,
          properties (
            id,
            address,
            city,
            state,
            monthly_rent
          )
        `)
        .eq('manager_user_id', (await supabase.auth.getUser()).data.user?.id);

      return data || [];
    }
  });

  // Fetch maintenance requests for assigned properties
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['pm-maintenance-requests'],
    queryFn: async (): Promise<MaintenanceRequest[]> => {
      const propertyIds = assignedProperties.map(p => p.property_id);
      if (propertyIds.length === 0) return [];

      const { data } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          priority,
          status,
          property_id,
          created_at,
          properties (address)
        `)
        .in('property_id', propertyIds)
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
    enabled: assignedProperties.length > 0
  });

  // Fetch tenants for assigned properties
  const { data: tenants = [] } = useQuery({
    queryKey: ['pm-tenants'],
    queryFn: async (): Promise<TenantInfo[]> => {
      const propertyIds = assignedProperties.map(p => p.property_id);
      if (propertyIds.length === 0) return [];

      const { data } = await supabase
        .from('tenants')
        .select(`
          id,
          first_name,
          last_name,
          property_id,
          monthly_rent,
          properties (address)
        `)
        .in('property_id', propertyIds);

      return data || [];
    },
    enabled: assignedProperties.length > 0
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const urgentRequests = maintenanceRequests.filter(req => req.priority === 'urgent').length;
  const totalRent = assignedProperties.reduce((sum, prop) => sum + (prop.properties.monthly_rent || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Property Manager</h1>
        <p className="text-muted-foreground">Manage your assigned properties</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-primary">{assignedProperties.length}</div>
            <div className="text-xs text-muted-foreground">Properties</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-success">{tenants.length}</div>
            <div className="text-xs text-muted-foreground">Tenants</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-warning">{maintenanceRequests.length}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-destructive">{urgentRequests}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => navigate('/property-manager/maintenance')}
          className="h-16 flex-col gap-2"
          variant="default"
        >
          <Wrench className="h-6 w-6" />
          <span className="text-sm">Maintenance</span>
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

      {/* Urgent Maintenance */}
      {urgentRequests > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Urgent Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceRequests
              .filter(req => req.priority === 'urgent')
              .slice(0, 3)
              .map((request) => (
                <div
                  key={request.id}
                  className="border border-destructive/20 rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/property-manager/maintenance/${request.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{request.title}</div>
                    <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.properties.address}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Properties Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            My Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedProperties.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No properties assigned yet</p>
            </div>
          ) : (
            assignedProperties.slice(0, 5).map((property) => {
              const propertyTenants = tenants.filter(t => t.property_id === property.property_id);
              const propertyMaintenance = maintenanceRequests.filter(req => req.property_id === property.property_id);

              return (
                <div
                  key={property.id}
                  className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/property-manager/property/${property.property_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{property.properties.address}</div>
                      <div className="text-xs text-muted-foreground">
                        {property.properties.city}, {property.properties.state}
                      </div>
                      {property.properties.monthly_rent && (
                        <div className="text-xs text-success font-medium">
                          ${property.properties.monthly_rent.toLocaleString()}/month
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{propertyTenants.length} tenant{propertyTenants.length !== 1 ? 's' : ''}</span>
                    </div>
                    {propertyMaintenance.length > 0 && (
                      <div className="flex items-center gap-1 text-warning">
                        <Wrench className="h-3 w-3" />
                        <span>{propertyMaintenance.length} open</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {assignedProperties.length > 5 && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/property-manager/properties')}
            >
              View All Properties ({assignedProperties.length})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recent Maintenance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5" />
            Recent Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {maintenanceRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>All caught up!</p>
            </div>
          ) : (
            maintenanceRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/property-manager/maintenance/${request.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{request.title}</div>
                  <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {request.properties.address}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(request.created_at), 'MMM dd, yyyy')}
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

export default PropertyManagerMobileDashboard;