import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, CreditCard, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePropertyServiceAssignments, useDeletePropertyServiceAssignment, PropertyServiceAssignment } from "@/hooks/queries/usePropertyServiceAssignments";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EditPropertyServiceAssignmentDialog } from "@/components/EditPropertyServiceAssignmentDialog";
import { format } from "date-fns";

interface PropertyServiceAssignmentsProps {
  propertyId?: string;
}

export function PropertyServiceAssignments({ propertyId }: PropertyServiceAssignmentsProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<PropertyServiceAssignment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: assignments, isLoading, error } = usePropertyServiceAssignments(propertyId);
  const deleteAssignmentMutation = useDeletePropertyServiceAssignment();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this service assignment?")) {
      await deleteAssignmentMutation.mutateAsync(id);
    }
  };

  const handleEdit = (assignment: PropertyServiceAssignment) => {
    setSelectedAssignment(assignment);
    setEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Assignments</CardTitle>
          <CardDescription>
            {propertyId ? "No services assigned to this property" : "No service assignments found"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Service Assignments</CardTitle>
        <CardDescription>
          {propertyId ? "Services assigned to this property" : "All service assignments"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {!propertyId && <TableHead>Property</TableHead>}
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Rent %</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                {!propertyId && (
                  <TableCell className="font-medium">
                    {assignment.property?.address || "Unknown Property"}
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {assignment.service?.name || "Unknown Service"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {assignment.service?.category?.replace('_', ' ') || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>${assignment.monthly_fee}</TableCell>
                <TableCell>{assignment.rent_percentage}%</TableCell>
                <TableCell>
                  {format(new Date(assignment.billing_start_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(assignment.status)}>
                    {assignment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Setup Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(assignment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {selectedAssignment && (
      <EditPropertyServiceAssignmentDialog
        assignment={selectedAssignment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    )}
  </>
  );
}