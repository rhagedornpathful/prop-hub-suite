import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building, 
  Camera,
  CheckCircle2,
  Clock,
  Home,
  MessageSquare,
  Play,
  Search,
  Wrench,
  Calendar,
  AlertCircle,
  MapPin,
  User,
  ChevronRight,
} from 'lucide-react';
import { useHouseWatcherMetrics } from '@/hooks/useHouseWatcherMetrics';
import { formatSmartDate } from '@/lib/dateFormatter';
import { ICON_SIZES } from '@/lib/iconSizes';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function HouseWatcherHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: metrics, isLoading } = useHouseWatcherMetrics();
  const navigate = useNavigate();

  const filteredProperties = metrics?.assignedProperties.filter(p => {
    const address = p.properties?.address || p.property_address || '';
    return address.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  // Group this week's checks by date
  const checksByDate = metrics?.weekChecks.reduce((acc, check) => {
    const date = check.scheduled_date || '';
    if (!acc[date]) acc[date] = [];
    acc[date].push(check);
    return acc;
  }, {} as Record<string, typeof metrics.weekChecks>) || {};

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24 md:pb-6">
      {/* Mobile-Optimized Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                House Watcher Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="relative w-full">
              <Search className={cn(ICON_SIZES.sm, "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground")} />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Overview - Large Card */}
        <Card className="shadow-xl border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className={ICON_SIZES.md} />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {metrics?.checksScheduledToday || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Scheduled</div>
                </div>
                <div className="bg-success/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-success">
                    {metrics?.checksCompletedToday || 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Completed</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center col-span-2">
                  <div className="text-sm text-muted-foreground">Next Check Due</div>
                  <div className="text-lg font-bold mt-1">
                    {metrics?.nextCheck ? (
                      <>
                        {format(new Date(metrics.nextCheck.scheduled_date), 'h:mm a')}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({formatSmartDate(metrics.nextCheck.scheduled_date)})
                        </span>
                      </>
                    ) : (
                      'No upcoming checks'
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Large Touch Targets */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/house-watcher/checks">
                <Button 
                  size="lg" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-lg"
                >
                  <Play className={ICON_SIZES.xl} />
                  <span className="font-semibold">Start Check</span>
                </Button>
              </Link>
              <Link to="/house-watcher/checks">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 text-lg"
                >
                  <Camera className={ICON_SIZES.xl} />
                  <span className="font-semibold">Upload Photos</span>
                </Button>
              </Link>
              <Link to="/maintenance">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 text-lg"
                >
                  <Wrench className={ICON_SIZES.xl} />
                  <span className="font-semibold">Report Issue</span>
                </Button>
              </Link>
              <Link to="/messages">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 text-lg"
                >
                  <MessageSquare className={ICON_SIZES.xl} />
                  <span className="font-semibold">Messages</span>
                  {(metrics?.maintenanceRequests?.length || 0) > 0 && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      {metrics?.maintenanceRequests?.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* This Week's Checks */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className={ICON_SIZES.md} />
                  This Week's Schedule
                </CardTitle>
                <CardDescription>
                  {metrics?.weekChecks?.length || 0} checks scheduled
                </CardDescription>
              </div>
              <Link to="/house-watcher-home">
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
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : Object.keys(checksByDate).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(checksByDate).map(([date, checks]) => (
                  <div key={date}>
                    <div className="text-sm font-semibold text-muted-foreground mb-2">
                      {formatSmartDate(date)}
                    </div>
                    <div className="space-y-2">
                      {checks.map((check) => {
                        const property = metrics?.assignedProperties.find(
                          p => p.property_id?.toString() === check.property_id
                        );
                        const isToday = date === new Date().toISOString().split('T')[0];
                        const isDue = check.status === 'scheduled';

                        return (
                          <Card 
                            key={check.id} 
                            className={cn(
                              "border-2 cursor-pointer transition-all hover:shadow-md",
                              isDue && isToday && "border-primary bg-primary/5"
                            )}
                            onClick={() => navigate(`/home-check?session=${check.id}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Building className={cn(ICON_SIZES.sm, "text-primary flex-shrink-0")} />
                                    <p className="font-semibold truncate">
                                      {property?.properties?.address || property?.property_address || 'Unknown Property'}
                                    </p>
                                  </div>
                                  {check.scheduled_time && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Clock className={ICON_SIZES.xs} />
                                      {check.scheduled_time}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {check.status === 'completed' ? (
                                    <Badge variant="secondary" className="gap-1">
                                      <CheckCircle2 className={ICON_SIZES.xs} />
                                      Done
                                    </Badge>
                                  ) : isDue && isToday ? (
                                    <Badge variant="default" className="gap-1 animate-pulse">
                                      <AlertCircle className={ICON_SIZES.xs} />
                                      Due Today
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Scheduled</Badge>
                                  )}
                                  {isDue && (
                                    <Button size="sm" className="h-8">
                                      Start
                                      <Play className={cn(ICON_SIZES.xs, "ml-1")} />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No checks scheduled this week</p>
                <Link to="/house-watcher-home">
                  <Button variant="outline" className="mt-4">
                    View Full Schedule
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Properties */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className={ICON_SIZES.md} />
                  My Properties
                </CardTitle>
                <CardDescription>
                  {metrics?.totalProperties || 0} assigned properties
                </CardDescription>
              </div>
              {(metrics?.propertiesNeedingAttention || 0) > 0 && (
                <Badge variant="destructive">
                  {metrics?.propertiesNeedingAttention} Overdue
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="space-y-3">
                {filteredProperties.map((property) => {
                  const propertyData = property.properties;
                  const address = propertyData?.address || property.property_address || 'Unknown Address';
                  const isOverdue = property.next_check_date && 
                    new Date(property.next_check_date) < new Date();

                  return (
                    <Link key={property.id} to={`/house-watcher-properties`}>
                      <Card className={cn(
                        "border-2 hover:shadow-md transition-all cursor-pointer",
                        isOverdue && "border-destructive/50 bg-destructive/5"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                              isOverdue ? "bg-destructive/10" : "bg-primary/10"
                            )}>
                              <Home className={cn(
                                ICON_SIZES.lg,
                                isOverdue ? "text-destructive" : "text-primary"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{address}</p>
                                  {propertyData?.city && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className={ICON_SIZES.xs} />
                                      {propertyData.city}, {propertyData.state}
                                    </p>
                                  )}
                                </div>
                                {isOverdue && (
                                  <Badge variant="destructive" className="flex-shrink-0">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Last Check:</span>
                                  <p className="font-medium">
                                    {property.last_check_date 
                                      ? formatSmartDate(property.last_check_date)
                                      : 'Never'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Next Due:</span>
                                  <p className={cn(
                                    "font-medium",
                                    isOverdue && "text-destructive"
                                  )}>
                                    {property.next_check_date 
                                      ? formatSmartDate(property.next_check_date)
                                      : 'Not scheduled'}
                                  </p>
                                </div>
                              </div>
                              {property.owner_name && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <User className={ICON_SIZES.xs} />
                                  Owner: {property.owner_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No properties assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className={ICON_SIZES.md} />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Last {metrics?.recentChecks?.length || 0} completed checks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (metrics?.recentChecks?.length || 0) > 0 ? (
              <div className="space-y-2">
                {metrics?.recentChecks?.map((check) => {
                  const property = metrics?.assignedProperties.find(
                    p => p.property_id?.toString() === check.property_id
                  );

                  return (
                    <div 
                      key={check.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CheckCircle2 className={cn(ICON_SIZES.md, "text-success flex-shrink-0")} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {property?.properties?.address || property?.property_address || 'Unknown Property'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatSmartDate(check.completed_at || check.created_at)}
                          </p>
                        </div>
                      </div>
                      {check.duration_minutes && (
                        <Badge variant="outline" className="flex-shrink-0">
                          {check.duration_minutes}m
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No completed checks yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {metrics?.totalChecksThisYear || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Checks Completed This Year
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
