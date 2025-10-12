import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  Eye,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  Home,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Clock
} from 'lucide-react';
import { usePropertyMetrics } from '@/hooks/queries/useProperties';
import { useTenants } from '@/hooks/queries/useTenants';
import { useMaintenanceRequests } from '@/hooks/queries/useMaintenanceRequests';
import { useHouseWatchingMetrics } from '@/hooks/queries/useHouseWatching';
import { useBusinessSummary } from '@/hooks/queries/useBusinessSummary';
import { useAllPropertyActivity } from '@/hooks/useAllPropertyActivity';
import { formatSmartDate } from '@/lib/dateFormatter';
import { ICON_SIZES } from '@/lib/iconSizes';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch data
  const { data: propertyMetrics, isLoading: loadingProperties } = usePropertyMetrics();
  const { data: tenants, isLoading: loadingTenants } = useTenants();
  const { data: maintenance, isLoading: loadingMaintenance } = useMaintenanceRequests();
  const { data: houseWatchingMetrics, isLoading: loadingHouseWatching } = useHouseWatchingMetrics();
  const { data: businessSummary, isLoading: loadingBusiness } = useBusinessSummary();
  const { activities } = useAllPropertyActivity();

  const isLoading = loadingProperties || loadingTenants || loadingMaintenance || loadingHouseWatching || loadingBusiness;

  // Calculate metrics
  const totalProperties = propertyMetrics?.totalProperties || 0;
  const totalTenants = Array.isArray(tenants) ? tenants.length : 0;
  const occupancyRate = totalProperties > 0 ? (totalTenants / totalProperties) * 100 : 0;
  const monthlyRevenue = propertyMetrics?.totalRent || 0;
  const pendingMaintenance = Array.isArray(maintenance) 
    ? maintenance.filter(m => m.status === 'pending').length 
    : 0;
  const urgentMaintenance = Array.isArray(maintenance)
    ? maintenance.filter(m => m.priority === 'urgent' && m.status !== 'completed').length
    : 0;
  const activeHouseWatching = houseWatchingMetrics?.totalClients || 0;
  const portfolioValue = businessSummary?.combinedRevenue ? businessSummary.combinedRevenue * 12 : monthlyRevenue * 12; // Estimate based on annual revenue

  // Recent activities (limit to 10)
  const recentActivities = Array.isArray(activities) ? activities.slice(0, 10) : [];

  // Quick action buttons
  const quickActions = [
    { label: 'Add Property', icon: Plus, href: '/properties', color: 'bg-primary hover:bg-primary/90' },
    { label: 'Add Tenant', icon: Users, href: '/tenants', color: 'bg-secondary hover:bg-secondary/90' },
    { label: 'Schedule Maintenance', icon: Wrench, href: '/maintenance', color: 'bg-warning hover:bg-warning/90 text-warning-foreground' },
    { label: 'Generate Report', icon: FileText, href: '/reports', color: 'bg-accent hover:bg-accent/90' },
    { label: 'Send Message', icon: MessageSquare, href: '/messages', color: 'bg-info hover:bg-info/90 text-info-foreground' },
  ];

  // Navigation cards
  const navigationCards = [
    { title: 'Properties', icon: Building, href: '/properties', count: totalProperties, color: 'text-primary' },
    { title: 'Tenants', icon: Users, href: '/tenants', count: totalTenants, color: 'text-secondary' },
    { title: 'Maintenance', icon: Wrench, href: '/maintenance', count: pendingMaintenance, color: 'text-warning' },
    { title: 'Financials', icon: DollarSign, href: '/finances', count: `$${(monthlyRevenue / 1000).toFixed(1)}k`, color: 'text-success' },
    { title: 'House Watching', icon: Eye, href: '/house-watching', count: activeHouseWatching, color: 'text-info' },
    { title: 'Settings', icon: Settings, href: '/settings', count: null, color: 'text-muted-foreground' },
  ];

  // Alerts (upcoming lease expirations, urgent maintenance)
  const alerts = [];
  if (urgentMaintenance > 0) {
    alerts.push({
      type: 'error',
      message: `${urgentMaintenance} urgent maintenance request${urgentMaintenance > 1 ? 's' : ''} requiring immediate attention`,
      href: '/maintenance?filter=urgent'
    });
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header Section */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome to Lattitude Premier Properties
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className={cn(ICON_SIZES.sm, "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground")} />
              <Input
                placeholder="Search properties, tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
        {/* Quick Actions Bar */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className={ICON_SIZES.md} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href}>
                  <Button className={cn("w-full h-auto py-4 flex flex-col items-center gap-2", action.color)}>
                    <action.icon className={ICON_SIZES.lg} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <Link key={index} to={alert.href}>
                <Card className={cn(
                  "border-2 cursor-pointer transition-all hover:shadow-lg",
                  alert.type === 'error' && "border-destructive bg-destructive/5"
                )}>
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className={cn(ICON_SIZES.md, "text-destructive")} />
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                    <ArrowRight className={ICON_SIZES.sm} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Properties */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                <Building className={cn(ICON_SIZES.md, "text-primary")} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{totalProperties}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className={cn(ICON_SIZES.sm, "text-success")} />
                    <span className="text-xs text-success">+5.2% this month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Tenants & Occupancy */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tenants & Occupancy</CardTitle>
                <Users className={cn(ICON_SIZES.md, "text-secondary")} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{totalTenants}</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Occupancy Rate</span>
                      <span className="font-medium">{occupancyRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={occupancyRate} className="h-2" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                <DollarSign className={cn(ICON_SIZES.md, "text-success")} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <>
                  <div className="text-3xl font-bold">${(monthlyRevenue / 1000).toFixed(1)}k</div>
                  <div className="h-12 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', value: 45 },
                        { month: 'Feb', value: 52 },
                        { month: 'Mar', value: 49 },
                        { month: 'Apr', value: 58 },
                        { month: 'May', value: monthlyRevenue / 1000 }
                      ]}>
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Maintenance */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Maintenance</CardTitle>
                <Wrench className={cn(ICON_SIZES.md, "text-warning")} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{pendingMaintenance}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">{urgentMaintenance} Urgent</Badge>
                    <Badge variant="secondary" className="text-xs">{pendingMaintenance - urgentMaintenance} Normal</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* House Watching Services */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">House Watching</CardTitle>
                <Eye className={cn(ICON_SIZES.md, "text-info")} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{activeHouseWatching}</div>
                  <p className="text-xs text-muted-foreground mt-2">Active Services</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Portfolio Value */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                <TrendingUp className={cn(ICON_SIZES.md, "text-primary")} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <>
                  <div className="text-3xl font-bold">${(portfolioValue / 1000000).toFixed(2)}M</div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className={cn(ICON_SIZES.sm, "text-success")} />
                    <span className="text-xs text-success">+12.5% YoY</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Activity Feed + Quick Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed (2/3 width on desktop) */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className={ICON_SIZES.md} />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Last 10 activities across your portfolio</CardDescription>
                </div>
                <Link to="/activity">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className={cn(ICON_SIZES.sm, "ml-2")} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors border"
                    >
                      <div className="mt-1">
                        {activity.type === 'maintenance' && <Wrench className={cn(ICON_SIZES.md, "text-warning")} />}
                        {activity.type === 'property_check' && <Building className={cn(ICON_SIZES.md, "text-primary")} />}
                        {activity.type === 'home_check' && <Home className={cn(ICON_SIZES.md, "text-info")} />}
                        {activity.type === 'payment' && <DollarSign className={cn(ICON_SIZES.md, "text-success")} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatSmartDate(activity.date)}
                          </span>
                          {activity.metadata?.property_address && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {activity.metadata.property_address}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation (1/3 width on desktop) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className={ICON_SIZES.md} />
                Quick Navigation
              </CardTitle>
              <CardDescription>Access major sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {navigationCards.map((card) => (
                  <Link key={card.title} to={card.href}>
                    <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border-2 h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <card.icon className={cn(ICON_SIZES.lg, card.color)} />
                            {card.count !== null && (
                              <span className="text-2xl font-bold">{card.count}</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground">{card.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
