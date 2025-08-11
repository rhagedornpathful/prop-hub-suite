import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Eye,
  Settings,
  Users,
  MapPin,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useProperties } from '@/hooks/queries/useProperties';
import { PropertyAnalyticsDashboard } from '@/components/PropertyAnalyticsDashboard';

interface MobilePropertyDashboardProps {
  onPropertyClick?: (property: any) => void;
  onAddProperty?: () => void;
}

export const MobilePropertyDashboard: React.FC<MobilePropertyDashboardProps> = ({
  onPropertyClick,
  onAddProperty
}) => {
  const { data: propertyData, isLoading } = useProperties(1, 100);
  const properties = propertyData?.properties || [];
  
  // Calculate quick stats
  const activeProperties = properties.filter(p => p.status === 'active' || !p.status).length;
  const totalValue = properties.reduce((sum, p) => sum + (p.estimated_value || 0), 0);
  const totalRent = properties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
  const maintenanceRequests = properties.filter(p => p.status === 'maintenance').length;
  
  const recentProperties = properties
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">{activeProperties}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">
                  ${totalRent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Monthly Rent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">
                  ${Math.round(totalValue / 1000)}K
                </p>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">{maintenanceRequests}</p>
                <p className="text-xs text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties" className="text-xs">
            <Building className="h-3 w-3 mr-1" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Recent Properties</h3>
            <Button size="sm" variant="outline" onClick={onAddProperty}>
              Add Property
            </Button>
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : recentProperties.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No properties yet</p>
                    <Button size="sm" className="mt-2" onClick={onAddProperty}>
                      Add Your First Property
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                recentProperties.map((property) => (
                  <Card 
                    key={property.id} 
                    className="cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => onPropertyClick?.(property)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{property.address}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground truncate">
                                  {[property.city, property.state].filter(Boolean).join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {property.monthly_rent && (
                            <div className="flex items-center gap-1 mt-2">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                ${property.monthly_rent.toLocaleString()}/mo
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <Badge className={`${getStatusColor(property.status)} text-xs`}>
                            {(property.status || 'active').toUpperCase()}
                          </Badge>
                          {property.service_type && (
                            <Badge variant="outline" className="text-xs">
                              {property.service_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">Property analytics will be available soon.</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Recent Activity</h3>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded">
                        <Building className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">Property added: 123 Main St</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <DollarSign className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">Rent updated: 456 Oak Ave</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-orange-100 rounded">
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">Maintenance scheduled: 789 Pine St</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};