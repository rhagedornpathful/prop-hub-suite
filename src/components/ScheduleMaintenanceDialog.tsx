import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileDialog } from "@/components/mobile/MobileDialog";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wrench } from "lucide-react";

interface ScheduleMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMaintenanceScheduled?: () => void;
}

interface Property {
  id: string;
  address: string;
}

interface MaintenanceData {
  property_id: string;
  title: string;
  description: string;
  priority: string;
  scheduled_date: string;
  contractor_name: string;
  contractor_contact: string;
  estimated_cost: number;
  notes: string;
}

export function ScheduleMaintenanceDialog({ open, onOpenChange, onMaintenanceScheduled }: ScheduleMaintenanceDialogProps) {
  const { isMobile } = useMobileDetection();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData>({
    property_id: "",
    title: "",
    description: "",
    priority: "medium",
    scheduled_date: "",
    contractor_name: "",
    contractor_contact: "",
    estimated_cost: 0,
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProperties();
    }
  }, [open]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, address');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!maintenanceData.property_id || !maintenanceData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          ...maintenanceData,
          user_id: userData.user.id,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance scheduled successfully!",
      });

      onMaintenanceScheduled?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setMaintenanceData({
      property_id: "",
      title: "",
      description: "",
      priority: "medium",
      scheduled_date: "",
      contractor_name: "",
      contractor_contact: "",
      estimated_cost: 0,
      notes: "",
    });
  };

  const handleInputChange = (field: keyof MaintenanceData, value: any) => {
    setMaintenanceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const DialogWrapper = isMobile ? MobileDialog : Dialog;
  const ContentWrapper = isMobile ? "div" : DialogContent;

  return (
    <DialogWrapper open={open} onOpenChange={onOpenChange}>
      <ContentWrapper className={isMobile ? "" : "max-w-2xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>Schedule Maintenance</DialogTitle>
          <DialogDescription>
            Schedule a maintenance task for one of your properties.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Maintenance Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Select 
                  value={maintenanceData.property_id} 
                  onValueChange={(value) => handleInputChange('property_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Maintenance Title *</Label>
                <Input
                  id="title"
                  value={maintenanceData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., HVAC System Inspection"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={maintenanceData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the maintenance work needed"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={maintenanceData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Scheduled Date</Label>
                  <Input
                    id="scheduled-date"
                    type="datetime-local"
                    value={maintenanceData.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contractor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contractor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-name">Contractor Name</Label>
                <Input
                  id="contractor-name"
                  value={maintenanceData.contractor_name}
                  onChange={(e) => handleInputChange('contractor_name', e.target.value)}
                  placeholder="Contractor or company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-contact">Contact Information</Label>
                <Input
                  id="contractor-contact"
                  value={maintenanceData.contractor_contact}
                  onChange={(e) => handleInputChange('contractor_contact', e.target.value)}
                  placeholder="Phone number or email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-cost">Estimated Cost ($)</Label>
                <Input
                  id="estimated-cost"
                  type="number"
                  value={maintenanceData.estimated_cost || ''}
                  onChange={(e) => handleInputChange('estimated_cost', parseInt(e.target.value) || 0)}
                  placeholder="Estimated cost"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={maintenanceData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or special instructions"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMaintenance} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </>
              )}
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </DialogWrapper>
  );
}