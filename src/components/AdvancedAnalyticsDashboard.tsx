import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Users, 
  Wrench,
  Calendar,
  Target,
  AlertTriangle
} from 'lucide-react';

// Mock data for demonstrations
const monthlyRevenue = [
  { month: 'Jan', revenue: 45000, expenses: 23000, profit: 22000 },
  { month: 'Feb', revenue: 48000, expenses: 25000, profit: 23000 },
  { month: 'Mar', revenue: 47000, expenses: 24000, profit: 23000 },
  { month: 'Apr', revenue: 52000, expenses: 26000, profit: 26000 },
  { month: 'May', revenue: 55000, expenses: 28000, profit: 27000 },
  { month: 'Jun', revenue: 58000, expenses: 29000, profit: 29000 },
];

const propertyPerformance = [
  { name: '123 Main St', occupancy: 95, revenue: 12000, maintenance: 450 },
  { name: '456 Oak Ave', occupancy: 88, revenue: 9500, maintenance: 320 },
  { name: '789 Pine Rd', occupancy: 100, revenue: 15000, maintenance: 200 },
  { name: '321 Elm St', occupancy: 92, revenue: 11000, maintenance: 380 },
];

const maintenanceStats = [
  { category: 'Plumbing', count: 15, cost: 3200, color: '#8884d8' },
  { category: 'Electrical', count: 8, cost: 2100, color: '#82ca9d' },
  { category: 'HVAC', count: 12, cost: 4500, color: '#ffc658' },
  { category: 'General', count: 25, cost: 1800, color: '#ff7c7c' },
];

const occupancyTrend = [
  { month: 'Jan', rate: 92 },
  { month: 'Feb', rate: 94 },
  { month: 'Mar', rate: 90 },
  { month: 'Apr', rate: 96 },
  { month: 'May', rate: 98 },
  { month: 'Jun', rate: 95 },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  format?: 'currency' | 'percentage' | 'number';
}

const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }: MetricCardProps) => {
  const isPositive = change > 0;
  const formattedValue = format === 'currency' 
    ? `$${value.toLocaleString()}` 
    : format === 'percentage' 
    ? `${value}%` 
    : value.toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change)}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const AdvancedAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={58000}
          change={5.2}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Occupancy Rate"
          value={95}
          change={2.1}
          icon={Home}
          format="percentage"
        />
        <MetricCard
          title="Active Tenants"
          value={87}
          change={3.5}
          icon={Users}
        />
        <MetricCard
          title="Maintenance Requests"
          value={23}
          change={-12.5}
          icon={Wrench}
        />
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>

        {/* Financial Analytics */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>
                  Monthly financial performance over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stackId="2"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
                <CardDescription>
                  Net profit analysis and projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Profit']} />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#ffc658" 
                      strokeWidth={3}
                      dot={{ fill: '#ffc658', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Property Performance */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Overview</CardTitle>
              <CardDescription>
                Individual property metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyPerformance.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{property.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Occupancy:</span>
                          <Badge variant={property.occupancy >= 95 ? 'default' : 'secondary'}>
                            {property.occupancy}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Revenue:</span>
                          <span className="font-medium">${property.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Maintenance:</span>
                          <span className="text-sm">${property.maintenance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress value={property.occupancy} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Analytics */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance by Category</CardTitle>
                <CardDescription>
                  Distribution of maintenance requests and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={maintenanceStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {maintenanceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs</CardTitle>
                <CardDescription>
                  Cost breakdown by maintenance category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={maintenanceStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                    <Bar dataKey="cost" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Occupancy Analytics */}
        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate Trend</CardTitle>
              <CardDescription>
                Monthly occupancy rates and seasonal patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <Progress value={94.2} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vacant Units</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Out of 87 total units
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Lease Length</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14.2</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Months per lease
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;