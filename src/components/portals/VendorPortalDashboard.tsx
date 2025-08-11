import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  FileText, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useVendors, useVendorWorkOrders } from '@/hooks/queries/useVendors';
import { useAuth } from '@/contexts/AuthContext';

export const VendorPortalDashboard = () => {
  const { user } = useAuth();
  const { data: vendors = [] } = useVendors();
  const { data: workOrders = [] } = useVendorWorkOrders();
  
  const currentVendor = vendors.find(v => v.user_id === user?.id);
  const myWorkOrders = workOrders.filter(wo => wo.vendor_id === currentVendor?.id);
  
  const pendingOrders = myWorkOrders.filter(wo => wo.status === 'assigned');
  const inProgressOrders = myWorkOrders.filter(wo => wo.status === 'in_progress');
  const completedOrders = myWorkOrders.filter(wo => wo.status === 'completed');
  const thisMonthRevenue = completedOrders
    .filter(wo => wo.completed_at && new Date(wo.completed_at).getMonth() === new Date().getMonth())
    .reduce((sum, wo) => sum + (wo.actual_cost || 0), 0);

  const stats = [
    {
      title: "Pending Orders",
      value: pendingOrders.length,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "In Progress",
      value: inProgressOrders.length,
      icon: Wrench,
      color: "text-blue-600", 
      bgColor: "bg-blue-100"
    },
    {
      title: "This Month Revenue",
      value: `$${thisMonthRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Rating",
      value: currentVendor?.rating ? `${currentVendor.rating}/5` : 'N/A',
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  if (!currentVendor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Vendor Portal</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vendor Profile Not Found</h3>
            <p className="text-muted-foreground mb-4">
              You need to complete your vendor profile to access the portal.
            </p>
            <Button>Complete Vendor Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Portal</h1>
          <p className="text-muted-foreground">Welcome back, {(currentVendor as any)?.company_name}</p>
        </div>
        
        <Badge variant={currentVendor.is_active ? "default" : "secondary"}>
          {currentVendor.is_active ? "Active" : "Inactive"}
        </Badge>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Work Orders</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {pendingOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Orders ({pendingOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{order.title}</h4>
                          <p className="text-sm text-muted-foreground">{order.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{order.priority}</Badge>
                          <p className="text-sm font-medium mt-1">
                            ${order.estimated_cost || 'TBD'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {inProgressOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    In Progress ({inProgressOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inProgressOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{order.title}</h4>
                          <p className="text-sm text-muted-foreground">{order.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Started: {order.started_at ? new Date(order.started_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge>In Progress</Badge>
                          <p className="text-sm font-medium mt-1">
                            ${order.estimated_cost || 'TBD'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Your scheduled work orders for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {myWorkOrders
                .filter(wo => wo.scheduled_date && new Date(wo.scheduled_date) >= new Date())
                .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
                .slice(0, 5)
                .map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div>
                      <h4 className="font-medium">{order.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.scheduled_date!).toLocaleDateString()} at {new Date(order.scheduled_date!).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant={order.status === 'assigned' ? 'outline' : 'default'}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <p className="text-sm text-muted-foreground">{(currentVendor as any)?.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Person</label>
                  <p className="text-sm text-muted-foreground">{(currentVendor as any)?.contact_person || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{(currentVendor as any)?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">{(currentVendor as any)?.phone || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hourly Rate</label>
                  <p className="text-sm text-muted-foreground">
                    {(currentVendor as any)?.hourly_rate ? `$${(currentVendor as any).hourly_rate}/hour` : 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialties & Service Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Specialties</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(currentVendor as any)?.specialties?.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">{specialty}</Badge>
                    )) || <p className="text-sm text-muted-foreground">None specified</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Service Areas</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(currentVendor as any)?.service_areas?.map((area: string, index: number) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    )) || <p className="text-sm text-muted-foreground">None specified</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Business License</label>
                  <p className="text-sm text-muted-foreground">{(currentVendor as any)?.business_license || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Insurance Info</label>
                  <p className="text-sm text-muted-foreground">{(currentVendor as any)?.insurance_info || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};