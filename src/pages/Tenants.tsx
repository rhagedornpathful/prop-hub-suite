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
  MapPin,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTenants } from "@/hooks/queries/useTenants";
import { useState } from "react";

const Tenants = () => {
  const { data: tenants = [], isLoading, error } = useTenants();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(tenant =>
    `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.property?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTenantsCount = tenants.length;

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clean Header - matching Property Owners */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground">
              Manage your tenants and lease agreements • {activeTenantsCount} tenants
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search tenants..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading tenants...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading tenants. Please try again.</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No tenants found matching your search." : "No tenants found. Click 'Add Tenant' to get started."}
            </p>
          </div>
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
              
              return (
                <Card key={tenant.id} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {tenant.first_name} {tenant.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {tenant.property?.address ? `${tenant.property.address}` : "No property assigned"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs">
                        {isActive ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{fullAddress}</span>
                    </div>
                    {tenant.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{tenant.phone}</span>
                      </div>
                    )}
                    {tenant.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{tenant.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Rent: </span>
                        <span className="font-semibold text-foreground">
                          {tenant.monthly_rent ? `$${tenant.monthly_rent.toLocaleString()}/mo` : "Not set"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Lease: </span>
                        <span className="font-semibold text-foreground">
                          {tenant.lease_end_date 
                            ? new Date(tenant.lease_end_date).toLocaleDateString() 
                            : "No end date"
                          }
                        </span>
                      </div>
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