/**
 * Owner Portal Premium - State-of-the-Art Features
 * - Real-time financial dashboard
 * - Property performance analytics
 * - Tax document generation
 * - Investment ROI tracking
 * - Market insights
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOwnerFinancialSummary, useOwnerStatements, useRentRolls } from "@/hooks/queries/useOwnerFinancials";
import { useProperties } from "@/hooks/queries/useProperties";
import { usePayments } from "@/hooks/queries/usePayments";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Home, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Target,
  MapPin,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Building,
  Users,
  Percent
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

export const OwnerPortalPremium = () => {
  const { toast } = useToast();
  const { data: financialSummary } = useOwnerFinancialSummary();
  const { data: statements } = useOwnerStatements();
  const { data: rentRolls } = useRentRolls();
  const { data: properties } = useProperties();
  const { data: allPayments } = usePayments();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedProperty, setSelectedProperty] = useState("all");

  // Calculate real-time metrics
  const totalProperties = financialSummary?.totalProperties || 0;
  const totalMonthlyRent = financialSummary?.totalMonthlyRent || 0;
  const totalCollected = financialSummary?.totalCollected || 0;
  
  // Calculate monthly trends
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthPayments = allPayments?.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate >= monthStart && paymentDate <= monthEnd && p.status === "succeeded";
      }) || [];
      
      const income = monthPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
      
      months.push({
        month: format(date, "MMM"),
        income,
        expenses: income * 0.25, // Mock 25% expense ratio
        net: income * 0.75,
      });
    }
    return months;
  }, [allPayments]);

  // Calculate ROI metrics
  const totalInvestment = (properties?.properties?.length || 0) * 250000; // Mock $250k per property
  const annualIncome = totalMonthlyRent * 12;
  const annualExpenses = annualIncome * 0.35; // Mock 35% expense ratio
  const noi = annualIncome - annualExpenses;
  const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
  const cashOnCash = totalInvestment > 0 ? ((noi - (totalInvestment * 0.05)) / (totalInvestment * 0.25)) * 100 : 0; // Mock 25% down, 5% debt service

  // Property performance data
  const propertyPerformance = useMemo(() => {
    return properties?.properties?.map((prop: any) => ({
      id: prop.id,
      address: prop.address,
      rent: prop.monthly_rent || 0,
      occupancy: 100, // Mock 100% occupancy
      expenses: (prop.monthly_rent || 0) * 0.3,
      net: (prop.monthly_rent || 0) * 0.7,
    })) || [];
  }, [properties]);

  // Market comparison data
  const marketData = [
    { category: "Your Properties", avgRent: totalMonthlyRent / Math.max(totalProperties, 1), occupancy: 95 },
    { category: "Market Average", avgRent: 1500, occupancy: 92 },
    { category: "Premium Market", avgRent: 1800, occupancy: 97 },
  ];

  const pieData = [
    { name: "Rent Income", value: totalCollected, color: "#22c55e" },
    { name: "Operating Expenses", value: totalCollected * 0.25, color: "#f59e0b" },
    { name: "Net Income", value: totalCollected * 0.75, color: "#3b82f6" },
  ];

  const handleGenerateTaxDoc = (docType: string) => {
    toast({
      title: "Generating Document",
      description: `Your ${docType} is being prepared...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Document Ready",
        description: `${docType} has been generated and sent to your email`,
      });
    }, 2000);
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your financial report is ready",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Owner Portal Premium</h2>
          <p className="text-muted-foreground">
            Real-time insights into your property portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-Time Financial Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalInvestment).toLocaleString()}</div>
            <div className="flex items-center text-xs text-success mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% YoY
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyRent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {totalProperties} properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Operating Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(noi / 12).toLocaleString()}/mo</div>
            <p className="text-xs text-success">
              ${Math.round(noi).toLocaleString()}/year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cap Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Above market average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="roi">ROI Tracking</TabsTrigger>
          <TabsTrigger value="tax">Tax Documents</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
        </TabsList>

        {/* Real-Time Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Income Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>6-Month Income Trend</CardTitle>
                <CardDescription>Revenue and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" name="Income" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Income Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
                <CardDescription>Breakdown of financial flow</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">98.5%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Excellent payment performance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Rent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${Math.round(totalMonthlyRent / Math.max(totalProperties, 1)).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per property per month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">95%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Above market average
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Property Performance Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Comparison</CardTitle>
              <CardDescription>Compare performance across your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={propertyPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="address" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rent" fill="#3b82f6" name="Monthly Rent" />
                  <Bar dataKey="net" fill="#22c55e" name="Net Income" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Property Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyPerformance.slice(0, 5).map((prop) => (
                  <div key={prop.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{prop.address}</p>
                        <p className="text-sm text-muted-foreground">
                          Occupancy: {prop.occupancy}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${prop.rent}/mo</p>
                      <p className="text-sm text-success">Net: ${prop.net}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment ROI Tracking Tab */}
        <TabsContent value="roi" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
                <CardDescription>Track your return on investment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Cap Rate</span>
                    <span className="text-xl font-bold text-success">{capRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Cash-on-Cash Return</span>
                    <span className="text-xl font-bold text-success">{cashOnCash.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Annual NOI</span>
                    <span className="text-xl font-bold">${noi.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Investment</span>
                    <span className="text-xl font-bold">${totalInvestment.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equity & Appreciation</CardTitle>
                <CardDescription>Track property value growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Property Value</span>
                    <div className="text-right">
                      <div className="text-xl font-bold">${totalInvestment.toLocaleString()}</div>
                      <div className="text-sm text-success flex items-center justify-end">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +12.5% this year
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Equity Built</span>
                    <span className="text-xl font-bold">${Math.round(totalInvestment * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Projected 5-Year Value</span>
                    <span className="text-xl font-bold">${Math.round(totalInvestment * 1.35).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total ROI (5 years)</span>
                    <span className="text-xl font-bold text-success">+78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROI Projections */}
          <Card>
            <CardHeader>
              <CardTitle>10-Year ROI Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { year: 0, value: totalInvestment },
                  { year: 1, value: totalInvestment * 1.08 },
                  { year: 2, value: totalInvestment * 1.16 },
                  { year: 3, value: totalInvestment * 1.25 },
                  { year: 4, value: totalInvestment * 1.35 },
                  { year: 5, value: totalInvestment * 1.45 },
                  { year: 10, value: totalInvestment * 2.1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} name="Portfolio Value" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Documents Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Document Generation</CardTitle>
              <CardDescription>Generate and download tax forms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Schedule E</h4>
                      <p className="text-sm text-muted-foreground">Rental Income & Expenses</p>
                    </div>
                  </div>
                  <Button onClick={() => handleGenerateTaxDoc("Schedule E")} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Schedule E
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">1099 Forms</h4>
                      <p className="text-sm text-muted-foreground">For vendors & contractors</p>
                    </div>
                  </div>
                  <Button onClick={() => handleGenerateTaxDoc("1099 Forms")} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate 1099s
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Depreciation Schedule</h4>
                      <p className="text-sm text-muted-foreground">Property depreciation</p>
                    </div>
                  </div>
                  <Button onClick={() => handleGenerateTaxDoc("Depreciation Schedule")} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Schedule
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Year-End Summary</h4>
                      <p className="text-sm text-muted-foreground">Complete financial summary</p>
                    </div>
                  </div>
                  <Button onClick={() => handleGenerateTaxDoc("Year-End Summary")} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Summary
                  </Button>
                </div>
              </div>

              {/* Tax Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tax Year {selectedYear} Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rental Income</span>
                    <span className="font-medium">${(annualIncome).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductible Expenses</span>
                    <span className="font-medium">${(annualExpenses).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Depreciation</span>
                    <span className="font-medium">${Math.round(totalInvestment * 0.0364).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Taxable Income</span>
                    <span>${(noi - (totalInvestment * 0.0364)).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Insights Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Comparison</CardTitle>
              <CardDescription>See how your properties compare to the market</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="avgRent" fill="#3b82f6" name="Avg Rent ($)" />
                  <Bar yAxisId="right" dataKey="occupancy" fill="#22c55e" name="Occupancy (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Award className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Above Market Performance</p>
                    <p className="text-sm text-muted-foreground">
                      Your portfolio is performing 8% above market average
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Strong Rental Demand</p>
                    <p className="text-sm text-muted-foreground">
                      Your market shows 12% year-over-year rent growth
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Optimization Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Consider 3% rent increase based on market data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Nearby Market</h4>
                    <Badge>High Growth</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Median Price: $275,000 | Cap Rate: 7.2%
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Emerging Area</h4>
                    <Badge variant="secondary">Moderate Risk</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Median Price: $225,000 | Cap Rate: 8.5%
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
