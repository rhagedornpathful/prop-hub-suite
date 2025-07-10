import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { usePropertyMetrics } from "@/hooks/queries/useProperties";
import { useHouseWatchingMetrics } from "@/hooks/queries/useHouseWatching";
import { useRealtime } from "@/hooks/useRealtime";
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Wrench,
  Shield,
  Eye
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<any>;
  color: "primary" | "secondary" | "success" | "warning" | "accent";
}

const MetricCard = ({ title, value, change, trend, icon: Icon, color }: MetricCardProps) => {
  const colorClasses = {
    primary: "bg-gradient-primary",
    secondary: "bg-gradient-secondary", 
    success: "bg-gradient-success",
    warning: "bg-warning",
    accent: "bg-gradient-accent"
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground"
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className={`h-4 w-4 ${trendColors[trend]}`} />
            <span className={`text-xs ${trendColors[trend]}`}>
              {change}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function DashboardMetrics() {
  const { data: propertyMetrics, isLoading: propertyLoading } = usePropertyMetrics();
  const { data: houseWatchingMetrics, isLoading: houseWatchingLoading } = useHouseWatchingMetrics();
  
  // Enable real-time updates
  useRealtime();
  
  const isLoading = propertyLoading || houseWatchingLoading;
  
  const metrics = {
    totalProperties: propertyMetrics?.totalProperties || 0,
    houseWatchingProperties: houseWatchingMetrics?.totalClients || 0,
    monthlyRevenue: (propertyMetrics?.totalRent || 0) + (houseWatchingMetrics?.totalRevenue || 0),
    totalCustomers: (propertyMetrics?.totalProperties || 0) + (houseWatchingMetrics?.totalClients || 0),
    overdueChecks: houseWatchingMetrics?.overdueCounts || 0,
    occupiedUnits: propertyMetrics?.occupiedUnits || 0,
    totalUnits: propertyMetrics?.totalProperties || 0,
  };

  const metricsData = [
    {
      title: "Total Customers",
      value: isLoading ? "..." : metrics.totalCustomers.toString(),
      change: "All service types",
      trend: "neutral" as const,
      icon: Users,
      color: "primary" as const
    },
    {
      title: "House Watching",
      value: isLoading ? "..." : metrics.houseWatchingProperties.toString(),
      change: "Monitoring services",
      trend: "up" as const,
      icon: Shield,
      color: "accent" as const
    },
    {
      title: "Rental Properties",
      value: isLoading ? "..." : metrics.totalProperties.toString(),
      change: "Property management",
      trend: "up" as const,
      icon: Building,
      color: "secondary" as const
    },
    {
      title: "Monthly Revenue",
      value: isLoading ? "..." : `$${metrics.monthlyRevenue.toLocaleString()}`,
      change: "Combined services",
      trend: "up" as const,
      icon: DollarSign,
      color: "success" as const
    }
  ];

  const occupancyRate = metrics.totalUnits > 0 ? (metrics.occupiedUnits / metrics.totalUnits) * 100 : 0;

  return (
    <div className="space-y-6">
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.05}>
        {metricsData.map((metric) => (
          <AnimatedListItem key={metric.title}>
            <MetricCard {...metric} />
          </AnimatedListItem>
        ))}
      </AnimatedList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Overview */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Property Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <Building className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-lg font-bold">{metrics.totalProperties}</div>
                <div className="text-xs text-muted-foreground">Rental Properties</div>
              </div>
              <div className="text-center p-3 bg-accent/10 rounded-lg">
                <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                <div className="text-lg font-bold">{metrics.houseWatchingProperties}</div>
                <div className="text-xs text-muted-foreground">House Watching</div>
              </div>
            </div>
            {metrics.totalUnits > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">{occupancyRate.toFixed(0)}%</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Alerts */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Service Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {metrics.overdueChecks > 0 && (
                <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                  <Eye className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Overdue house checks</div>
                    <div className="text-xs text-muted-foreground">{metrics.overdueChecks} properties need checking</div>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">
                    Action needed
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Services running smoothly</div>
                  <div className="text-xs text-muted-foreground">All systems operational</div>
                </div>
                <Badge variant="outline" className="text-success border-success">
                  Good
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Upcoming schedules</div>
                  <div className="text-xs text-muted-foreground">Check calendar for details</div>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  Reminder
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}