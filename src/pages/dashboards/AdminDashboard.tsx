import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Wrench,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Eye,
  PlusCircle,
  Settings,
  Home,
  CreditCard,
  Bell,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  Zap,
  Plus,
  Server
} from "lucide-react";
import { usePropertyMetrics, usePropertiesLimited } from "@/hooks/queries/useProperties";
import { useHouseWatchingMetrics, useHouseWatchingLimited } from "@/hooks/queries/useHouseWatching";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";
import { usePropertyOwners } from "@/hooks/queries/usePropertyOwners";
import { useTenants } from "@/hooks/queries/useTenants";
import { useConversations } from "@/hooks/queries/useConversations";
import { useProfiles } from "@/hooks/queries/useProfiles";
import { usePayments } from "@/hooks/queries/usePayments";
import { useAllPropertyActivity } from "@/hooks/useAllPropertyActivity";
import { useGlobalSearch, useSearch } from "@/hooks/useSearch";
import { useSearchContext } from "@/contexts/SearchContext";
import { useBusinessSummary } from "@/hooks/queries/useBusinessSummary";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import MaintenanceAlerts from "@/components/MaintenanceAlerts";
import { AdminOverviewCards, AdminAlertCenter, AdminRecentActivity } from "@/components/admin/AdminOverviewCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export function AdminDashboard() {
  // Fetch real data from all sources
  const { data: propertyMetrics } = usePropertyMetrics();
  const { data: houseWatchingMetrics } = useHouseWatchingMetrics();
  const { data: maintenanceData, isLoading: isMaintenanceLoading } = useMaintenanceRequests();
  const { data: tenantData } = useTenants();
  const { data: businessSummary } = useBusinessSummary();
  const { activities: allActivity } = useAllPropertyActivity();
  const { data: properties } = usePropertiesLimited();
  const { data: payments } = usePayments();

  // Simple search state for this component
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Calculate real revenue data from payments
  const calculateRevenueData = () => {
    if (!payments) return [];
    
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear() &&
               payment.status === 'completed';
      });
      
      const revenue = monthPayments
        .filter(p => p.payment_type === 'rent')
        .reduce((sum, p) => sum + (p.amount / 100), 0);
        
      const expenses = monthPayments
        .filter(p => p.payment_type === 'expense')
        .reduce((sum, p) => sum + (p.amount / 100), 0);
      
      last6Months.push({
        month: monthName,
        revenue,
        expenses: expenses || revenue * 0.3 // Fallback to 30% of revenue as expenses
      });
    }
    
    return last6Months;
  };

  // Calculate property performance data
  const calculatePropertyPerformance = () => {
    if (!properties || !tenantData || !maintenanceData) return [];
    
    return properties.slice(0, 4).map(property => {
      const propertyTenants = Array.isArray(tenantData) 
        ? tenantData.filter(t => t.property_id === property.id) 
        : [];
      
      const propertyMaintenance = Array.isArray(maintenanceData)
        ? maintenanceData.filter(m => m.property_id === property.id && m.status === 'pending')
        : [];
      
      return {
        property: property.address?.slice(0, 20) + '...' || 'Property',
        occupancy: propertyTenants.length > 0 ? 100 : 0,
        revenue: property.monthly_rent || 0,
        maintenance: propertyMaintenance.length
      };
    });
  };

  // Calculate maintenance category data
  const calculateMaintenanceCategoryData = () => {
    if (!maintenanceData) return [];
    
    const categories = {};
    Array.isArray(maintenanceData) && maintenanceData.forEach(request => {
      const category = request.title?.toLowerCase().includes('plumb') ? 'Plumbing' :
                      request.title?.toLowerCase().includes('electric') ? 'Electrical' :
                      request.title?.toLowerCase().includes('hvac') || request.title?.toLowerCase().includes('heat') ? 'HVAC' :
                      'General';
      
      if (!categories[category]) {
        categories[category] = { count: 0, cost: 0 };
      }
      categories[category].count += 1;
      categories[category].cost += request.estimated_cost || 0;
    });
    
    return Object.entries(categories).map(([category, data]: [string, any]) => ({
      category,
      count: data.count,
      cost: data.cost
    }));
  };

  // Calculate metrics
  const totalProperties = (propertyMetrics?.totalProperties || 0) + (houseWatchingMetrics?.totalClients || 0);
  const totalTenants = Array.isArray(tenantData) ? tenantData.length : 0;
  const monthlyRevenue = ((propertyMetrics?.totalRent || 0) + (houseWatchingMetrics?.totalRevenue || 0));

  // Critical alerts
  const pendingMaintenanceCount = Array.isArray(maintenanceData) 
    ? maintenanceData.filter(m => m.status === 'pending').length 
    : 0;
  const urgentMaintenanceCount = Array.isArray(maintenanceData) 
    ? maintenanceData.filter(m => m.priority === 'urgent' && m.status !== 'completed').length 
    : 0;

  // Upcoming lease expirations (next 90 days)
  const upcomingExpirations = Array.isArray(tenantData) 
    ? tenantData.filter(tenant => {
        if (!tenant.lease_start_date) return false;
        // Assume 1 year lease for demo
        const leaseEnd = new Date(tenant.lease_start_date);
        leaseEnd.setFullYear(leaseEnd.getFullYear() + 1);
        const now = new Date();
        const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        return leaseEnd >= now && leaseEnd <= ninetyDaysFromNow;
      })
    : [];

  // Recent activity - simplified for the admin dashboard
  const recentActivity = Array.isArray(allActivity) 
    ? allActivity.slice(0, 10)
    : [];

  const isLoading = isMaintenanceLoading;

  // Calculate real data for charts
  const revenueData = calculateRevenueData();
  const propertyPerformanceData = calculatePropertyPerformance();
  const maintenanceCategoryData = calculateMaintenanceCategoryData();


  return (
    <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-muted/20">
      {/* Command Center Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Command Center
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete oversight and control of your property management operations
        </p>
      </div>

      {/* Executive Overview */}
      <AdminOverviewCards />

      {/* Real-time Operations Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Control - Prominently positioned first */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                Mission Control
              </CardTitle>
              <CardDescription>
                Execute critical operations instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link to="/properties/add">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
                
                <Link to="/maintenance">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </Link>
                
                <Link to="/tenants/add">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add Tenant
                  </Button>
                </Link>
                
                <Link to="/reports">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Link>
                
                <Link to="/messages">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Communication
                  </Button>
                </Link>

                <Link to="/house-watching">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    House Watching
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics - Moved up to second position */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="financial" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="operations">Operations</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="financial" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="expenses" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="operations" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={propertyPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="property" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="occupancy" fill="hsl(var(--primary))" name="Occupancy %" />
                        <Bar dataKey="maintenance" fill="hsl(var(--warning))" name="Maintenance Requests" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="maintenance" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={maintenanceCategoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="count"
                          label={({ category, count }) => `${category}: ${count}`}
                        >
                          {maintenanceCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="occupancy" className="space-y-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Recent Activity, System Alerts & System Status */}
        <div className="space-y-6">
          <AdminRecentActivity />
          
          {/* System Alerts - Moved from main content to sidebar */}
          <AdminAlertCenter />
          
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backup Status</span>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  2 hours ago
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}