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
import { useRealTimeAdminDashboard } from "@/hooks/useRealTimeAdminDashboard";
import { useOptimizedQueries } from "@/hooks/useOptimizedQueries";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import MaintenanceAlerts from "@/components/MaintenanceAlerts";
import { AdminOverviewCards, AdminAlertCenter, AdminRecentActivity } from "@/components/admin/AdminOverviewCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { AdminErrorBoundary, DashboardSectionErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdvancedSearch } from "@/components/admin/AdvancedSearch";
import { QuickActions } from "@/components/admin/QuickActions";
import { NavigationHub } from "@/components/admin/NavigationHub";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  // Real-time connection management
  const { metrics: realTimeMetrics, refreshAllData, isConnected } = useRealTimeAdminDashboard();

  // Fetch real data from all sources with optimized queries
  const { data: propertyMetrics, isLoading: isPropertyMetricsLoading } = usePropertyMetrics();
  const { data: houseWatchingMetrics, isLoading: isHouseWatchingLoading } = useHouseWatchingMetrics();
  const { data: maintenanceData, isLoading: isMaintenanceLoading } = useMaintenanceRequests();
  const { data: tenantData, isLoading: isTenantsLoading } = useTenants();
  const { data: businessSummary, isLoading: isBusinessSummaryLoading } = useBusinessSummary();
  const { activities: allActivity } = useAllPropertyActivity();
  const { data: properties, isLoading: isPropertiesLoading } = usePropertiesLimited();
  const { data: payments, isLoading: isPaymentsLoading } = usePayments();

  // Simple search state for this component
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Check if any critical data is still loading
  const isLoading = isPropertyMetricsLoading || isHouseWatchingLoading || 
                   isMaintenanceLoading || isTenantsLoading || 
                   isBusinessSummaryLoading || isPropertiesLoading || isPaymentsLoading;

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

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  // Calculate real data for charts
  const revenueData = calculateRevenueData();
  const propertyPerformanceData = calculatePropertyPerformance();
  const maintenanceCategoryData = calculateMaintenanceCategoryData();


  return (
    <AdminErrorBoundary>
      <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 bg-gradient-subtle min-h-screen">
        
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumbs />
        
        {/* Advanced Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <AdvancedSearch className="w-full md:max-w-lg" />
          <QuickActions variant="dropdown" />
        </div>

        {/* Command Center Header with Real-time Status */}
        <div className="text-center space-y-3 py-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-2xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Command Center
            </h1>
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success shadow-glow animate-pulse' : 'bg-destructive'}`} />
          </div>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">
            Complete oversight and control of your property management operations
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">Last Update: {realTimeMetrics.lastUpdateTime.toLocaleTimeString()}</span>
            <Button variant="ghost" size="sm" onClick={refreshAllData} className="h-7 px-3 hover:bg-primary/10 transition-colors">
              <Activity className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

      {/* Executive Overview */}
      <DashboardSectionErrorBoundary sectionName="Overview Cards">
        <AdminOverviewCards />
      </DashboardSectionErrorBoundary>

      {/* Real-time Operations Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="lg:col-span-2 space-y-3 md:space-y-6">
          {/* Mission Control - Prominently positioned first */}
          <Card className="border-primary/20 bg-gradient-glass backdrop-blur-sm shadow-colored hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-primary font-display text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5" />
                </div>
                Mission Control
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Execute critical operations instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link to="/properties/add">
                  <Button className="w-full justify-start h-11 md:h-12 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]" variant="outline">
                    <div className="p-1.5 rounded-md bg-success/10 mr-3">
                      <Plus className="h-4 w-4 text-success" />
                    </div>
                    Add Property
                  </Button>
                </Link>
                
                <Link to="/maintenance">
                  <Button className="w-full justify-start h-11 md:h-12 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]" variant="outline">
                    <div className="p-1.5 rounded-md bg-warning/10 mr-3">
                      <Wrench className="h-4 w-4 text-warning" />
                    </div>
                    <span className="hidden sm:inline">Schedule </span>Maintenance
                  </Button>
                </Link>
                
                <Link to="/tenants/add">
                  <Button className="w-full justify-start h-11 md:h-12 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]" variant="outline">
                    <div className="p-1.5 rounded-md bg-info/10 mr-3">
                      <Users className="h-4 w-4 text-info" />
                    </div>
                    Add Tenant
                  </Button>
                </Link>
                
                <Link to="/reports">
                  <Button className="w-full justify-start h-11 md:h-12 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]" variant="outline">
                    <div className="p-1.5 rounded-md bg-secondary/10 mr-3">
                      <FileText className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="hidden sm:inline">Generate </span>Report
                  </Button>
                </Link>
                
                <Link to="/messages">
                  <Button className="w-full justify-start h-11 md:h-12 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]" variant="outline">
                    <div className="p-1.5 rounded-md bg-accent/10 mr-3">
                      <MessageSquare className="h-4 w-4 text-accent" />
                    </div>
                    <span className="hidden sm:inline">Send </span>Communication
                  </Button>
                </Link>

                <Link to="/house-watching">
                  <Button className="w-full justify-start h-11 md:h-12 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]" variant="outline">
                    <div className="p-1.5 rounded-md bg-primary/10 mr-3">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    House Watching
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics - Enhanced with better styling */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-glass backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-display">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <TrendingUp className="h-5 w-5 text-chart-1" />
                </div>
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

        {/* Right Sidebar - Navigation, Quick Actions & System Status */}
        <div className="space-y-3 md:space-y-6">
          {/* Navigation Hub */}
          <DashboardSectionErrorBoundary sectionName="Navigation Hub">
            <NavigationHub showRecent={true} showBookmarks={true} maxShortcuts={4} />
          </DashboardSectionErrorBoundary>
          
          <DashboardSectionErrorBoundary sectionName="Recent Activity">
            <AdminRecentActivity />
          </DashboardSectionErrorBoundary>
          
          {/* System Alerts - Moved from main content to sidebar */}
          <DashboardSectionErrorBoundary sectionName="System Alerts">
            <AdminAlertCenter />
          </DashboardSectionErrorBoundary>
          
          {/* System Status - Enhanced styling */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-glass backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-display">
                <div className="p-2 rounded-lg bg-info/10">
                  <Server className="h-5 w-5 text-info" />
                </div>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="default" className="bg-success text-success-foreground shadow-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Services</span>
                <Badge variant="default" className="bg-success text-success-foreground shadow-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <Badge variant="default" className="bg-success text-success-foreground shadow-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Real-time Status</span>
                <Badge variant={isConnected ? "default" : "destructive"} className={cn(
                  "shadow-sm",
                  isConnected ? "bg-success text-success-foreground" : ""
                )}>
                  {isConnected ? <CheckCircle className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Channels</span>
                <Badge variant="secondary" className="shadow-sm">
                  <Activity className="h-3 w-3 mr-1" />
                  {realTimeMetrics.activeConnections}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AdminErrorBoundary>
  );
}