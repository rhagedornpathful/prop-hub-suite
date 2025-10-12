import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building, 
  Users, 
  DollarSign, 
  Wrench,
  Eye,
  TrendingUp,
  Search,
  FileText,
  MessageSquare,
  Calendar,
  Home,
  ArrowRight,
  BarChart3,
  Clock,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { usePropertyOwnerMetrics } from '@/hooks/usePropertyOwnerMetrics';
import { useAllPropertyActivity } from '@/hooks/useAllPropertyActivity';
import { formatSmartDate } from '@/lib/dateFormatter';
import { ICON_SIZES } from '@/lib/iconSizes';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function PropertyOwnerHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: metrics, isLoading } = usePropertyOwnerMetrics();
  const { activities } = useAllPropertyActivity();

  const serviceType = metrics?.serviceType || 'none';
  const recentActivities = Array.isArray(activities) ? activities.slice(0, 10) : [];

  // Quick actions based on service type
  const getQuickActions = () => {
    const common = [
      { label: 'View Reports', icon: BarChart3, href: '/client-portal/reports', color: 'bg-accent hover:bg-accent/90' },
      { label: 'Messages', icon: MessageSquare, href: '/messages', color: 'bg-info hover:bg-info/90 text-info-foreground' },
    ];

    if (serviceType === 'rental') {
      return [
        { label: 'View Statements', icon: FileText, href: '/finances', color: 'bg-primary hover:bg-primary/90' },
        { label: 'Contact Manager', icon: MessageSquare, href: '/messages', color: 'bg-secondary hover:bg-secondary/90' },
        ...common,
      ];
    } else if (serviceType === 'house_watching') {
      return [
        { label: 'View Check Reports', icon: CheckCircle2, href: '/house-watching', color: 'bg-primary hover:bg-primary/90' },
        { label: 'Contact House Watcher', icon: MessageSquare, href: '/messages', color: 'bg-secondary hover:bg-secondary/90' },
        { label: 'View Photos', icon: Camera, href: '/house-watching', color: 'bg-warning hover:bg-warning/90 text-warning-foreground' },
        ...common,
      ];
    } else if (serviceType === 'both') {
      return [
        { label: 'View All Statements', icon: FileText, href: '/finances', color: 'bg-primary hover:bg-primary/90' },
        { label: 'Contact Team', icon: MessageSquare, href: '/messages', color: 'bg-secondary hover:bg-secondary/90' },
        { label: 'View Check Reports', icon: CheckCircle2, href: '/house-watching', color: 'bg-warning hover:bg-warning/90 text-warning-foreground' },
        ...common,
      ];
    }
    
    return common;
  };

  const quickActions = getQuickActions();

  // Navigation cards
  const navigationCards = [
    { title: 'My Properties', icon: Building, href: '/properties', count: metrics?.totalProperties || 0, color: 'text-primary' },
    { title: 'Financials', icon: DollarSign, href: '/finances', count: `$${((metrics?.monthlyIncome || 0) / 1000).toFixed(1)}k`, color: 'text-success' },
    { title: 'Maintenance', icon: Wrench, href: '/maintenance', count: metrics?.pendingMaintenance || 0, color: 'text-warning' },
    { title: 'Messages', icon: MessageSquare, href: '/messages', count: null, color: 'text-info' },
  ];

  // Render metrics based on service type
  const renderMetrics = () => {
    if (serviceType === 'rental') {
      return (
        <>
          <MetricCard
            title="My Properties"
            value={metrics?.totalProperties || 0}
            icon={Building}
            iconColor="text-primary"
            trend="+5.2% this month"
            trendUp
            isLoading={isLoading}
          />
          <MetricCard
            title="My Tenants"
            value={metrics?.totalTenants || 0}
            icon={Users}
            iconColor="text-secondary"
            subtitle={
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-medium">{(metrics?.occupancyRate || 0).toFixed(1)}%</span>
                </div>
                <Progress value={metrics?.occupancyRate || 0} className="h-2" />
              </div>
            }
            isLoading={isLoading}
          />
          <MetricCard
            title="Monthly Rent Income"
            value={`$${((metrics?.monthlyIncome || 0) / 1000).toFixed(1)}k`}
            icon={DollarSign}
            iconColor="text-success"
            chart={
              <div className="h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', value: 45 },
                    { month: 'Feb', value: 52 },
                    { month: 'Mar', value: 49 },
                    { month: 'Apr', value: 58 },
                    { month: 'May', value: (metrics?.monthlyIncome || 0) / 1000 }
                  ]}>
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            }
            isLoading={isLoading}
          />
          <MetricCard
            title="Pending Maintenance"
            value={metrics?.pendingMaintenance || 0}
            icon={Wrench}
            iconColor="text-warning"
            isLoading={isLoading}
          />
          <MetricCard
            title="Occupancy Rate"
            value={`${(metrics?.occupancyRate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="text-primary"
            isLoading={isLoading}
          />
          <MetricCard
            title="Portfolio Value"
            value={`$${((metrics?.portfolioValue || 0) / 1000000).toFixed(2)}M`}
            icon={BarChart3}
            iconColor="text-success"
            trend="+12.5% YoY"
            trendUp
            isLoading={isLoading}
          />
        </>
      );
    } else if (serviceType === 'house_watching') {
      return (
        <>
          <MetricCard
            title="My Properties"
            value={metrics?.totalProperties || 0}
            icon={Building}
            iconColor="text-primary"
            isLoading={isLoading}
          />
          <MetricCard
            title="Active House Watching"
            value={metrics?.activeHouseWatching || 0}
            icon={Eye}
            iconColor="text-info"
            subtitle={<p className="text-xs text-muted-foreground mt-2">Active Services</p>}
            isLoading={isLoading}
          />
          <MetricCard
            title="Last Check Date"
            value={metrics?.lastCheckDate ? formatSmartDate(metrics.lastCheckDate) : 'N/A'}
            icon={Calendar}
            iconColor="text-secondary"
            isLoading={isLoading}
          />
          <MetricCard
            title="Next Scheduled Check"
            value={metrics?.nextCheckDate ? formatSmartDate(metrics.nextCheckDate) : 'N/A'}
            icon={Clock}
            iconColor="text-warning"
            isLoading={isLoading}
          />
          <MetricCard
            title="Checks This Year"
            value={metrics?.totalChecksThisYear || 0}
            icon={CheckCircle2}
            iconColor="text-success"
            isLoading={isLoading}
          />
          <MetricCard
            title="Overall Condition"
            value="Excellent"
            icon={Home}
            iconColor="text-success"
            subtitle={<Badge variant="secondary" className="text-xs mt-2">All systems normal</Badge>}
            isLoading={isLoading}
          />
        </>
      );
    } else if (serviceType === 'both') {
      return (
        <>
          <MetricCard
            title="My Properties"
            value={metrics?.totalProperties || 0}
            icon={Building}
            iconColor="text-primary"
            trend="+5.2% this month"
            trendUp
            isLoading={isLoading}
          />
          <MetricCard
            title="Active Services"
            value={`${metrics?.totalTenants || 0} / ${metrics?.activeHouseWatching || 0}`}
            icon={Users}
            iconColor="text-secondary"
            subtitle={<p className="text-xs text-muted-foreground mt-2">Tenants / House Watching</p>}
            isLoading={isLoading}
          />
          <MetricCard
            title="Monthly Income"
            value={`$${((metrics?.monthlyIncome || 0) / 1000).toFixed(1)}k`}
            icon={DollarSign}
            iconColor="text-success"
            subtitle={<p className="text-xs text-muted-foreground mt-2">Last Check: {metrics?.lastCheckDate ? formatSmartDate(metrics.lastCheckDate) : 'N/A'}</p>}
            isLoading={isLoading}
          />
          <MetricCard
            title="Pending Items"
            value={`${metrics?.pendingMaintenance || 0}`}
            icon={Wrench}
            iconColor="text-warning"
            subtitle={<p className="text-xs text-muted-foreground mt-2">Maintenance Requests</p>}
            isLoading={isLoading}
          />
          <MetricCard
            title="Occupancy & Health"
            value={`${(metrics?.occupancyRate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="text-primary"
            subtitle={<Badge variant="secondary" className="text-xs mt-2">Overall: Excellent</Badge>}
            isLoading={isLoading}
          />
          <MetricCard
            title="Portfolio Value"
            value={`$${((metrics?.portfolioValue || 0) / 1000000).toFixed(2)}M`}
            icon={BarChart3}
            iconColor="text-success"
            trend="+12.5% YoY"
            trendUp
            isLoading={isLoading}
          />
        </>
      );
    }

    // Default for 'none'
    return (
      <Card className="col-span-full shadow-lg">
        <CardContent className="py-12 text-center">
          <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Services Active</h3>
          <p className="text-muted-foreground mb-4">Contact your administrator to set up rental or house watching services.</p>
          <Link to="/messages">
            <Button>Contact Administrator</Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

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
                placeholder="Search properties..."
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderMetrics()}
        </div>

        {/* Main Content: Activity Feed + Quick Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className={ICON_SIZES.md} />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Last 10 activities for your properties</CardDescription>
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

          {/* Quick Navigation */}
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

// Helper component for metric cards
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  trend, 
  trendUp, 
  subtitle, 
  chart,
  isLoading 
}: { 
  title: string;
  value: string | number;
  icon: any;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: React.ReactNode;
  chart?: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className={cn(ICON_SIZES.md, iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-32" />
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            {trend && (
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className={cn(ICON_SIZES.sm, trendUp ? "text-success" : "text-destructive")} />
                <span className={cn("text-xs", trendUp ? "text-success" : "text-destructive")}>{trend}</span>
              </div>
            )}
            {subtitle}
            {chart}
          </>
        )}
      </CardContent>
    </Card>
  );
}
