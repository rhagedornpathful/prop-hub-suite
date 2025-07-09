import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  User, 
  Plus,
  Filter,
  Calendar,
  TrendingUp,
  Building,
  Users,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome back! Here's your property overview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search properties, tenants..." 
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                    3
                  </Badge>
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Quick Actions */}
              <div className="flex items-center gap-4 mb-6">
                <Button className="bg-gradient-primary hover:bg-primary-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>

              {/* Metrics Dashboard */}
              <DashboardMetrics />

              {/* Property Grid */}
              <PropertyGrid />

              {/* Quick Stats */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    This Month's Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-primary/10 rounded-lg">
                      <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">2</div>
                      <div className="text-sm text-muted-foreground">New Properties Added</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-success/10 rounded-lg">
                      <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">$28,750</div>
                      <div className="text-sm text-muted-foreground">Rent Collected</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-secondary/10 rounded-lg">
                      <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">3</div>
                      <div className="text-sm text-muted-foreground">New Tenants</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
