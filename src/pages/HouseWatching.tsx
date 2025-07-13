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
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
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
import { useHouseWatchers, useDeleteHouseWatcher } from "@/hooks/queries/useHouseWatchers";

const HouseWatching = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [watcherToDelete, setWatcherToDelete] = useState<any>(null);
  const { toast } = useToast();

  // Use hooks to fetch data
  const { data: watchers = [], isLoading, error } = useHouseWatchers();
  const deleteWatcherMutation = useDeleteHouseWatcher();

  const filteredWatchers = watchers.filter(watcher =>
    `${watcher.user_profiles?.first_name || ''} ${watcher.user_profiles?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    watcher.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteWatcher = (watcher: any) => {
    // Check if watcher has assigned properties
    if (watcher.assigned_properties && watcher.assigned_properties > 0) {
      toast({
        title: "Cannot Remove House Watcher",
        description: `${getDisplayName(watcher)} has ${watcher.assigned_properties} properties assigned. Please reassign properties first.`,
        variant: "destructive"
      });
      return;
    }
    setWatcherToDelete(watcher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (watcherToDelete) {
      try {
        await deleteWatcherMutation.mutateAsync(watcherToDelete.id);
        setIsDeleteDialogOpen(false);
        setWatcherToDelete(null);
      } catch (error) {
        console.error('Error deleting house watcher:', error);
      }
    }
  };

  const handleViewWatcher = (watcher: any) => {
    // Navigate to watcher detail page (to be created)
    navigate(`/house-watchers/${watcher.id}`);
  };

  const getDisplayName = (watcher: any) => {
    return watcher.user_profiles?.first_name && watcher.user_profiles?.last_name
      ? `${watcher.user_profiles.first_name} ${watcher.user_profiles.last_name}`
      : watcher.user_profiles?.email || 'Unknown';
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
              <p className="text-muted-foreground">Loading house watchers...</p>
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
              <h2 className="text-xl font-semibold mb-2">Error Loading House Watchers</h2>
              <p className="text-muted-foreground mb-4">
                {error.message || "Failed to load house watchers"}
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
            <h1 className="text-3xl font-bold text-foreground">House Watchers</h1>
            <p className="text-muted-foreground">
              Manage house watchers and property monitoring staff • {watchers.length} watchers
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search watchers..." 
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
          <Button 
            className="bg-gradient-primary hover:bg-primary-dark"
            onClick={() => navigate('/user-management')} // Link to add new house watcher via user management
          >
            <Plus className="h-4 w-4 mr-2" />
            Add House Watcher
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Rounds
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Watchers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{watchers.length}</div>
              <p className="text-xs text-muted-foreground">Currently monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties Covered</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {watchers.reduce((sum, w) => sum + (w.assigned_properties || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Checks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* House Watchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWatchers.map((watcher) => (
            <Card 
              key={watcher.id} 
              className="shadow-md border-0 hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden"
              onClick={() => handleViewWatcher(watcher)}
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
                      handleViewWatcher(watcher);
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
                        handleDeleteWatcher(watcher);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Watcher
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex items-start gap-4">
                  {/* Profile Photo Section */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                      <span>
                        {watcher.user_profiles?.first_name?.charAt(0) || 'H'}
                        {watcher.user_profiles?.last_name?.charAt(0) || 'W'}
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
                          {getDisplayName(watcher)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          House Watcher
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contact Information */}
                {watcher.user_profiles?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">
                      {watcher.user_profiles.email}
                    </span>
                  </div>
                )}

                {watcher.user_profiles?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {watcher.user_profiles.phone}
                    </span>
                  </div>
                )}

                {/* Location */}
                {(watcher.user_profiles?.city || watcher.user_profiles?.state) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {[watcher.user_profiles.city, watcher.user_profiles.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {watcher.assigned_properties || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {formatDate(watcher.created_at)}
                    </div>
                    <div className="text-xs text-muted-foreground">Started</div>
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
                      // Handle assign properties
                    }}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-primary hover:bg-primary-dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewWatcher(watcher);
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
        {filteredWatchers.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No House Watchers Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'No house watchers match your search criteria.'
                    : 'No house watchers have been added to the system yet.'
                  }
                </p>
                <Button 
                  className="bg-gradient-primary hover:bg-primary-dark"
                  onClick={() => navigate('/user-management')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First House Watcher
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove House Watcher</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {watcherToDelete && getDisplayName(watcherToDelete)} from the house watching system? 
                This action cannot be undone and will remove all their property assignments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Watcher
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default HouseWatching;