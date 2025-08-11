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
  Filter,
  Users,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp
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
import { usePropertyManagers, useDeletePropertyManager } from "@/hooks/queries/usePropertyManagers";
import AddPropertyManagerDialog from "@/components/AddPropertyManagerDialog";
import AssignPropertiesToManagerDialog from "@/components/AssignPropertiesToManagerDialog";

const PropertyManagerView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<any>(null);
  const { toast } = useToast();

  // Use hooks to fetch data
  const { data: managers = [], isLoading, error } = usePropertyManagers();
  const deleteManagerMutation = useDeletePropertyManager();

  const filteredManagers = managers.filter(manager =>
    `${manager.user_profiles?.first_name || ''} ${manager.user_profiles?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteManager = (manager: any) => {
    // Check if manager has assigned properties
    if (manager.assigned_properties && manager.assigned_properties > 0) {
      toast({
        title: "Cannot Remove Property Manager",
        description: `${getDisplayName(manager)} has ${manager.assigned_properties} properties assigned. Please reassign properties first.`,
        variant: "destructive"
      });
      return;
    }
    setManagerToDelete(manager);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (managerToDelete) {
      try {
        await deleteManagerMutation.mutateAsync(managerToDelete.id);
        setIsDeleteDialogOpen(false);
        setManagerToDelete(null);
      } catch (error) {
        console.error('Error deleting property manager:', error);
      }
    }
  };

  const handleViewManager = (manager: any) => {
    // Navigate to manager detail page (to be created)
    navigate(`/property-managers/${manager.id}`);
  };

  const getDisplayName = (manager: any) => {
    return manager.user_profiles?.first_name && manager.user_profiles?.last_name
      ? `${manager.user_profiles.first_name} ${manager.user_profiles.last_name}`
      : manager.user_profiles?.email || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading property managers...</p>
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
              <h2 className="text-xl font-semibold mb-2">Error Loading Property Managers</h2>
              <p className="text-muted-foreground mb-4">
                {error.message || "Failed to load property managers"}
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Property Managers</h1>
            <p className="text-muted-foreground">
              Manage property managers and their property assignments • {managers.length} managers
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search managers..." 
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
          <AddPropertyManagerDialog onPropertyManagerAdded={() => {
            // Refresh the data when a new property manager is added
            window.location.reload();
          }} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.length}</div>
              <p className="text-xs text-muted-foreground">Currently managing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties Managed</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managers.reduce((sum, m) => sum + (m.assigned_properties || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Property Managers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((manager) => (
            <Card 
              key={manager.id} 
              className="shadow-md border-0 hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden"
              onClick={() => handleViewManager(manager)}
            >
              <CardHeader className="pb-4 relative">
                {/* Action Menu - Top Right Corner */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleViewManager(manager);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit - navigate to user management or create edit dialog
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteManager(manager);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Manager
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex items-start gap-4">
                  {/* Profile Photo Section */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                      <span>
                        {manager.user_profiles?.first_name?.charAt(0) || 'P'}
                        {manager.user_profiles?.last_name?.charAt(0) || 'M'}
                      </span>
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="font-bold text-lg text-foreground leading-tight">
                          {getDisplayName(manager)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Property Manager
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contact Information */}
                {manager.user_profiles?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">
                      {manager.user_profiles.email}
                    </span>
                  </div>
                )}

                {manager.user_profiles?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {manager.user_profiles.phone}
                    </span>
                  </div>
                )}

                {/* Location */}
                {(manager.user_profiles?.city || manager.user_profiles?.state) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {[manager.user_profiles.city, manager.user_profiles.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {manager.assigned_properties || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {manager.created_at ? formatDate(manager.created_at) : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Started</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <AssignPropertiesToManagerDialog
                    managerId={manager.user_id || manager.id}
                    managerName={getDisplayName(manager)}
                    onAssignmentComplete={() => {
                      // Refresh the data when properties are assigned
                      window.location.reload();
                    }}
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  </AssignPropertiesToManagerDialog>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewManager(manager);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredManagers.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Property Managers Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'No property managers match your search criteria.'
                    : 'Get started by adding your first property manager to the system.'
                  }
                </p>
                {!searchTerm && (
                  <AddPropertyManagerDialog onPropertyManagerAdded={() => window.location.reload()}>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Property Manager
                    </Button>
                  </AddPropertyManagerDialog>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Property Manager</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {managerToDelete && getDisplayName(managerToDelete)}? 
                This action cannot be undone and will revoke their access to the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Manager
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PropertyManagerView;