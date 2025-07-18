import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User,
  Plus,
  Users,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit,
  Eye,
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
import { usePropertyOwners, useDeletePropertyOwner } from "@/hooks/queries/usePropertyOwners";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type PropertyOwner = Tables<'property_owners'> & {
  property_count?: number;
};

const PropertyOwners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);
  const [ownerToDelete, setOwnerToDelete] = useState<PropertyOwner | null>(null);
  const { toast } = useToast();

  // Use hooks to fetch data
  const { data: owners = [], isLoading, error } = usePropertyOwners();
  const deleteOwnerMutation = useDeletePropertyOwner();
  const queryClient = useQueryClient();

  const filteredOwners = owners.filter(owner =>
    `${owner.first_name} ${owner.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditOwner = (owner: PropertyOwner) => {
    setSelectedOwner(owner);
    setIsAddDialogOpen(true);
  };

  const handleDeleteOwner = (owner: PropertyOwner) => {
    // Check if owner has properties
    if (owner.property_count && owner.property_count > 0) {
      toast({
        title: "Cannot Delete Owner",
        description: `${getDisplayName(owner)} has ${owner.property_count} properties assigned. Please reassign or remove properties first.`,
        variant: "destructive"
      });
      return;
    }
    setOwnerToDelete(owner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (ownerToDelete) {
      try {
        await deleteOwnerMutation.mutateAsync(ownerToDelete.id);
        setIsDeleteDialogOpen(false);
        setOwnerToDelete(null);
      } catch (error) {
        console.error('Error deleting owner:', error);
      }
    }
  };

  const handleAddSelf = () => {
    // Pre-fill with user's profile data if available
    setSelectedOwner({
      id: "",
      user_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      preferred_payment_method: "direct_deposit",
      is_self: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as PropertyOwner);
    setIsAddDialogOpen(true);
  };

  const handleOwnerAdded = () => {
    setSelectedOwner(null);
    // Force a manual refetch to ensure immediate update
    queryClient.invalidateQueries({ queryKey: ['property_owners'] });
  };

  const handleViewOwner = (owner: PropertyOwner) => {
    navigate(`/property-owners/${owner.id}`);
  };

  const getDisplayName = (owner: PropertyOwner) => {
    return owner.company_name || `${owner.first_name} ${owner.last_name}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading property owners...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Property Owners</h2>
              <p className="text-muted-foreground mb-4">
                {error.message || "Failed to load property owners"}
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
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clean Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Property Owners</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage property owner information and contact details • {owners.length} owners
            </p>
          </div>
          
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search owners..." 
              className="pl-10 w-full sm:w-64 min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button 
            className="bg-gradient-primary hover:bg-primary-dark"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property Owner
          </Button>
        </div>

        {/* Property Owners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOwners.map((owner) => (
                  <Card 
                    key={owner.id} 
                    className="shadow-md border-0 hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden"
                    onClick={() => handleViewOwner(owner)}
                  >
                     <CardHeader className="pb-4 relative">
                      {/* "Me" Badge - Top Right Corner */}
                      {owner.is_self && (
                        <Badge variant="secondary" className="absolute top-4 right-4 text-xs z-10">
                          Me
                        </Badge>
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Profile Photo Section */}
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                            {/* TODO: Replace with actual profile photo upload */}
                            {owner.company_name ? (
                              <Building2 className="h-8 w-8" />
                            ) : (
                              <span>
                                {owner.first_name.charAt(0)}{owner.last_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          {/* Photo upload indicator - for future implementation */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted border-2 border-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="font-bold text-lg text-foreground leading-tight">
                                {owner.first_name} {owner.last_name}
                              </h3>
                              {owner.company_name && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {owner.company_name}
                                </p>
                              )}
                            </div>
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
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOwner(owner);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOwner(owner);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Owner
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOwner(owner);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Owner
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Contact Information */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">{owner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{owner.phone}</span>
                        </div>
                        {owner.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {owner.city}, {owner.state}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Property Count & Payment Info - Prominent Display */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-foreground">
                              {owner.property_count || 0} {(owner.property_count || 0) === 1 ? 'Property' : 'Properties'}
                            </span>
                          </div>
                          {(owner.property_count || 0) > 0 && (
                            <Badge variant="outline" className="bg-background">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="font-medium text-foreground capitalize">
                            {owner.preferred_payment_method.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOwner(owner);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOwner(owner);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
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
    </div>
  );
};

export default PropertyOwners;