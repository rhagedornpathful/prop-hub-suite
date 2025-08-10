import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentButton } from "@/components/payments/PaymentButton";
import { useTenants } from "@/hooks/queries/useTenants";
import { usePayments } from "@/hooks/queries/usePayments";
import { useAuth } from "@/contexts/AuthContext";
import { Home, CreditCard, FileText, MessageSquare, Wrench, DollarSign } from "lucide-react";
import { format } from "date-fns";

export const TenantPortal = () => {
  const { user } = useAuth();
  const { data: tenants } = useTenants();
  const { data: payments } = usePayments();

  // Find current tenant record
  const currentTenant = tenants?.find(t => t.user_account_id === user?.id);
  
  // Filter payments for this tenant
  const tenantPayments = payments?.filter(p => p.tenant_id === currentTenant?.id) || [];
  const lastPayment = tenantPayments[0];
  const totalPaid = tenantPayments
    .filter(p => p.status === "succeeded")
    .reduce((sum, p) => sum + (p.amount / 100), 0);

  if (!currentTenant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Portal Access</CardTitle>
          <CardDescription>
            No tenant record found. Please contact your property manager.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenant Portal</h2>
          <p className="text-muted-foreground">
            Welcome back, {currentTenant.first_name}!
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentTenant.monthly_rent?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastPayment ? format(new Date(lastPayment.created_at), "MMM dd") : "None"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>
                  Pay your rent or other charges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentButton 
                  propertyId={currentTenant.property_id}
                  tenantId={currentTenant.id}
                  presetAmount={currentTenant.monthly_rent || undefined}
                  presetType="rent"
                  presetDescription={`Rent payment for ${currentTenant.property?.address}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Your recent payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tenantPayments.length > 0 ? (
                  <div className="space-y-2">
                    {tenantPayments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">${(payment.amount / 100).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), "MMM dd, yyyy")}
                          </div>
                        </div>
                        <Badge variant={payment.status === "succeeded" ? "default" : "outline"}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No payments found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Requests
              </CardTitle>
              <CardDescription>
                Submit and track maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Wrench className="w-4 h-4 mr-2" />
                Submit Maintenance Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents & Lease
              </CardTitle>
              <CardDescription>
                Access your lease agreement and important documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Document management coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </CardTitle>
              <CardDescription>
                Communicate with your property manager
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};