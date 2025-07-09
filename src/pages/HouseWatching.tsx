import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  User, 
  Plus,
  Filter,
  Eye,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Camera,
  Route,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const HouseWatching = () => {
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
                  <h1 className="text-2xl font-bold text-foreground">House Watching</h1>
                  <p className="text-sm text-muted-foreground">Manage property monitoring and check-in services</p>
                </div>
                <Badge variant="secondary" className="ml-4">
                  42 Active Properties
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
                <Button variant="outline" size="sm">
                  <Route className="h-4 w-4 mr-2" />
                  Plan Route
                </Button>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                    5
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
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                        <p className="text-2xl font-bold text-foreground">12</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-foreground">8</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-success rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
                        <p className="text-2xl font-bold text-foreground">3</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Photos Taken</p>
                        <p className="text-2xl font-bold text-foreground">156</p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Property Watch List */}
              <Tabs defaultValue="scheduled" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scheduled" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((property) => (
                      <Card key={property} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">Oak Street Property</h3>
                              <p className="text-sm text-muted-foreground">Weekly Check</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Due Today
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">456 Oak Street</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last visit: 5 days ago</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Owner: Sarah Johnson</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Link to="/property-check/1">
                              <Button size="sm" className="bg-gradient-primary hover:bg-primary-dark">
                                <Eye className="h-4 w-4 mr-2" />
                                Start Check
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="completed" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((property) => (
                      <Card key={property} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">Pine Avenue Home</h3>
                              <p className="text-sm text-muted-foreground">Bi-weekly Check</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">789 Pine Avenue</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Completed: 2 hours ago</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">24 photos taken</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Button size="sm" variant="outline">
                              View Report
                            </Button>
                            <Button size="sm" variant="outline">
                              Send to Owner
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="issues" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((property) => (
                      <Card key={property} className="shadow-md border-0 hover:shadow-lg transition-shadow border-l-4 border-l-destructive">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">Maple Drive House</h3>
                              <p className="text-sm text-muted-foreground">Monthly Check</p>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              2 Issues
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">321 Maple Drive</span>
                          </div>
                          <div className="bg-destructive/10 p-3 rounded-lg">
                            <p className="text-sm font-medium text-destructive">Issues Found:</p>
                            <p className="text-sm text-muted-foreground">• Gutter damage on east side</p>
                            <p className="text-sm text-muted-foreground">• Pool filter needs replacement</p>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="destructive">
                              Alert Owner
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HouseWatching;