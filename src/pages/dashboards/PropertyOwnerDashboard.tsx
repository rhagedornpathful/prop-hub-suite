import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  PieChart,
  FileText,
  AlertCircle,
  Home,
  Wrench,
  Eye
} from 'lucide-react';
import { useProperties } from '@/hooks/queries/useProperties';
import { usePropertyOwners } from '@/hooks/queries/usePropertyOwners';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function PropertyOwnerDashboard() {
  const { user } = useAuth();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const { data: propertyOwners } = usePropertyOwners();
  
  // Find the current user's property owner record
  const currentOwner = propertyOwners?.find(owner => owner.user_id === user?.id);
  const ownedProperties = properties?.filter(property => property.owner_id === currentOwner?.id) || [];

  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Mock data for demonstration - in real app, this would come from API calls
  const portfolioStats = {
    totalValue: 850000,
    monthlyIncome: 4200,
    annualReturn: 8.5,
    occupancyRate: 95,
    maintenanceCosts: 1200,
    netIncome: 3000
  };

  const recentDistributions = [
    { id: 1, date: '2024-01-15', amount: 2800, property: '123 Main St', status: 'completed' },
    { id: 2, date: '2024-01-15', amount: 1950, property: '456 Oak Ave', status: 'completed' },
    { id: 3, date: '2024-02-15', amount: 2850, property: '123 Main St', status: 'pending' },
  ];

  const maintenanceAlerts = [
    { id: 1, property: '123 Main St', issue: 'HVAC Repair', cost: 450, status: 'in-progress' },
    { id: 2, property: '456 Oak Ave', issue: 'Plumbing Fix', cost: 280, status: 'completed' },
  ];

  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your property investments and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" size="sm">
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioStats.monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Net: ${portfolioStats.netIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.annualReturn}%</div>
            <p className="text-xs text-muted-foreground">
              Above market average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {ownedProperties.length} properties
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Distributions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recent Distributions
                </CardTitle>
                <CardDescription>Your latest rental income payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDistributions.map(dist => (
                    <div key={dist.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{dist.property}</p>
                        <p className="text-sm text-muted-foreground">{dist.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${dist.amount.toLocaleString()}</p>
                        <Badge variant={dist.status === 'completed' ? 'default' : 'secondary'}>
                          {dist.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">View All Distributions</Button>
              </CardContent>
            </Card>

            {/* Maintenance Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Maintenance Updates
                </CardTitle>
                <CardDescription>Recent maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{alert.issue}</p>
                        <p className="text-sm text-muted-foreground">{alert.property}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${alert.cost}</p>
                        <Badge variant={alert.status === 'completed' ? 'default' : 'secondary'}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">View All Maintenance</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Properties</CardTitle>
              <CardDescription>Manage and view details of your investment properties</CardDescription>
            </CardHeader>
            <CardContent>
              {ownedProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any properties in your portfolio yet.
                  </p>
                  <Button asChild>
                    <Link to="/properties">Add Property</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedProperties.map(property => (
                    <Card key={property.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{property.address}</CardTitle>
                            <CardDescription>
                              {property.city}, {property.state}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{property.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Monthly Rent:</span>
                          <span className="font-medium">
                            ${property.monthly_rent?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Property Type:</span>
                          <span className="font-medium capitalize">
                            {property.property_type?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bedrooms:</span>
                          <span className="font-medium">{property.bedrooms || 'N/A'}</span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Wrench className="w-4 h-4 mr-1" />
                            Maintenance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Summary</CardTitle>
                <CardDescription>Your rental income performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Gross Monthly Income</span>
                    <span className="font-semibold">${portfolioStats.monthlyIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Management Fees</span>
                    <span className="font-semibold text-red-600">-$420</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maintenance Costs</span>
                    <span className="font-semibold text-red-600">-${portfolioStats.maintenanceCosts.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Net Monthly Income</span>
                      <span className="text-green-600">${portfolioStats.netIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
                <CardDescription>Track your returns and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Annual ROI</span>
                    <span className="font-semibold text-green-600">{portfolioStats.annualReturn}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cash-on-Cash Return</span>
                    <span className="font-semibold">12.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cap Rate</span>
                    <span className="font-semibold">6.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Property Appreciation</span>
                    <span className="font-semibold text-green-600">+4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Download detailed reports for your records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Monthly Financial Report</div>
                    <div className="text-sm text-muted-foreground">Income, expenses, and net profit</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Tax Summary</div>
                    <div className="text-sm text-muted-foreground">Annual tax-related documents</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Property Performance</div>
                    <div className="text-sm text-muted-foreground">Individual property analytics</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Maintenance History</div>
                    <div className="text-sm text-muted-foreground">All maintenance activities and costs</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}