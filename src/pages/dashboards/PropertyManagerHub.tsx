import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building, 
  Users,
  Wrench,
  DollarSign,
  Calendar,
  MessageSquare,
  Search,
  AlertCircle,
  TrendingUp,
  Home,
  Clock,
  ChevronRight,
  Eye,
  Send,
  ClipboardCheck,
  UserCheck,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { usePropertyManagerMetrics } from '@/hooks/usePropertyManagerMetrics';
import { formatSmartDate } from '@/lib/dateFormatter';
import { ICON_SIZES } from '@/lib/iconSizes';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PropertyManagerHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: metrics, isLoading } = usePropertyManagerMetrics();
  const navigate = useNavigate();

  const filteredProperties = metrics?.assignedProperties.filter(p => {
    const address = p.address?.toLowerCase() || '';
    return address.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Property Manager Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
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
        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className={ICON_SIZES.md} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <Link to="/leasing">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-primary hover:bg-primary/90">
                  <Calendar className={ICON_SIZES.lg} />
                  <span className="text-xs font-medium">Schedule Showing</span>
                </Button>
              </Link>
              <Link to="/maintenance">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-secondary hover:bg-secondary/90">
                  <Wrench className={ICON_SIZES.lg} />
                  <span className="text-xs font-medium">Assign Maintenance</span>
                </Button>
              </Link>
              <Link to="/messages">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-accent hover:bg-accent/90">
                  <Send className={ICON_SIZES.lg} />
                  <span className="text-xs font-medium">Send Notice</span>
                </Button>
              </Link>
              <Link to="/property-manager-home">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-warning hover:bg-warning/90 text-warning-foreground">
                  <ClipboardCheck className={ICON_SIZES.lg} />
                  <span className="text-xs font-medium">Property Inspection</span>
                </Button>
              </Link>
              <Link to="/properties">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-info hover:bg-info/90 text-info-foreground">
                  <Eye className={ICON_SIZES.lg} />
                  <span className="text-xs font-medium">Vacant Properties</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Assigned Properties"
            value={metrics?.totalProperties || 0}
            icon={Building}
            iconColor="text-primary"
            isLoading={isLoading}
          />
          <MetricCard
            title="Occupied / Vacant Units"
            value={`${metrics?.occupiedUnits || 0} / ${metrics?.vacantUnits || 0}`}
            icon={Users}
            iconColor="text-secondary"
            subtitle={
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-medium">
                    {metrics?.totalProperties 
                      ? ((metrics.occupiedUnits / metrics.totalProperties) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={metrics?.totalProperties 
                    ? (metrics.occupiedUnits / metrics.totalProperties) * 100 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
            }
            isLoading={isLoading}
          />
          <MetricCard
            title="Active Maintenance"
            value={`${metrics?.maintenanceByPriority.high || 0}H / ${metrics?.maintenanceByPriority.medium || 0}M / ${metrics?.maintenanceByPriority.low || 0}L`}
            icon={Wrench}
            iconColor="text-warning"
            subtitle={
              <div className="flex gap-2 mt-2">
                <Badge variant="destructive" className="text-xs">
                  {metrics?.maintenanceByPriority.high || 0} High
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {metrics?.maintenanceByPriority.medium || 0} Med
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {metrics?.maintenanceByPriority.low || 0} Low
                </Badge>
              </div>
            }
            isLoading={isLoading}
          />
          <MetricCard
            title="Rent Collection Rate"
            value={`${(metrics?.rentCollectionRate || 0).toFixed(1)}%`}
            icon={DollarSign}
            iconColor="text-success"
            subtitle={
              <Progress 
                value={metrics?.rentCollectionRate || 0} 
                className="h-2 mt-2" 
              />
            }
            isLoading={isLoading}
          />
          <MetricCard
            title="Showings This Week"
            value={metrics?.showingsThisWeek || 0}
            icon={Calendar}
            iconColor="text-info"
            isLoading={isLoading}
          />
          <MetricCard
            title="Unread Messages"
            value={metrics?.unreadMessages || 0}
            icon={MessageSquare}
            iconColor="text-accent"
            isLoading={isLoading}
          />
        </div>

        {/* Priority Tasks */}
        {(metrics && (
          (metrics.overdueMaintenance?.length || 0) > 0 ||
          (metrics.vacantProperties?.length || 0) > 0 ||
          (metrics.lateRentPayments?.length || 0) > 0 ||
          (metrics.upcomingLeaseExpirations?.length || 0) > 0
        )) && (
          <Card className="shadow-lg border-2 border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className={ICON_SIZES.md} />
                Priority Tasks Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(metrics?.overdueMaintenance?.length || 0) > 0 && (
                <Link to="/maintenance">
                  <Card className="border-2 border-destructive/30 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wrench className={cn(ICON_SIZES.md, "text-destructive")} />
                        <div>
                          <p className="font-semibold">Overdue Maintenance</p>
                          <p className="text-sm text-muted-foreground">
                            {metrics.overdueMaintenance.length} request{metrics.overdueMaintenance.length > 1 ? 's' : ''} past due date
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">{metrics.overdueMaintenance.length}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {(metrics?.vacantProperties?.length || 0) > 0 && (
                <Link to="/properties">
                  <Card className="border-2 border-warning/30 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Home className={cn(ICON_SIZES.md, "text-warning")} />
                        <div>
                          <p className="font-semibold">Vacant Properties</p>
                          <p className="text-sm text-muted-foreground">
                            {metrics.vacantProperties.length} propert{metrics.vacantProperties.length > 1 ? 'ies' : 'y'} need{metrics.vacantProperties.length === 1 ? 's' : ''} tenants
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-warning text-warning">
                        {metrics.vacantProperties.length}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {(metrics?.lateRentPayments?.length || 0) > 0 && (
                <Link to="/finances">
                  <Card className="border-2 border-destructive/30 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className={cn(ICON_SIZES.md, "text-destructive")} />
                        <div>
                          <p className="font-semibold">Late Rent Payments</p>
                          <p className="text-sm text-muted-foreground">
                            {metrics.lateRentPayments.length} tenant{metrics.lateRentPayments.length > 1 ? 's' : ''} with overdue rent
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">{metrics.lateRentPayments.length}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {(metrics?.upcomingLeaseExpirations?.length || 0) > 0 && (
                <Link to="/tenants">
                  <Card className="border-2 border-warning/30 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCheck className={cn(ICON_SIZES.md, "text-warning")} />
                        <div>
                          <p className="font-semibold">Upcoming Lease Expirations</p>
                          <p className="text-sm text-muted-foreground">
                            {metrics.upcomingLeaseExpirations.length} lease{metrics.upcomingLeaseExpirations.length > 1 ? 's' : ''} expiring in next 30 days
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-warning text-warning">
                        {metrics.upcomingLeaseExpirations.length}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content: This Week's Schedule + Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* This Week's Schedule */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className={ICON_SIZES.md} />
                    This Week's Schedule
                  </CardTitle>
                  <CardDescription>
                    {metrics?.weekSchedule?.length || 0} events scheduled
                  </CardDescription>
                </div>
                <Link to="/property-manager-home">
                  <Button variant="ghost" size="sm">
                    View Calendar
                    <ChevronRight className={ICON_SIZES.sm} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : (metrics?.weekSchedule?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {metrics?.weekSchedule?.map((event) => (
                    <Card key={`${event.type}-${event.id}`} className="border-2 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {event.type === 'showing' ? (
                              <Calendar className={cn(ICON_SIZES.md, "text-info flex-shrink-0")} />
                            ) : (
                              <Wrench className={cn(ICON_SIZES.md, "text-warning flex-shrink-0")} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatSmartDate(event.date)}
                                {event.time && ` at ${event.time}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant={event.type === 'showing' ? 'default' : 'secondary'}>
                            {event.type === 'showing' ? 'Showing' : 'Maintenance'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No events scheduled this week</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Properties Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className={ICON_SIZES.md} />
                  Properties
                </CardTitle>
                <CardDescription>
                  {metrics?.totalProperties || 0} properties managed
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : filteredProperties.length > 0 ? (
                <div className="space-y-3">
                  {filteredProperties.slice(0, 5).map((property) => {
                    const isVacant = !property.tenants || property.tenants.length === 0 || 
                      !property.tenants.some((t: any) => t.status === 'active');

                    return (
                      <Link key={property.id} to={`/properties/${property.id}`}>
                        <Card className={cn(
                          "border-2 hover:shadow-md transition-all cursor-pointer",
                          isVacant && "border-warning/30 bg-warning/5"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{property.address}</p>
                                <p className="text-sm text-muted-foreground">
                                  {property.city}, {property.state}
                                </p>
                              </div>
                              <Badge variant={isVacant ? 'outline' : 'secondary'} className={isVacant ? "border-warning text-warning" : ""}>
                                {isVacant ? 'Vacant' : 'Occupied'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                  {filteredProperties.length > 5 && (
                    <Link to="/properties">
                      <Button variant="outline" className="w-full">
                        View All {filteredProperties.length} Properties
                        <ArrowRight className={cn(ICON_SIZES.sm, "ml-2")} />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No properties assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className={ICON_SIZES.md} />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 10 events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (metrics?.recentActivity?.length || 0) > 0 ? (
              <div className="space-y-2">
                {metrics?.recentActivity?.map((activity) => (
                  <div 
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {activity.type === 'maintenance' ? (
                        <Wrench className={cn(ICON_SIZES.md, "text-warning flex-shrink-0")} />
                      ) : (
                        <DollarSign className={cn(ICON_SIZES.md, "text-success flex-shrink-0")} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSmartDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
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
  subtitle,
  isLoading 
}: { 
  title: string;
  value: string | number;
  icon: any;
  iconColor: string;
  subtitle?: React.ReactNode;
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
            {subtitle}
          </>
        )}
      </CardContent>
    </Card>
  );
}
