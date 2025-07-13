import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, DollarSign } from "lucide-react";

const Leases = () => {
  const mockLeases = [
    {
      id: 1,
      property: "123 Main St, Apt 4B",
      tenant: "John Smith",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyRent: 1200,
      status: "Active",
      depositAmount: 2400
    },
    {
      id: 2,
      property: "456 Oak Ave, Unit 2A",
      tenant: "Sarah Johnson",
      startDate: "2024-03-15",
      endDate: "2025-03-14",
      monthlyRent: 1350,
      status: "Active",
      depositAmount: 2700
    },
    {
      id: 3,
      property: "789 Pine St, Apt 1C",
      tenant: "Mike Wilson",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      monthlyRent: 1100,
      status: "Expiring Soon",
      depositAmount: 2200
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expiring Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Expired":
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
                <h1 className="text-3xl font-bold text-foreground">Lease Management</h1>
                <p className="text-muted-foreground mt-1">Manage lease agreements and track rental terms</p>
              </div>
              <Button className="bg-gradient-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                New Lease
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Active agreements</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,650</div>
                  <p className="text-xs text-muted-foreground">From active leases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Next 60 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Deposits</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$7,300</div>
                  <p className="text-xs text-muted-foreground">Total held</p>
                </CardContent>
              </Card>
            </div>

            {/* Leases List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Leases</CardTitle>
                <CardDescription>Overview of all lease agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeases.map((lease) => (
                    <div key={lease.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{lease.property}</h3>
                            <Badge className={getStatusColor(lease.status)}>{lease.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Tenant: {lease.tenant}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Start: {new Date(lease.startDate).toLocaleDateString()}</span>
                            <span>End: {new Date(lease.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-lg font-semibold text-foreground">${lease.monthlyRent}/mo</div>
                          <div className="text-sm text-muted-foreground">Deposit: ${lease.depositAmount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leases;