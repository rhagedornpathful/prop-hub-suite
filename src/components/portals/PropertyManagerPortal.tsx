import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useProperties } from '@/hooks/queries/useProperties';
import { useTenants } from '@/hooks/queries/useTenants';
import { useMaintenanceRequests } from '@/hooks/queries/useMaintenanceRequests';
import { useAuth } from '@/contexts/AuthContext';

export const PropertyManagerPortal = () => {
  const { user } = useAuth();
  const { data: properties = [] } = useProperties();
  const { data: tenants = [] } = useTenants();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  
  const pendingRequests = maintenanceRequests.filter(mr => mr.status === 'pending');
  const inProgressRequests = maintenanceRequests.filter(mr => mr.status === 'in-progress');
  const completedThisMonth = maintenanceRequests.filter(mr => 
    mr.status === 'completed' && 
    mr.completed_at && 
    new Date(mr.completed_at).getMonth() === new Date().getMonth()
  );
  
  
  const propertyArray = Array.isArray(properties) ? properties : properties?.properties || [];
  const tenantArray = Array.isArray(tenants) ? tenants : (tenants as any)?.tenants || [];
  
  const totalRevenue = propertyArray.reduce((sum, prop) => sum + (prop.monthly_rent || 0), 0);
  const occupancyRate = propertyArray.length > 0 ? (tenantArray.length / propertyArray.length) * 100 : 0;

  const stats = [
    {
      title: "Properties Managed",
      value: propertyArray.length,
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Tenants", 
      value: tenantArray.length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Pending Maintenance",
      value: pendingRequests.length,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Monthly Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Property Manager Portal</h1>
          <p className="text-muted-foreground">Manage your properties, tenants, and maintenance requests</p>
        </div>
        
        <Badge variant="default">Property Manager</Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {tenantArray.length} of {propertyArray.length} units occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {completedThisMonth.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Requests completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              2.3h
            </div>
            <p className="text-sm text-muted-foreground">
              Average response to urgent requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Urgent Maintenance ({pendingRequests.filter(r => r.priority === 'high').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests
                    .filter(r => r.priority === 'high')
                    .slice(0, 3)
                    .map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{request.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Property: {propertyArray.find(p => p.id === request.property_id)?.address || 'Unknown'}
                          </p>
                        </div>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                    ))}
                  {pendingRequests.filter(r => r.priority === 'high').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No urgent maintenance requests</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  In Progress ({inProgressRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inProgressRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Started: {request.started_at ? new Date(request.started_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      <Badge>In Progress</Badge>
                    </div>
                  ))}
                  {inProgressRequests.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No requests in progress</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Portfolio</CardTitle>
              <CardDescription>Overview of all managed properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyArray.slice(0, 5).map((property) => {
                  const tenant = tenantArray.find(t => t.property_id === property.id);
                  const propertyRequests = maintenanceRequests.filter(r => r.property_id === property.id);
                  const openRequests = propertyRequests.filter(r => r.status !== 'completed').length;
                  
                  return (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{property.address}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.bedrooms}BR/{property.bathrooms}BA • ${property.monthly_rent}/month
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tenant: {tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Vacant'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={tenant ? "default" : "secondary"}>
                          {tenant ? "Occupied" : "Vacant"}
                        </Badge>
                        {openRequests > 0 && (
                          <p className="text-sm text-orange-600 mt-1">
                            {openRequests} open request{openRequests > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Directory</CardTitle>
              <CardDescription>All active tenants across your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenantArray.map((tenant) => {
                  const property = propertyArray.find(p => p.id === tenant.property_id);
                  const leaseStatus = tenant.lease_end_date && new Date(tenant.lease_end_date) < new Date() ? 'expired' : 'active';
                  
                  return (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{tenant.first_name} {tenant.last_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property?.address || 'Unknown Property'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Lease: {tenant.lease_start_date ? new Date(tenant.lease_start_date).toLocaleDateString() : 'N/A'} - {tenant.lease_end_date ? new Date(tenant.lease_end_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={leaseStatus === 'active' ? "default" : "destructive"}>
                          {leaseStatus}
                        </Badge>
                        <p className="text-sm font-medium mt-1">
                          ${tenant.monthly_rent}/month
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Dashboard</CardTitle>
              <CardDescription>Manage all maintenance requests across your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{inProgressRequests.length}</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{completedThisMonth.length}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent requests */}
                <div className="space-y-3">
                  {maintenanceRequests.slice(0, 5).map((request) => {
                    const property = propertyArray.find(p => p.id === request.property_id);
                    return (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{request.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property?.address || 'Unknown Property'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            request.status === 'completed' ? 'default' :
                            request.status === 'in-progress' ? 'secondary' :
                            'outline'
                          }>
                            {request.status}
                          </Badge>
                          <Badge 
                            variant={request.priority === 'high' ? 'destructive' : 'outline'}
                            className="ml-2"
                          >
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};