import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PropertyServiceAssignment, useUpdatePropertyServiceAssignment } from "@/hooks/queries/usePropertyServiceAssignments";
import { useToast } from "@/hooks/use-toast";

interface EditPropertyServiceAssignmentDialogProps {
  assignment: PropertyServiceAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPropertyServiceAssignmentDialog({
  assignment,
  open,
  onOpenChange,
}: EditPropertyServiceAssignmentDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    monthly_fee: "",
    rent_percentage: "",
    status: "",
  });

  const updateAssignmentMutation = useUpdatePropertyServiceAssignment();
  const { toast } = useToast();

  useEffect(() => {
    if (assignment) {
      setFormData({
        monthly_fee: assignment.monthly_fee.toString(),
        rent_percentage: assignment.rent_percentage.toString(),
        status: assignment.status,
      });
      setStartDate(new Date(assignment.billing_start_date));
      if (assignment.billing_end_date) {
        setEndDate(new Date(assignment.billing_end_date));
      }
    }
  }, [assignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAssignmentMutation.mutateAsync({
        id: assignment.id,
        updates: {
          monthly_fee: parseFloat(formData.monthly_fee) || 0,
          rent_percentage: parseFloat(formData.rent_percentage) || 0,
          billing_start_date: startDate.toISOString().split('T')[0],
          billing_end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
          status: formData.status as any,
        },
      });

      toast({
        title: "Assignment updated",
        description: "Service assignment has been successfully updated.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Service Assignment</DialogTitle>
          <DialogDescription>
            Update the service assignment details for {assignment.property?.address}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Service</Label>
            <div className="p-2 bg-muted rounded text-sm">
              {assignment.service?.name}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_fee">Monthly Fee ($)</Label>
              <Input
                id="monthly_fee"
                type="number"
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent_percentage">Rent Percentage (%)</Label>
              <Input
                id="rent_percentage"
                type="number"
                value={formData.rent_percentage}
                onChange={(e) => setFormData({ ...formData, rent_percentage: e.target.value })}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAssignmentMutation.isPending}>
              {updateAssignmentMutation.isPending ? "Updating..." : "Update Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}