import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayments, useSubscriptions, useCustomerPortal } from "@/hooks/queries/usePayments";
import { PaymentButton } from "./PaymentButton";
import { SubscriptionButton } from "./SubscriptionButton";
import { DollarSign, CreditCard, RefreshCw, Settings, Calendar } from "lucide-react";
import { format } from "date-fns";

export const PaymentDashboard = () => {
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const customerPortal = useCustomerPortal();

  const totalPaid = payments
    ?.filter(p => p.status === "succeeded")
    ?.reduce((sum, payment) => sum + (payment.amount / 100), 0) || 0;

  const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      processing: "secondary",
      succeeded: "default",
      failed: "destructive",
      cancelled: "destructive",
      active: "default",
      past_due: "destructive",
      unpaid: "destructive",
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Management</h2>
          <p className="text-muted-foreground">
            Manage payments, subscriptions, and billing
          </p>
        </div>
        <Button 
          onClick={() => customerPortal.mutate()}
          disabled={customerPortal.isPending}
          variant="outline"
        >
          <Settings className="w-4 h-4 mr-2" />
          {customerPortal.isPending ? "Loading..." : "Manage Billing"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeSubscriptions.reduce((sum, sub) => sum + (sub.amount / 100), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <PaymentButton />
        <SubscriptionButton />
      </div>

      {/* Payment History */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Your payment transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div>Loading payments...</div>
              ) : payments && payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.slice(0, 10).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {payment.description || `${payment.payment_type} Payment`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(payment.created_at), "PPP")}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">${(payment.amount / 100).toFixed(2)}</div>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No payments found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>
                Your recurring payment subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div>Loading subscriptions...</div>
              ) : subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium capitalize">
                          {subscription.plan_type.replace('_', ' ')} Subscription
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Next billing: {subscription.current_period_end ? format(new Date(subscription.current_period_end), "PPP") : "N/A"}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">${(subscription.amount / 100).toFixed(2)}</div>
                        {getStatusBadge(subscription.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No subscriptions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};