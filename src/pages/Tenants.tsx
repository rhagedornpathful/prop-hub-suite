import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Search, 
  User, 
  Plus,
  Filter,
  Users,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Tenants = () => {
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
                  <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
                  <p className="text-sm text-muted-foreground">Manage your tenants and lease agreements</p>
                </div>
                <Badge variant="secondary" className="ml-4">
                  18 Active Tenants
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search tenants..." 
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
                  Add Tenant
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Tenant Applications
                </Button>
              </div>

              {/* Tenant Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((tenant) => (
                  <Card key={tenant} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">John Smith</h3>
                            <p className="text-sm text-muted-foreground">Unit 4B</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">123 Main St, Apt 4B</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">(555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">john@email.com</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rent: </span>
                          <span className="font-semibold text-foreground">$1,200/mo</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Due: </span>
                          <span className="font-semibold text-success">Paid</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Tenants;