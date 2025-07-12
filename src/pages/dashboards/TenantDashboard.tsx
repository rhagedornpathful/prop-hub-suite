import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { 
  Home, 
  DollarSign, 
  Calendar,
  Wrench,
  FileText,
  MessageSquare,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TenantDashboard() {
  const navigate = useNavigate();
  
  // Mock data - replace with actual queries based on current user
  const tenantInfo = {
    property: "123 Oak Street, Apt 2B",
    rent: 2200,
    nextDueDate: "2024-08-01",
    leaseStart: "2024-01-01",
    leaseEnd: "2024-12-31",
    daysUntilDue: 15,
    balance: 0
  };

  const paymentHistory = [
    { month: "July 2024", amount: 2200, date: "2024-07-01", status: "paid" },
    { month: "June 2024", amount: 2200, date: "2024-06-01", status: "paid" },
    { month: "May 2024", amount: 2200, date: "2024-05-01", status: "paid" },
    { month: "April 2024", amount: 2200, date: "2024-04-01", status: "paid" }
  ];

  const maintenanceRequests = [
    { id: 1, issue: "Kitchen faucet dripping", status: "in-progress", date: "2024-07-05", priority: "medium" },
    { id: 2, issue: "Bathroom light bulb replacement", status: "completed", date: "2024-06-28", priority: "low" }
  ];

  const documents = [
    { name: "Lease Agreement", type: "pdf", date: "2024-01-01" },
    { name: "Move-in Inspection", type: "pdf", date: "2024-01-01" },
    { name: "Tenant Handbook", type: "pdf", date: "2024-01-01" }
  ];

  const messages = [
    { from: "Property Manager", subject: "Monthly Newsletter", date: "2024-07-01", unread: true },
    { from: "Maintenance Team", subject: "Scheduled inspection reminder", date: "2024-06-25", unread: false },
    { from: "Property Manager", subject: "Pool maintenance schedule", date: "2024-06-20", unread: false }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome home!</h1>
          <p className="text-muted-foreground">Your tenant portal dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Property</p>
          <p className="font-medium">{tenantInfo.property}</p>
        </div>
      </div>

      {/* Current Lease Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Current Lease Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="text-xl font-bold">${tenantInfo.rent}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Due Date</p>
              <p className="text-xl font-bold">{tenantInfo.nextDueDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lease Start</p>
              <p className="text-lg font-medium">{tenantInfo.leaseStart}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lease End</p>
              <p className="text-lg font-medium">{tenantInfo.leaseEnd}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
        <AnimatedListItem>
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <CreditCard className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Pay Rent</p>
              <p className="text-sm text-muted-foreground">Due in {tenantInfo.daysUntilDue} days</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Wrench className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Maintenance Request</p>
              <p className="text-sm text-muted-foreground">Report an issue</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Documents</p>
              <p className="text-sm text-muted-foreground">View lease & docs</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card className="hover:bg-primary/5 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Messages</p>
              <p className="text-sm text-muted-foreground">Contact management</p>
            </CardContent>
          </Card>
        </AnimatedListItem>
      </AnimatedList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment History
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{payment.month}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${payment.amount}</p>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              My Maintenance Requests
            </CardTitle>
            <Button variant="outline" size="sm">
              New Request
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{request.issue}</p>
                    <p className="text-xs text-muted-foreground">{request.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={request.status === 'completed' ? 'default' : 'outline'}>
                      {request.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${message.unread ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <div>
                    <p className="text-sm font-medium">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">From: {message.from}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{message.date}</p>
                    {message.unread && (
                      <Badge variant="default" className="mt-1">New</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}