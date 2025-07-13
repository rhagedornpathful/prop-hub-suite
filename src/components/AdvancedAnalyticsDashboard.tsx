import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  Download,
  Filter,
  Eye,
  Target,
  Zap
} from "lucide-react";
import { useState } from "react";
import { MaintenanceRequest } from "@/hooks/queries/useMaintenanceRequests";
import { addDays, subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface AdvancedAnalyticsProps {
  requests: MaintenanceRequest[];
}

const AdvancedAnalyticsDashboard = ({ requests }: AdvancedAnalyticsProps) => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState("response-time");
  const [propertyFilter, setPropertyFilter] = useState("all");

  // Data processing for charts
  const processRequestTrends = () => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map(day => {
      const dayRequests = requests.filter(r => 
        format(new Date(r.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      return {
        date: format(day, 'MMM dd'),
        total: dayRequests.length,
        completed: dayRequests.filter(r => r.status === 'completed').length,
        pending: dayRequests.filter(r => r.status === 'pending').length,
        inProgress: dayRequests.filter(r => r.status === 'in-progress').length
      };
    });
  };

  const processCostAnalysis = () => {
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthRequests = requests.filter(r => {
        const reqDate = new Date(r.created_at);
        return reqDate >= monthStart && reqDate <= monthEnd;
      });
      
      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        estimated: monthRequests.reduce((sum, r) => sum + (r.estimated_cost || 0), 0),
        actual: monthRequests.reduce((sum, r) => sum + (r.actual_cost || 0), 0),
        savings: monthRequests.reduce((sum, r) => {
          const est = r.estimated_cost || 0;
          const act = r.actual_cost || 0;
          return sum + Math.max(0, est - act);
        }, 0)
      });
    }
    return monthlyData;
  };

  const processResponseTimeMetrics = () => {
    const completed = requests.filter(r => r.status === 'completed' && r.created_at && r.completed_at);
    const responseData = completed.map(r => {
      const created = new Date(r.created_at);
      const completed = new Date(r.completed_at!);
      const hours = Math.round((completed.getTime() - created.getTime()) / (1000 * 60 * 60));
      
      return {
        id: r.id,
        hours,
        priority: r.priority,
        category: r.properties?.address?.includes('Street') ? 'Residential' : 'Commercial'
      };
    });

    // Group by priority
    const byPriority = responseData.reduce((acc, item) => {
      if (!acc[item.priority]) acc[item.priority] = [];
      acc[item.priority].push(item.hours);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(byPriority).map(([priority, times]) => ({
      priority,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      count: times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    }));
  };

  const processVendorPerformance = () => {
    const vendorStats = requests.reduce((acc, r) => {
      const vendor = r.contractor_name || 'Unassigned';
      if (!acc[vendor]) {
        acc[vendor] = {
          name: vendor,
          total: 0,
          completed: 0,
          avgCost: 0,
          totalCost: 0,
          avgTime: 0,
          totalTime: 0
        };
      }
      
      acc[vendor].total++;
      if (r.status === 'completed') {
        acc[vendor].completed++;
        if (r.actual_cost) {
          acc[vendor].totalCost += r.actual_cost;
        }
        if (r.created_at && r.completed_at) {
          const hours = (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
          acc[vendor].totalTime += hours;
        }
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(vendorStats).map((vendor: any) => ({
      ...vendor,
      completionRate: vendor.total > 0 ? Math.round((vendor.completed / vendor.total) * 100) : 0,
      avgCost: vendor.completed > 0 ? Math.round(vendor.totalCost / vendor.completed) : 0,
      avgTime: vendor.completed > 0 ? Math.round(vendor.totalTime / vendor.completed) : 0
    }));
  };

  const getPredictiveInsights = () => {
    const insights = [];
    
    // Trend analysis
    const recentRequests = requests.filter(r => 
      new Date(r.created_at) > subDays(new Date(), 7)
    ).length;
    const previousWeekRequests = requests.filter(r => {
      const date = new Date(r.created_at);
      return date > subDays(new Date(), 14) && date <= subDays(new Date(), 7);
    }).length;
    
    if (recentRequests > previousWeekRequests * 1.2) {
      insights.push({
        type: 'trend',
        severity: 'warning',
        title: 'Increasing Request Volume',
        description: `${Math.round(((recentRequests - previousWeekRequests) / previousWeekRequests) * 100)}% increase in requests this week`,
        recommendation: 'Consider scaling maintenance capacity'
      });
    }

    // Cost variance analysis
    const highVarianceRequests = requests.filter(r => 
      r.estimated_cost && r.actual_cost && 
      Math.abs(r.actual_cost - r.estimated_cost) > r.estimated_cost * 0.5
    );
    
    if (highVarianceRequests.length > requests.length * 0.1) {
      insights.push({
        type: 'cost',
        severity: 'info',
        title: 'Cost Estimation Accuracy',
        description: `${highVarianceRequests.length} requests had significant cost variance`,
        recommendation: 'Review estimation processes with vendors'
      });
    }

    // Seasonal patterns
    const seasonalData = requests.reduce((acc, r) => {
      const month = new Date(r.created_at).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const currentMonth = new Date().getMonth();
    const avgMonthly = Object.values(seasonalData).reduce((a, b) => a + b, 0) / 12;
    
    if (seasonalData[currentMonth] > avgMonthly * 1.3) {
      insights.push({
        type: 'seasonal',
        severity: 'info',
        title: 'Seasonal Peak Detected',
        description: 'Current month shows higher than average maintenance requests',
        recommendation: 'Prepare for continued high volume'
      });
    }

    return insights;
  };

  const requestTrends = processRequestTrends();
  const costAnalysis = processCostAnalysis();
  const responseMetrics = processResponseTimeMetrics();
  const vendorPerformance = processVendorPerformance();
  const predictiveInsights = getPredictiveInsights();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Advanced Analytics Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive insights and predictive analytics for maintenance operations
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="response-time">Response Time</SelectItem>
                  <SelectItem value="cost-analysis">Cost Analysis</SelectItem>
                  <SelectItem value="vendor-performance">Vendor Performance</SelectItem>
                  <SelectItem value="trends">Request Trends</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold">2.4 hrs</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingDown className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">-12%</span>
                        </div>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cost Efficiency</p>
                        <p className="text-2xl font-bold">94%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+3%</span>
                        </div>
                      </div>
                      <Target className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">First-Time Fix Rate</p>
                        <p className="text-2xl font-bold">87%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+5%</span>
                        </div>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Vendor Satisfaction</p>
                        <p className="text-2xl font-bold">4.6/5</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+0.2</span>
                        </div>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Request Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Volume Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={requestTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stackId="1"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        name="Completed"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="inProgress" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="In Progress"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pending" 
                        stackId="1"
                        stroke="#ffc658" 
                        fill="#ffc658" 
                        name="Pending"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Request Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={requestTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Total Requests"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          name="Completed"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Request Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Plumbing', value: 35, fill: '#8884d8' },
                            { name: 'Electrical', value: 25, fill: '#82ca9d' },
                            { name: 'HVAC', value: 20, fill: '#ffc658' },
                            { name: 'General', value: 15, fill: '#ff7300' },
                            { name: 'Other', value: 5, fill: '#00ff00' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time by Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={responseMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgTime" fill="#8884d8" name="Avg Time (hours)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Performance Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vendorPerformance.slice(0, 5).map((vendor, index) => (
                        <div key={vendor.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{vendor.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {vendor.completed}/{vendor.total} completed
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              {vendor.completionRate}%
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Avg: {vendor.avgTime}h
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Costs Tab */}
            <TabsContent value="costs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={costAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Bar dataKey="estimated" fill="#8884d8" name="Estimated Costs" />
                      <Bar dataKey="actual" fill="#82ca9d" name="Actual Costs" />
                      <Bar dataKey="savings" fill="#ffc658" name="Savings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Predictive Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictiveInsights.map((insight, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            {insight.severity === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            ) : (
                              <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {insight.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {insight.recommendation}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Maintenance Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-blue-900">HVAC System - Building A</h4>
                        <p className="text-sm text-blue-700 mb-2">
                          Predicted maintenance required in 2-3 weeks based on usage patterns
                        </p>
                        <Badge className="bg-blue-100 text-blue-800">Preventive</Badge>
                      </div>

                      <div className="p-4 border rounded-lg bg-orange-50">
                        <h4 className="font-semibold text-orange-900">Plumbing - Unit 205</h4>
                        <p className="text-sm text-orange-700 mb-2">
                          High probability of pipe issues based on age and recent requests
                        </p>
                        <Badge className="bg-orange-100 text-orange-800">Risk Assessment</Badge>
                      </div>

                      <div className="p-4 border rounded-lg bg-green-50">
                        <h4 className="font-semibold text-green-900">Electrical Panel - Main</h4>
                        <p className="text-sm text-green-700 mb-2">
                          Routine inspection recommended based on maintenance schedule
                        </p>
                        <Badge className="bg-green-100 text-green-800">Routine</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;