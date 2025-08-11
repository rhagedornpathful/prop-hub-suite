import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp, TrendingDown, DollarSign, Home, BarChart3, Map, 
  Calendar, AlertTriangle, CheckCircle, Activity, Zap, Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyWithRelations } from '@/hooks/queries/useProperties';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PropertyAnalyticsDashboardProps {
  property: PropertyWithRelations;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export const PropertyAnalyticsDashboard: React.FC<PropertyAnalyticsDashboardProps> = ({ property }) => {
  const [timeRange, setTimeRange] = useState('12months');
  const [metricType, setMetricType] = useState('all');

  // Fetch property analytics
  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['property-analytics', property.id, timeRange, metricType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_analytics')
        .select('*')
        .eq('property_id', property.id)
        .gte('metric_date', new Date(Date.now() - (timeRange === '12months' ? 365 : timeRange === '6months' ? 180 : 30) * 24 * 60 * 60 * 1000).toISOString())
        .order('metric_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch market comparisons
  const { data: comparisons = [], isLoading: comparisonsLoading } = useQuery({
    queryKey: ['property-comparisons', property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_market_comparisons')
        .select('*')
        .eq('property_id', property.id)
        .order('comparison_score', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch property alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['property-alerts', property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_alerts')
        .select('*')
        .eq('property_id', property.id)
        .eq('is_active', true)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate key metrics
  const calculateMetrics = () => {
    const monthlyRent = property.monthly_rent || 0;
    const propertyValue = property.estimated_value || property.market_value || 0;
    const annualRent = monthlyRent * 12;
    const capRate = propertyValue > 0 ? (annualRent / propertyValue) * 100 : 0;
    
    const monthlyExpenses = (property.hoa_fees || 0) + ((property.property_taxes || 0) / 12) + ((property.insurance_cost || 0) / 12);
    const cashFlow = monthlyRent - monthlyExpenses;
    
    return {
      capRate: capRate.toFixed(2),
      cashFlow: Math.round(cashFlow),
      annualRent,
      monthlyExpenses: Math.round(monthlyExpenses),
      occupancyRate: property.occupancy_rate || 100,
      appreciationRate: property.appreciation_rate || 0
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const getMetricData = (metricName: string) => {
    return analytics
      .filter(a => a.metric_type === metricName)
      .map(a => ({
        date: new Date(a.metric_date).toLocaleDateString(),
        value: a.metric_value,
        change: a.change_percentage
      }));
  };

  const performanceData = [
    { name: 'Cap Rate', value: parseFloat(metrics.capRate), target: 8 },
    { name: 'Cash Flow', value: metrics.cashFlow, target: 500 },
    { name: 'Occupancy', value: metrics.occupancyRate, target: 95 },
    { name: 'Appreciation', value: metrics.appreciationRate, target: 3 }
  ];

  const expenseBredown = [
    { name: 'HOA Fees', value: property.hoa_fees || 0 },
    { name: 'Property Taxes', value: (property.property_taxes || 0) / 12 },
    { name: 'Insurance', value: (property.insurance_cost || 0) / 12 },
    { name: 'Other', value: Math.max(0, metrics.monthlyExpenses - (property.hoa_fees || 0) - ((property.property_taxes || 0) / 12) - ((property.insurance_cost || 0) / 12)) }
  ].filter(item => item.value > 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Property Analytics</h2>
          <p className="text-muted-foreground">Performance insights and market data</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-1" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cap Rate</p>
                <p className="text-2xl font-bold">{metrics.capRate}%</p>
                <p className="text-xs text-muted-foreground">Target: 8%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cash Flow</p>
                <p className="text-2xl font-bold">${metrics.cashFlow}</p>
                <p className="text-xs text-muted-foreground">After expenses</p>
              </div>
              <div className={`p-2 rounded-lg ${metrics.cashFlow >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <DollarSign className={`h-5 w-5 ${metrics.cashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">{metrics.occupancyRate}%</p>
                <p className="text-xs text-muted-foreground">Current period</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appreciation</p>
                <p className="text-2xl font-bold">{metrics.appreciationRate}%</p>
                <p className="text-xs text-muted-foreground">Annual rate</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Current" />
                  <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Comparisons</CardTitle>
              <CardDescription>Similar properties in the area</CardDescription>
            </CardHeader>
            <CardContent>
              {comparisons.length > 0 ? (
                <div className="space-y-4">
                  {comparisons.map((comp, index) => (
                    <div key={comp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{comp.comparable_address}</p>
                        <p className="text-sm text-muted-foreground">
                          {comp.comparable_bed_bath} • {comp.comparable_sqft?.toLocaleString()} sq ft
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${comp.comparable_price?.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          ${comp.price_per_sqft}/sq ft
                        </p>
                      </div>
                      <div className="ml-4">
                        <Badge variant="outline">
                          {comp.distance_miles} mi
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No market comparisons available</p>
                  <Button variant="outline" className="mt-2">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Comparisons
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Monthly operating expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={expenseBredown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: $${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBredown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Monthly Rent</span>
                      <span className="text-sm font-bold text-green-600">+${property.monthly_rent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Expenses</span>
                      <span className="text-sm font-bold text-red-600">-${metrics.monthlyExpenses}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Net Cash Flow</span>
                        <span className={`font-bold ${metrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${metrics.cashFlow}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Value Trends</CardTitle>
              <CardDescription>Property value and rent trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMetricData('property_value')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};