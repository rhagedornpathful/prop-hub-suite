import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign,
  Calendar,
  Wrench,
  MessageSquare,
  FileText,
  UserCheck,
  Home,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useTenantMetrics } from '@/hooks/useTenantMetrics';
import { formatSmartDate } from '@/lib/dateFormatter';
import { ICON_SIZES } from '@/lib/iconSizes';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TenantHub() {
  const { data: metrics, isLoading } = useTenantMetrics();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Tenant Portal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              {metrics?.propertyDetails && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Home className={ICON_SIZES.xs} />
                  {metrics.propertyDetails.address}, {metrics.propertyDetails.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
        {!metrics?.tenant ? (
          <Card className="shadow-lg border-2 border-warning/50">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-warning" />
              <h3 className="text-lg font-semibold mb-2">No Active Lease Found</h3>
              <p className="text-muted-foreground mb-4">
                You don't appear to have an active lease in the system.
              </p>
              <Link to="/messages">
                <Button>Contact Property Manager</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className={ICON_SIZES.md} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link to="/finances">
                    <Button 
                      size="lg" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-lg"
                    >
                      <DollarSign className={ICON_SIZES.xl} />
                      <span className="font-semibold text-sm">Pay Rent</span>
                    </Button>
                  </Link>
                  <Link to="/maintenance">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="w-full h-24 flex flex-col items-center justify-center gap-2 text-lg"
                    >
                      <Wrench className={ICON_SIZES.xl} />
                      <span className="font-semibold text-sm">Submit Request</span>
                    </Button>
                  </Link>
                  <Link to="/documents">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full h-24 flex flex-col items-center justify-center gap-2 text-lg"
                    >
                      <FileText className={ICON_SIZES.xl} />
                      <span className="font-semibold text-sm">View Lease</span>
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full h-24 flex flex-col items-center justify-center gap-2 text-lg relative"
                    >
                      <MessageSquare className={ICON_SIZES.xl} />
                      <span className="font-semibold text-sm">Contact Manager</span>
                      {(metrics?.unreadMessages || 0) > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                          {metrics?.unreadMessages}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Rent Due Alert */}
            {!metrics?.rentPaidThisMonth && metrics?.rentDueThisMonth > 0 && (
              <Link to="/finances">
                <Card className="shadow-lg border-2 border-primary cursor-pointer hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className={cn(ICON_SIZES.xl, "text-primary")} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rent Due This Month</p>
                          <p className="text-3xl font-bold">${metrics.rentDueThisMonth.toFixed(2)}</p>
                          {metrics.rentDueDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Due {formatSmartDate(metrics.rentDueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="lg" className="flex-shrink-0">
                        Pay Now
                        <ArrowRight className={cn(ICON_SIZES.sm, "ml-2")} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Rent Paid Confirmation */}
            {metrics?.rentPaidThisMonth && (
              <Card className="shadow-lg border-2 border-success/50 bg-success/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className={cn(ICON_SIZES.xl, "text-success")} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-success">Rent Paid for This Month</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Thank you for your payment of ${metrics.rentDueThisMonth.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Lease End Date"
                value={metrics?.leaseEndDate 
                  ? format(new Date(metrics.leaseEndDate), 'MMM d, yyyy')
                  : 'N/A'
                }
                icon={Calendar}
                iconColor="text-primary"
                subtitle={
                  metrics?.daysUntilLeaseEnd !== null ? (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {metrics.daysUntilLeaseEnd > 0 
                          ? `${metrics.daysUntilLeaseEnd} days remaining`
                          : 'Lease expired'
                        }
                      </p>
                      {metrics.daysUntilLeaseEnd > 0 && metrics.daysUntilLeaseEnd <= 60 && (
                        <Badge variant="outline" className="mt-2 border-warning text-warning">
                          Renewal needed soon
                        </Badge>
                      )}
                    </div>
                  ) : null
                }
                isLoading={isLoading}
              />
              <MetricCard
                title="Active Maintenance Requests"
                value={metrics?.activeMaintenanceRequests || 0}
                icon={Wrench}
                iconColor="text-warning"
                subtitle={
                  (metrics?.activeMaintenanceRequests || 0) > 0 ? (
                    <Link to="/maintenance">
                      <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                        View Requests
                        <ArrowRight className={cn(ICON_SIZES.xs, "ml-1")} />
                      </Button>
                    </Link>
                  ) : null
                }
                isLoading={isLoading}
              />
              <MetricCard
                title="Unread Messages"
                value={metrics?.unreadMessages || 0}
                icon={MessageSquare}
                iconColor="text-info"
                subtitle={
                  (metrics?.unreadMessages || 0) > 0 ? (
                    <Link to="/messages">
                      <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                        View Messages
                        <ArrowRight className={cn(ICON_SIZES.xs, "ml-1")} />
                      </Button>
                    </Link>
                  ) : null
                }
                isLoading={isLoading}
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className={ICON_SIZES.md} />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Your payments and maintenance history</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                    </div>
                  ) : (metrics?.recentActivity?.length || 0) > 0 ? (
                    <div className="space-y-2">
                      {metrics?.recentActivity?.map((activity) => (
                        <Card key={`${activity.type}-${activity.id}`} className="border-2 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {activity.type === 'maintenance' ? (
                                  <Wrench className={cn(ICON_SIZES.md, "text-warning")} />
                                ) : (
                                  <DollarSign className={cn(ICON_SIZES.md, "text-success")} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold">{activity.title}</p>
                                    {activity.description && (
                                      <p className="text-sm text-muted-foreground mt-0.5">
                                        {activity.description}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatSmartDate(activity.date)}
                                    </p>
                                  </div>
                                  {activity.type === 'maintenance' && (
                                    <Badge variant={
                                      activity.status === 'completed' ? 'secondary' : 
                                      activity.status === 'in_progress' ? 'default' : 
                                      'outline'
                                    }>
                                      {activity.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Navigation */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className={ICON_SIZES.md} />
                    Quick Links
                  </CardTitle>
                  <CardDescription>Access important sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/finances">
                      <Card className="border-2 hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <DollarSign className={cn(ICON_SIZES.lg, "text-success")} />
                              <div>
                                <p className="font-semibold">Pay Rent</p>
                                <p className="text-xs text-muted-foreground">Payment history</p>
                              </div>
                            </div>
                            <ArrowRight className={ICON_SIZES.sm} />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/maintenance">
                      <Card className="border-2 hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Wrench className={cn(ICON_SIZES.lg, "text-warning")} />
                              <div>
                                <p className="font-semibold">Maintenance</p>
                                <p className="text-xs text-muted-foreground">Submit requests</p>
                              </div>
                            </div>
                            {(metrics?.activeMaintenanceRequests || 0) > 0 && (
                              <Badge>{metrics?.activeMaintenanceRequests}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/documents">
                      <Card className="border-2 hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className={cn(ICON_SIZES.lg, "text-primary")} />
                              <div>
                                <p className="font-semibold">Lease Documents</p>
                                <p className="text-xs text-muted-foreground">View & download</p>
                              </div>
                            </div>
                            <ArrowRight className={ICON_SIZES.sm} />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/messages">
                      <Card className="border-2 hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MessageSquare className={cn(ICON_SIZES.lg, "text-info")} />
                              <div>
                                <p className="font-semibold">Messages</p>
                                <p className="text-xs text-muted-foreground">Contact manager</p>
                              </div>
                            </div>
                            {(metrics?.unreadMessages || 0) > 0 && (
                              <Badge variant="destructive">{metrics?.unreadMessages}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
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
