import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Search, 
  User, 
  Plus,
  Filter,
  Grid,
  List,
  Map,
  SlidersHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Properties = () => {
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
                  <h1 className="text-2xl font-bold text-foreground">Properties</h1>
                  <p className="text-sm text-muted-foreground">Manage your property portfolio</p>
                </div>
                <Badge variant="secondary" className="ml-4">
                  24 Properties
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search properties..." 
                    className="pl-10 w-64"
                  />
                 </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartments</SelectItem>
                    <SelectItem value="house">Houses</SelectItem>
                    <SelectItem value="condo">Condos</SelectItem>
                    <SelectItem value="townhouse">Townhouses</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    <SelectItem value="1">Smith Properties LLC</SelectItem>
                    <SelectItem value="2">Sarah Johnson</SelectItem>
                    <SelectItem value="3">Davis Real Estate Holdings</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced
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
              <div className="flex items-center gap-4">
                <Button className="bg-gradient-primary hover:bg-primary-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Import Properties
                </Button>
              </div>

              {/* Property Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                        <p className="text-2xl font-bold text-foreground">24</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Grid className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                        <p className="text-2xl font-bold text-foreground">18</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-success rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Vacant</p>
                        <p className="text-2xl font-bold text-foreground">6</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                        <Search className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Rent</p>
                        <p className="text-2xl font-bold text-foreground">$1,650</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* View Tabs */}
              <Tabs defaultValue="grid" className="w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map">
                    <Map className="h-4 w-4 mr-2" />
                    Map
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="grid" className="mt-6">
                  <PropertyGrid />
                </TabsContent>
                
                <TabsContent value="list" className="mt-6">
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Property List View</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">List view coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="map" className="mt-6">
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Property Map View</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Map view coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Properties;