import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Wrench
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
  );
};

export function DashboardMetrics() {
  const metrics = [
    {
      title: "Total Properties",
      value: "24",
      change: "+2 this month",
      trend: "up" as const,
      icon: Building,
      color: "primary" as const
    },
    {
      title: "Active Tenants",
      value: "18",
      change: "+1 this week",
      trend: "up" as const,
      icon: Users,
      color: "secondary" as const
    },
    {
      title: "Monthly Revenue",
      value: "$32,400",
      change: "+8.2% from last month",
      trend: "up" as const,
      icon: DollarSign,
      color: "success" as const
    },
    {
      title: "Occupancy Rate",
      value: "94%",
      change: "+2% from last month",
      trend: "up" as const,
      icon: TrendingUp,
      color: "accent" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Overview */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Property Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Occupied Units</span>
                <span className="font-medium">18/24</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Available for rent</span>
              </div>
              <Badge variant="outline" className="text-success border-success">
                6 units
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1 text-sm">
                  <span className="font-medium">Payment received</span>
                  <span className="text-muted-foreground"> - Unit 302</span>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1 text-sm">
                  <span className="font-medium">Maintenance request</span>
                  <span className="text-muted-foreground"> - Unit 105</span>
                </div>
                <span className="text-xs text-muted-foreground">5h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1 text-sm">
                  <span className="font-medium">Lease renewal</span>
                  <span className="text-muted-foreground"> - Unit 204</span>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning" />
              <div className="flex-1">
                <div className="font-medium text-sm">Rent overdue</div>
                <div className="text-xs text-muted-foreground">Unit 108 - 5 days overdue</div>
              </div>
              <Badge variant="outline" className="text-warning border-warning">
                Action needed
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="font-medium text-sm">Lease expiring soon</div>
                <div className="text-xs text-muted-foreground">Unit 306 - Expires in 30 days</div>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                Reminder
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
              <Wrench className="h-4 w-4 text-secondary" />
              <div className="flex-1">
                <div className="font-medium text-sm">Maintenance scheduled</div>
                <div className="text-xs text-muted-foreground">HVAC inspection - Building A</div>
              </div>
              <Badge variant="outline" className="text-secondary border-secondary">
                Scheduled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}