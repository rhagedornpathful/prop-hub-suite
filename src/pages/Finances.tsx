import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, FileText, AlertCircle } from "lucide-react";

const Finances = () => {
  const mockTransactions = [
    {
      id: 1,
      type: "income",
      description: "Rent Payment - 123 Main St, Apt 4B",
      amount: 1200,
      date: "2024-07-01",
      tenant: "John Smith",
      status: "completed"
    },
    {
      id: 2,
      type: "expense",
      description: "Plumbing Repair - 456 Oak Ave",
      amount: 150,
      date: "2024-07-03",
      vendor: "ABC Plumbing",
      status: "completed"
    },
    {
      id: 3,
      type: "income",
      description: "Rent Payment - 789 Pine St, Apt 1C",
      amount: 1100,
      date: "2024-07-01",
      tenant: "Mike Wilson",
      status: "completed"
    },
    {
      id: 4,
      type: "expense",
      description: "Property Insurance - Annual Premium",
      amount: 800,
      date: "2024-07-05",
      vendor: "Insurance Co",
      status: "pending"
    }
  ];

  const mockOutstandingPayments = [
    {
      id: 1,
      property: "456 Oak Ave, Unit 2A",
      tenant: "Sarah Johnson",
      amount: 1350,
      dueDate: "2024-07-01",
      daysOverdue: 9
    }
  ];

  const getTransactionColor = (type: string) => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
                <p className="text-muted-foreground mt-1">Track income, expenses, and financial reports</p>
              </div>
              <Button className="bg-gradient-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$3,650</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">$950</div>
                  <p className="text-xs text-muted-foreground">-3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">$2,700</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">$1,350</div>
                  <p className="text-xs text-muted-foreground">1 overdue payment</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different financial views */}
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                <TabsTrigger value="outstanding">Outstanding Payments</TabsTrigger>
                <TabsTrigger value="reports">Financial Reports</TabsTrigger>
              </TabsList>

              {/* Recent Transactions */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest income and expense transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockTransactions.map((transaction) => (
                        <div key={transaction.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                  {transaction.type === "income" ? "+" : "-"}${transaction.amount}
                                </span>
                                <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                {transaction.tenant && <span>Tenant: {transaction.tenant}</span>}
                                {transaction.vendor && <span>Vendor: {transaction.vendor}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Outstanding Payments */}
              <TabsContent value="outstanding">
                <Card>
                  <CardHeader>
                    <CardTitle>Outstanding Payments</CardTitle>
                    <CardDescription>Overdue rent and pending payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockOutstandingPayments.map((payment) => (
                        <div key={payment.id} className="border border-border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-foreground">{payment.property}</h3>
                              <p className="text-sm text-muted-foreground">Tenant: {payment.tenant}</p>
                              <div className="flex gap-4 text-sm">
                                <span className="text-muted-foreground">Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                                <span className="text-red-600 font-medium">{payment.daysOverdue} days overdue</span>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-lg font-semibold text-red-600">${payment.amount}</div>
                              <Button size="sm" variant="outline">
                                Send Reminder
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Reports */}
              <TabsContent value="reports">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Report</CardTitle>
                      <CardDescription>Generate monthly financial summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">July 2024</span>
                      </div>
                      <Button className="w-full" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Annual Report</CardTitle>
                      <CardDescription>Generate yearly financial summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">2024</span>
                      </div>
                      <Button className="w-full" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Finances;