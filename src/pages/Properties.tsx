import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  Search, 
  User, 
  Plus,
  Filter,
  Grid,
  List,
  Map,
  SlidersHorizontal,
  Building,
  InfoIcon,
  Eye,
  DollarSign
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { RoleBasedWrapper } from "@/components/RoleBasedWrapper";
import { useProperties } from "@/hooks/queries/useProperties";

const Properties = () => {
  const navigate = useNavigate();
  const { 
    userRole, 
    isAdmin, 
    isPropertyOwner, 
    isTenant, 
    isHouseWatcher,
    hasAdminAccess,
    permissions,
    getRoleDisplayName 
  } = useUserRole();

  // Get real property data
  const { data: properties = [], isLoading } = useProperties();

  // For tenants, redirect to their property detail page
  useEffect(() => {
    if (isTenant()) {
      // In a real app, you'd fetch the tenant's property ID and redirect there
      navigate('/tenant-property', { replace: true });
    }
  }, [userRole, navigate, isTenant]);

  const getRoleSpecificTitle = () => {
    if (hasAdminAccess()) return "All Properties";
    if (isPropertyOwner()) return "My Properties";
    if (isHouseWatcher()) return "Assigned Properties";
    return "Properties";
  };

  const getPropertyCount = () => {
    return properties.length;
  };

  const getOccupiedCount = () => {
    return properties.filter(p => p.status === 'active').length;
  };

  const getVacantCount = () => {
    return properties.filter(p => p.status !== 'active').length;
  };

  const getAverageRent = () => {
    const propertiesWithRent = properties.filter(p => p.monthly_rent);
    if (propertiesWithRent.length === 0) return 0;
    const totalRent = propertiesWithRent.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
    return Math.round(totalRent / propertiesWithRent.length);
  };

  // Don't render for tenants as they get redirected
  if (isTenant()) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{getRoleSpecificTitle()}</h1>
                    <p className="text-sm text-muted-foreground">
                      {hasAdminAccess() && "Manage all properties in the system"}
                      {isPropertyOwner() && "Manage your property portfolio"}
                      {isHouseWatcher() && "Properties you're monitoring"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {getPropertyCount()} Properties
                </Badge>
                <Badge variant="outline">
                  {getRoleDisplayName()}
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
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : getPropertyCount()}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : getOccupiedCount()}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : getVacantCount()}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {isLoading ? "..." : `$${getAverageRent().toLocaleString()}`}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
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
                  <PropertyGrid properties={properties} isLoading={isLoading} />
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
  );
};

export default Properties;