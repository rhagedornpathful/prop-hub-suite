import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { AddPropertyOwnerDialog } from "@/components/AddPropertyOwnerDialog";

interface PropertyOwner {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  preferred_payment_method: "check" | "direct_deposit" | "other";
  is_self: boolean;
  notes?: string;
  created_at: string;
  property_count?: number;
}

// Mock data for demo
const mockOwners: PropertyOwner[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Smith",
    company_name: "Smith Properties LLC",
    email: "john@smithproperties.com",
    phone: "(555) 123-4567",
    address: "123 Business Ave",
    city: "Downtown",
    state: "CA",
    zip_code: "90210",
    preferred_payment_method: "direct_deposit",
    is_self: true,
    property_count: 8,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 234-5678",
    address: "456 Main St",
    city: "Suburbia",
    state: "CA",
    zip_code: "90211",
    preferred_payment_method: "check",
    is_self: false,
    property_count: 3,
    created_at: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    first_name: "Michael",
    last_name: "Davis",
    company_name: "Davis Real Estate Holdings",
    email: "m.davis@davisrealestate.com",
    phone: "(555) 345-6789",
    address: "789 Corporate Blvd",
    city: "Business District",
    state: "CA",
    zip_code: "90212",
    preferred_payment_method: "direct_deposit",
    is_self: false,
    property_count: 12,
    created_at: "2024-02-01T09:15:00Z"
  }
];

const PropertyOwners = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);
  const [ownerToDelete, setOwnerToDelete] = useState<PropertyOwner | null>(null);
  const { toast } = useToast();

  const filteredOwners = mockOwners.filter(owner =>
    `${owner.first_name} ${owner.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditOwner = (owner: PropertyOwner) => {
    setSelectedOwner(owner);
    setIsAddDialogOpen(true);
  };

  const handleDeleteOwner = (owner: PropertyOwner) => {
    setOwnerToDelete(owner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ownerToDelete) {
      toast({
        title: "Property Owner Deleted",
        description: `${ownerToDelete.first_name} ${ownerToDelete.last_name} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setOwnerToDelete(null);
    }
  };

  const handleAddSelf = () => {
    // Pre-fill with user's profile data if available
    setSelectedOwner({
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      preferred_payment_method: "direct_deposit",
      is_self: true,
      created_at: new Date().toISOString()
    });
    setIsAddDialogOpen(true);
  };

  const handleOwnerAdded = () => {
    toast({
      title: "Property Owner Added",
      description: "The property owner has been successfully added.",
    });
    setSelectedOwner(null);
  };

  const getDisplayName = (owner: PropertyOwner) => {
    return owner.company_name || `${owner.first_name} ${owner.last_name}`;
  };

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
                  <h1 className="text-2xl font-bold text-foreground">Property Owners</h1>
                  <p className="text-sm text-muted-foreground">Manage property owner information and contact details</p>
                </div>
                <Badge variant="secondary" className="ml-4">
                  {mockOwners.length} Owners
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search owners..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <Button 
                  className="bg-gradient-primary hover:bg-primary-dark"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property Owner
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleAddSelf}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Myself as Owner
                </Button>
              </div>

              {/* Property Owners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOwners.map((owner) => (
                  <Card key={owner.id} className="shadow-md border-0 hover:shadow-lg transition-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            {owner.company_name ? (
                              <Building2 className="h-5 w-5 text-white" />
                            ) : (
                              <User className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {getDisplayName(owner)}
                            </h3>
                            {owner.company_name && (
                              <p className="text-sm text-muted-foreground">
                                {owner.first_name} {owner.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {owner.is_self && (
                            <Badge variant="secondary" className="text-xs">
                              Me
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditOwner(owner)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Owner
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => handleDeleteOwner(owner)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Owner
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{owner.phone}</span>
                      </div>
                      {owner.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {owner.city}, {owner.state}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Properties: </span>
                          <span className="font-semibold text-foreground">{owner.property_count || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Payment: </span>
                          <span className="font-semibold text-foreground capitalize">
                            {owner.preferred_payment_method.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredOwners.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No property owners found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first property owner."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property Owner
                    </Button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AddPropertyOwnerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onOwnerAdded={handleOwnerAdded}
        editOwner={selectedOwner}
        mode={selectedOwner ? "edit" : "add"}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property Owner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ownerToDelete ? getDisplayName(ownerToDelete) : ""}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default PropertyOwners;