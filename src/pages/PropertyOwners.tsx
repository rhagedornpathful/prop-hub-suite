import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Users,
  ChevronLeft,
  ChevronRight
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
import { useToast } from "@/hooks/use-toast";
import { AddPropertyOwnerDialog } from "@/components/AddPropertyOwnerDialog";
import { useDeletePropertyOwner, useUpdatePropertyOwner } from "@/hooks/queries/usePropertyOwners";
import { useQueryClient } from "@tanstack/react-query";
import { useOptimizedPropertyOwners } from "@/hooks/useOptimizedPropertyOwners";
import { useDebounce } from "@/hooks/useDebounce";
import { OwnerCard } from "@/components/property-owners/OwnerCard";
import { OwnerFilters } from "@/components/property-owners/OwnerFilters";
import type { PropertyOwner, SortField, SortOrder } from "@/utils/propertyOwnerHelpers";
import { getOwnerDisplayName, sortOwners } from "@/utils/propertyOwnerHelpers";

const PropertyOwners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);
  const [ownerToDelete, setOwnerToDelete] = useState<PropertyOwner | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 50;

  // Use optimized hook with caching
  const { data: owners = [], isLoading, error } = useOptimizedPropertyOwners();
  const deleteOwnerMutation = useDeletePropertyOwner();
  const updateOwner = useUpdatePropertyOwner();
  const queryClient = useQueryClient();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize filtered and sorted owners
  const processedOwners = useMemo(() => {
    let filtered = owners;

    // Apply status filter
    if (!showArchived) {
      filtered = filtered.filter(owner => owner.status !== 'archived');
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(owner =>
        `${owner.first_name} ${owner.last_name}`.toLowerCase().includes(term) ||
        owner.company_name?.toLowerCase().includes(term) ||
        owner.email.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    const sorted = sortOwners(filtered, sortField, sortOrder);

    return sorted;
  }, [owners, showArchived, debouncedSearchTerm, sortField, sortOrder]);

  // Paginate owners
  const paginatedOwners = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return processedOwners.slice(start, end);
  }, [processedOwners, currentPage]);

  const totalPages = Math.ceil(processedOwners.length / ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, showArchived, sortField, sortOrder]);

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

  const handleArchiveOwner = async (owner: PropertyOwner) => {
    try {
      await updateOwner.mutateAsync({ id: owner.id, updates: { status: 'archived' } as any });
    } catch (e) {
      console.error('Error archiving owner:', e);
    }
  };

  const handleUnarchiveOwner = async (owner: PropertyOwner) => {
    try {
      await updateOwner.mutateAsync({ id: owner.id, updates: { status: 'active' } as any });
    } catch (e) {
      console.error('Error unarchiving owner:', e);
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
              Manage property owner information and contact details • {processedOwners.length} owners
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <OwnerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

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
          {paginatedOwners.map((owner) => (
            <OwnerCard
              key={owner.id}
              owner={owner}
              onView={handleViewOwner}
              onEdit={handleEditOwner}
              onDelete={handleDeleteOwner}
              onArchive={handleArchiveOwner}
              onUnarchive={handleUnarchiveOwner}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {currentPage * ITEMS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, processedOwners.length)} of {processedOwners.length} owners
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                  if (pageNum >= totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {processedOwners.length === 0 && (
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