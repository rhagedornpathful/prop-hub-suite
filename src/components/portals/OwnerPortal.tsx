import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerStatements, useRentRolls, useOwnerFinancialSummary } from "@/hooks/queries/useOwnerFinancials";
import { useProperties } from "@/hooks/queries/useProperties";
import { usePayments } from "@/hooks/queries/usePayments";
import { 
  DollarSign, 
  Home, 
  TrendingUp, 
  FileText, 
  Calendar,
  Download,
  Eye,
  BarChart3,
  PieChart
} from "lucide-react";
import { format } from "date-fns";

export const OwnerPortal = () => {
  const { data: financialSummary, isLoading: summaryLoading } = useOwnerFinancialSummary();
  const { data: statements, isLoading: statementsLoading } = useOwnerStatements();
  const { data: rentRolls, isLoading: rentRollsLoading } = useRentRolls();
  const { data: properties } = useProperties();
  const { data: allPayments } = usePayments();

  // Calculate metrics
  const totalProperties = financialSummary?.totalProperties || 0;
  const totalMonthlyRent = financialSummary?.totalMonthlyRent || 0;
  const totalCollected = financialSummary?.totalCollected || 0;
  const averageRent = financialSummary?.averageRent || 0;

  // Calculate collection rate
  const currentMonthPayments = allPayments?.filter(p => {
    const paymentDate = new Date(p.created_at);
    const currentDate = new Date();
    return paymentDate.getMonth() === currentDate.getMonth() && 
           paymentDate.getFullYear() === currentDate.getFullYear() &&
           p.status === "succeeded";
  }) || [];

  const currentMonthCollected = currentMonthPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
  const collectionRate = totalMonthlyRent > 0 ? (currentMonthCollected / totalMonthlyRent) * 100 : 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "secondary", 
      paid: "default",
      due: "outline",
      partial: "secondary",
      late: "destructive",
      void: "destructive",
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Owner Portal</h2>
          <p className="text-muted-foreground">
            Track your property performance and financial reports
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Active rental units
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyRent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total potential income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCollected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="rent-rolls">Rent Roll</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
                <CardDescription>
                  Your properties at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div>Loading properties...</div>
                ) : financialSummary?.properties && financialSummary.properties.length > 0 ? (
                  <div className="space-y-3">
                    {financialSummary.properties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">{property.address}</div>
                          <div className="text-sm text-muted-foreground">
                            ${property.monthly_rent?.toFixed(2) || "0.00"}/month
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No properties found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Latest rental income
                </CardDescription>
              </CardHeader>
              <CardContent>
                {financialSummary?.recentPayments && financialSummary.recentPayments.length > 0 ? (
                  <div className="space-y-3">
                    {financialSummary.recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">${(payment.amount / 100).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), "MMM dd, yyyy")}
                          </div>
                        </div>
                        <Badge variant="default">{payment.payment_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No recent payments
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Owner Statements
              </CardTitle>
              <CardDescription>
                Monthly financial statements and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statementsLoading ? (
                <div>Loading statements...</div>
              ) : statements && statements.length > 0 ? (
                <div className="space-y-4">
                  {statements.map((statement) => (
                    <div key={statement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(statement.statement_period_start), "MMM yyyy")} Statement
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Net Amount: ${statement.net_amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(statement.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No statements available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent-rolls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rent Roll
              </CardTitle>
              <CardDescription>
                Monthly rent collection tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rentRollsLoading ? (
                <div>Loading rent rolls...</div>
              ) : rentRolls && rentRolls.length > 0 ? (
                <div className="space-y-4">
                  {rentRolls.slice(0, 10).map((rentRoll) => (
                    <div key={rentRoll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(rentRoll.month_year), "MMMM yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Expected: ${rentRoll.rent_amount.toFixed(2)} | 
                          Collected: ${rentRoll.amount_collected.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(rentRoll.status)}
                        {rentRoll.late_fees > 0 && (
                          <div className="text-sm text-muted-foreground">
                            +${rentRoll.late_fees.toFixed(2)} late fees
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No rent roll data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Property Portfolio
              </CardTitle>
              <CardDescription>
                Detailed view of your rental properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties?.properties && properties.properties.length > 0 ? (
                <div className="space-y-4">
                  {properties.properties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{property.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.bedrooms}BR / {property.bathrooms}BA
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">${property.monthly_rent?.toFixed(2) || "0.00"}/mo</div>
                        <Badge variant="default">Occupied</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No properties found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};