import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building,
  Calendar as CalendarIcon,
  Users,
  AlertTriangle,
  MapPin,
  PieChart,
  LineChart
} from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { useProperties } from '@/hooks/queries/useProperties';
import { useToast } from '@/hooks/use-toast';

interface PropertyReportsDashboardProps {
  className?: string;
}

export const PropertyReportsDashboard: React.FC<PropertyReportsDashboardProps> = ({
  className = ''
}) => {
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState<string>('financial');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  
  const { data: propertyData } = useProperties(1, 100);
  const properties = propertyData?.properties || [];
  const { toast } = useToast();

  // Calculate report metrics
  const calculateMetrics = () => {
    const filteredProperties = selectedProperty === 'all' 
      ? properties 
      : properties.filter(p => p.id === selectedProperty);

    const totalValue = filteredProperties.reduce((sum, p) => sum + (p.estimated_value || 0), 0);
    const totalRent = filteredProperties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
    const activeProperties = filteredProperties.filter(p => p.status === 'active' || !p.status).length;
    const occupancyRate = activeProperties / filteredProperties.length * 100;
    
    return {
      totalValue,
      totalRent,
      activeProperties,
      occupancyRate: isNaN(occupancyRate) ? 0 : occupancyRate,
      totalProperties: filteredProperties.length
    };
  };

  const metrics = calculateMetrics();

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: "Exporting Report",
      description: `Generating ${format.toUpperCase()} report...`,
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: `Your ${format.toUpperCase()} report has been downloaded.`,
      });
    }, 2000);
  };

  const quickDateRanges = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 3 months', value: 90 },
    { label: 'Last 6 months', value: 180 },
    { label: 'Last year', value: 365 }
  ];

  const reportTypes = [
    { value: 'financial', label: 'Financial Report', icon: DollarSign },
    { value: 'occupancy', label: 'Occupancy Report', icon: Users },
    { value: 'maintenance', label: 'Maintenance Report', icon: AlertTriangle },
    { value: 'market', label: 'Market Analysis', icon: TrendingUp },
    { value: 'performance', label: 'Performance Report', icon: BarChart3 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Property Reports</h2>
          <p className="text-muted-foreground">Generate comprehensive property analytics</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Property Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Property</label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-2">
                    {quickDateRanges.map((range) => (
                      <Button
                        key={range.value}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setDateRange({
                          from: subDays(new Date(), range.value),
                          to: new Date()
                        })}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{metrics.activeProperties}</p>
                <p className="text-xs text-muted-foreground">Active Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">${metrics.totalRent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">${Math.round(metrics.totalValue / 1000)}K</p>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{metrics.occupancyRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Occupancy Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.value} value={type.value} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{type.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Revenue Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Rent</span>
                      <span className="font-medium">${metrics.totalRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Annual Revenue</span>
                      <span className="font-medium">${(metrics.totalRent * 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average per Property</span>
                      <span className="font-medium">
                        ${metrics.totalProperties > 0 ? Math.round(metrics.totalRent / metrics.totalProperties).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Portfolio Value</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Value</span>
                      <span className="font-medium">${metrics.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Value</span>
                      <span className="font-medium">
                        ${metrics.totalProperties > 0 ? Math.round(metrics.totalValue / metrics.totalProperties).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cap Rate</span>
                      <span className="font-medium">
                        {metrics.totalValue > 0 ? ((metrics.totalRent * 12 / metrics.totalValue) * 100).toFixed(2) : '0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Occupied Units</span>
                      <Badge className="bg-green-100 text-green-800">{metrics.activeProperties}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vacant Units</span>
                      <Badge className="bg-red-100 text-red-800">{metrics.totalProperties - metrics.activeProperties}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Occupancy Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">{metrics.occupancyRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue from Occupied</span>
                      <span className="font-medium">${metrics.totalRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Potential Revenue</span>
                      <span className="font-medium">${(metrics.totalRent / (metrics.occupancyRate / 100)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Loss</span>
                      <span className="font-medium text-red-600">
                        ${((metrics.totalRent / (metrics.occupancyRate / 100)) - metrics.totalRent).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Maintenance Report</h3>
                <p className="text-muted-foreground">
                  Maintenance tracking and reporting features will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Market Analysis</h3>
                <p className="text-muted-foreground">
                  Market comparison and analysis features will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">ROI Analysis</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.totalValue > 0 ? ((metrics.totalRent * 12 / metrics.totalValue) * 100).toFixed(2) : '0'}%
                  </div>
                  <p className="text-sm text-muted-foreground">Annual Return</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Cash Flow</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    ${metrics.totalRent.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly Cash Flow</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Portfolio Growth</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    +{metrics.totalProperties}
                  </div>
                  <p className="text-sm text-muted-foreground">Properties Added</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};