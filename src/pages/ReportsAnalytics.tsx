import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  Building,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [reportType, setReportType] = useState('overview');

  // Mock data - in real app, this would come from your database
  const financialData = [
    { month: 'Jan', revenue: 45000, expenses: 12000, netIncome: 33000 },
    { month: 'Feb', revenue: 47000, expenses: 13500, netIncome: 33500 },
    { month: 'Mar', revenue: 44000, expenses: 11000, netIncome: 33000 },
    { month: 'Apr', revenue: 48000, expenses: 14000, netIncome: 34000 },
    { month: 'May', revenue: 50000, expenses: 15000, netIncome: 35000 },
    { month: 'Jun', revenue: 52000, expenses: 13000, netIncome: 39000 },
  ];

  const occupancyData = [
    { month: 'Jan', occupied: 85, vacant: 15 },
    { month: 'Feb', occupied: 88, vacant: 12 },
    { month: 'Mar', occupied: 82, vacant: 18 },
    { month: 'Apr', occupied: 90, vacant: 10 },
    { month: 'May', occupied: 92, vacant: 8 },
    { month: 'Jun', occupied: 95, vacant: 5 },
  ];

  const maintenanceData = [
    { category: 'Plumbing', count: 45, cost: 8500 },
    { category: 'Electrical', count: 23, cost: 6200 },
    { category: 'HVAC', count: 18, cost: 12000 },
    { category: 'Appliances', count: 12, cost: 3500 },
    { category: 'General', count: 34, cost: 4200 },
  ];

  const propertyPerformance = [
    { name: 'Sunset Apartments', revenue: 25000, expenses: 8000, roi: 21.25, occupancy: 95 },
    { name: 'Maple Grove Complex', revenue: 18000, expenses: 6500, roi: 18.33, occupancy: 88 },
    { name: 'Downtown Lofts', revenue: 22000, expenses: 9000, roi: 14.44, occupancy: 92 },
    { name: 'Pine Street Homes', revenue: 15000, expenses: 5200, roi: 19.6, occupancy: 85 },
  ];

  const kpiData = {
    totalRevenue: 312000,
    totalExpenses: 89200,
    netIncome: 222800,
    averageRent: 1850,
    occupancyRate: 92.5,
    totalUnits: 156,
    maintenanceRequests: 132,
    collectionRate: 98.2,
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your property portfolio</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="sunset">Sunset Apartments</SelectItem>
              <SelectItem value="maple">Maple Grove Complex</SelectItem>
              <SelectItem value="downtown">Downtown Lofts</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateRange ? format(dateRange, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiData.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.collectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.8%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Reports */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison of income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Income Trend</CardTitle>
                <CardDescription>Monthly net income over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="netIncome" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Occupancy Reports */}
        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trends</CardTitle>
                <CardDescription>Occupied vs vacant units over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="occupied" stroke="#8884d8" />
                    <Line type="monotone" dataKey="vacant" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Status Distribution</CardTitle>
                <CardDescription>Current status of all units</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Occupied</span>
                    </div>
                    <span className="font-medium">144 units (92.3%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Vacant - Ready</span>
                    </div>
                    <span className="font-medium">8 units (5.1%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Vacant - Maintenance</span>
                    </div>
                    <span className="font-medium">4 units (2.6%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Reports */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance by Category</CardTitle>
                <CardDescription>Distribution of maintenance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={maintenanceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {maintenanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <CardDescription>Cost breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceData.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.cost.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.count} requests</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Property Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Comparison</CardTitle>
              <CardDescription>Revenue, ROI, and occupancy by property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyPerformance.map((property, index) => (
                  <div key={property.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{property.name}</h3>
                      <Badge variant={property.occupancy > 90 ? "default" : "secondary"}>
                        {property.occupancy}% Occupied
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Monthly Revenue</div>
                        <div className="font-medium">${property.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly Expenses</div>
                        <div className="font-medium">${property.expenses.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">ROI</div>
                        <div className="font-medium text-green-600">{property.roi}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Reports */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create custom reports with specific metrics and filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Custom Reports Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Build custom reports with drag-and-drop interface and advanced filtering
                </p>
                <Button>Request Custom Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;