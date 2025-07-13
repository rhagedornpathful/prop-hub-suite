import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Database,
  Server,
  Wifi,
  Shield,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  target?: number;
}

const PerformanceMonitor = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  // System Performance Metrics
  const systemMetrics: MetricData[] = [
    {
      id: 'response_time',
      name: 'Response Time',
      value: 245,
      unit: 'ms',
      change: -12,
      trend: 'down',
      status: 'good',
      target: 500
    },
    {
      id: 'uptime',
      name: 'System Uptime',
      value: 99.8,
      unit: '%',
      change: 0.1,
      trend: 'up',
      status: 'good',
      target: 99.5
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.12,
      unit: '%',
      change: -0.05,
      trend: 'down',
      status: 'good',
      target: 0.5
    },
    {
      id: 'throughput',
      name: 'Request Throughput',
      value: 1250,
      unit: 'req/min',
      change: 85,
      trend: 'up',
      status: 'good'
    }
  ];

  // Business Performance Metrics
  const businessMetrics: MetricData[] = [
    {
      id: 'avg_resolution_time',
      name: 'Avg Resolution Time',
      value: 2.4,
      unit: 'days',
      change: -0.3,
      trend: 'down',
      status: 'good',
      target: 3.0
    },
    {
      id: 'tenant_satisfaction',
      name: 'Tenant Satisfaction',
      value: 4.6,
      unit: '/5',
      change: 0.2,
      trend: 'up',
      status: 'good',
      target: 4.5
    },
    {
      id: 'cost_per_request',
      name: 'Cost per Request',
      value: 285,
      unit: '$',
      change: -15,
      trend: 'down',
      status: 'good'
    },
    {
      id: 'completion_rate',
      name: 'Completion Rate',
      value: 94.2,
      unit: '%',
      change: 1.8,
      trend: 'up',
      status: 'good',
      target: 90
    }
  ];

  // Sample time series data
  const timeSeriesData = [
    { time: '00:00', requests: 120, errors: 2, response_time: 250 },
    { time: '04:00', requests: 89, errors: 1, response_time: 230 },
    { time: '08:00', requests: 340, errors: 5, response_time: 280 },
    { time: '12:00', requests: 450, errors: 8, response_time: 320 },
    { time: '16:00', requests: 380, errors: 4, response_time: 260 },
    { time: '20:00', requests: 290, errors: 3, response_time: 240 }
  ];

  const vendorPerformanceData = [
    { name: 'ACME Plumbing', rating: 4.8, jobs: 45, avg_time: 1.2 },
    { name: 'Quick Fix HVAC', rating: 4.6, jobs: 38, avg_time: 1.8 },
    { name: 'Elite Electric', rating: 4.9, jobs: 29, avg_time: 0.9 },
    { name: 'Handy Helpers', rating: 4.4, jobs: 52, avg_time: 2.1 },
    { name: 'Pro Maintenance', rating: 4.7, jobs: 33, avg_time: 1.5 }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return <Badge className="bg-green-100 text-green-800">Good</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className={`h-4 w-4 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} />;
    } else if (trend === 'down') {
      return <TrendingDown className={`h-4 w-4 ${change < 0 ? 'text-green-600' : 'text-red-600'}`} />;
    }
    return <div className="h-4 w-4" />;
  };

  const MetricCard = ({ metric }: { metric: MetricData }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{metric.name}</span>
          {getStatusBadge(metric.status)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{metric.value}</span>
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon(metric.trend, metric.change)}
            <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(metric.change)}{metric.unit}
            </span>
          </div>
        </div>

        {metric.target && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Target: {metric.target}{metric.unit}</span>
              <span>{Math.round((metric.value / metric.target) * 100)}%</span>
            </div>
            <Progress value={(metric.value / metric.target) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const SystemHealthCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="text-sm">Server Status</span>
          </div>
          <Badge className="bg-green-100 text-green-800">Online</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm">Database</span>
          </div>
          <Badge className="bg-green-100 text-green-800">Healthy</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">API Services</span>
          </div>
          <Badge className="bg-green-100 text-green-800">Running</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Security</span>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">1 Alert</Badge>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">CPU Usage</div>
          <Progress value={68} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>68%</span>
            <span>8 cores</span>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2">Memory Usage</div>
          <Progress value={45} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>45%</span>
            <span>16GB RAM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const VendorPerformanceCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vendor Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vendorPerformanceData.map((vendor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-sm">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">{vendor.jobs} jobs completed</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-medium">{vendor.rating}</span>
                  <span className="text-xs text-muted-foreground">/5</span>
                </div>
                <p className="text-xs text-muted-foreground">{vendor.avg_time}d avg</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system and business performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <SystemHealthCard />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">High memory usage detected</p>
                    <p className="text-xs text-muted-foreground">Database server at 85% capacity</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Performance optimization completed</p>
                    <p className="text-xs text-muted-foreground">Response time improved by 15%</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Auto-scaling triggered</p>
                    <p className="text-xs text-muted-foreground">Added 2 additional server instances</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {businessMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <VendorPerformanceCard />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Improvement</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Resolution times decreased by 12% this month due to improved vendor coordination.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Insight</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    85% of high-priority requests are resolved within SLA timeframes.
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Opportunity</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Preventive maintenance could reduce emergency repair costs by 30%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Volume & Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="requests" fill="#3b82f6" name="Requests" />
                    <Line yAxisId="right" type="monotone" dataKey="response_time" stroke="#ef4444" strokeWidth={2} name="Response Time (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#fef2f2" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;