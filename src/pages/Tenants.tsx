import { useState } from "react";
import { ListLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  Plus,
  Filter,
  Users,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTenants } from "@/hooks/queries/useTenants";
import { useDeleteTenant } from "@/hooks/useDeleteTenant";
import { AddTenantDialog } from "@/components/AddTenantDialog";
import { cn } from "@/lib/utils";

const Tenants = () => {
  const { data: tenants = [], isLoading, error } = useTenants();
  const deleteTenantMutation = useDeleteTenant();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<any>(null);

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(tenant =>
    `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.property?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const activeTenantsCount = tenants.filter(tenant => {
    if (!tenant.lease_end_date) return true;
    return new Date(tenant.lease_end_date) > new Date();
  }).length;

  const expiringLeases = tenants.filter(tenant => {
    if (!tenant.lease_end_date) return false;
    const endDate = new Date(tenant.lease_end_date);
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(today.getMonth() + 2);
    return endDate > today && endDate <= twoMonthsFromNow;
  }).length;

  const totalRentExpected = tenants.reduce((sum, tenant) => {
    return sum + (tenant.monthly_rent || 0);
  }, 0);

  const handleDeleteTenant = (tenant: any) => {
    setTenantToDelete(tenant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTenant = async () => {
    if (tenantToDelete) {
      try {
        await deleteTenantMutation.mutateAsync(tenantToDelete.id);
        setIsDeleteDialogOpen(false);
        setTenantToDelete(null);
      } catch (error) {
        console.error('Error deleting tenant:', error);
      }
    }
  };

  if (isLoading) {
    return <ListLoadingSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Tenants</h2>
              <p className="text-muted-foreground mb-4">
                {error.message || "Failed to load tenants"}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{/* Added pb-24 for mobile bottom nav */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clean Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage tenant information and lease agreements • {tenants.length} tenants
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search tenants..." 
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <AddTenantDialog onTenantAdded={() => {
            // Refresh the data when a new tenant is added
            window.location.reload();
          }} />
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Lease Reports
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTenantsCount}</div>
              <p className="text-xs text-muted-foreground">Currently renting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">Occupied units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRentExpected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Expected rental income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Leases</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringLeases}</div>
              <p className="text-xs text-muted-foreground">Next 2 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Grid */}
        {filteredTenants.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tenants Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'No tenants match your search criteria.'
                    : 'No tenants have been added to the system yet.'
                  }
                </p>
                <AddTenantDialog onTenantAdded={() => {
                  window.location.reload();
                }} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => {
              const propertyAddress = tenant.property?.address || "Property not found";
              const fullAddress = tenant.property 
                ? `${tenant.property.address}${tenant.property.city ? `, ${tenant.property.city}` : ''}${tenant.property.state ? `, ${tenant.property.state}` : ''}`
                : propertyAddress;
              
              // Calculate lease status
              const today = new Date();
              const leaseEndDate = tenant.lease_end_date ? new Date(tenant.lease_end_date) : null;
              const isActive = !leaseEndDate || leaseEndDate > today;
              
              // Check if lease is expiring soon (within 2 months)
              const twoMonthsFromNow = new Date();
              twoMonthsFromNow.setMonth(today.getMonth() + 2);
              const isExpiringSoon = leaseEndDate && leaseEndDate > today && leaseEndDate <= twoMonthsFromNow;
              
              return (
                <Card 
                  key={tenant.id} 
                  className="shadow-md border-0 hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden"
                >
                  <CardHeader className="pb-4 relative">
                    {/* Status Badge - Top Right Corner */}
                    <Badge 
                      variant={isActive ? (isExpiringSoon ? "destructive" : "secondary") : "destructive"} 
                      className="absolute top-4 right-4 text-xs z-10"
                    >
                      {isExpiringSoon ? "Expiring Soon" : isActive ? "Active" : "Expired"}
                    </Badge>
                    
                    <div className="flex items-start gap-4">
                      {/* Profile Photo Section */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                          <span>
                            {tenant.first_name?.charAt(0) || 'T'}
                            {tenant.last_name?.charAt(0) || 'N'}
                          </span>
                        </div>
                        {/* Status indicator */}
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 border-2 border-background rounded-full flex items-center justify-center",
                          isActive ? "bg-green-500" : "bg-red-500"
                        )}>
                          <User className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1 pr-2">
                            <h3 className="font-bold text-lg text-foreground leading-tight">
                              {tenant.first_name} {tenant.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Tenant
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Property Information */}
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {fullAddress}
                      </span>
                    </div>

                    {/* Contact Information */}
                    {tenant.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {tenant.email}
                        </span>
                      </div>
                    )}

                    {tenant.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {tenant.phone}
                        </span>
                      </div>
                    )}

                    {/* Lease Information */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">
                          ${tenant.monthly_rent?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-muted-foreground">Monthly Rent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">
                          {tenant.lease_end_date 
                            ? new Date(tenant.lease_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">Lease End</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle contact tenant
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-primary hover:bg-primary-dark"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle view tenant details
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTenant(tenant);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tenants;