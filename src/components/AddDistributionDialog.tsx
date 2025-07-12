import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Distribution {
  id?: string;
  owner_id: string;
  property_id: string;
  amount: number;
  distribution_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}

interface Property {
  id: string;
  address: string;
}

interface AddDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDistributionAdded?: () => void;
  ownerId: string;
  properties: Property[];
}

export function AddDistributionDialog({ 
  open, 
  onOpenChange, 
  onDistributionAdded, 
  ownerId,
  properties
}: AddDistributionDialogProps) {
  const { isMobile } = useMobileDetection();
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [distributionData, setDistributionData] = useState<Distribution>({
    owner_id: ownerId,
    property_id: "",
    amount: 0,
    distribution_date: new Date().toISOString().split('T')[0],
    payment_method: "",
    reference_number: "",
    notes: "",
  });
  const { toast } = useToast();

  const handleSaveDistribution = async () => {
    if (!distributionData.property_id || !distributionData.amount || distributionData.amount <= 0) {
      toast({
        title: "Error",
        description: "Please select a property and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check if we're in demo mode
      const isDemoMode = window.location.pathname.startsWith('/demo');
      
      if (isDemoMode) {
        // In demo mode, just simulate a successful save
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        toast({
          title: "Success",
          description: "Distribution recorded successfully! (Demo Mode)",
        });
        
        onDistributionAdded?.();
        onOpenChange(false);
        resetForm();
        return;
      }

      // Regular authenticated mode
      const { error } = await supabase
        .from('owner_distributions')
        .insert({
          owner_id: distributionData.owner_id,
          property_id: distributionData.property_id,
          amount: distributionData.amount,
          distribution_date: distributionData.distribution_date,
          payment_method: distributionData.payment_method || null,
          reference_number: distributionData.reference_number || null,
          notes: distributionData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Distribution recorded successfully!",
      });

      onDistributionAdded?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving distribution:', error);
      toast({
        title: "Error",
        description: "Failed to record distribution",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setDistributionData({
      owner_id: ownerId,
      property_id: "",
      amount: 0,
      distribution_date: new Date().toISOString().split('T')[0],
      payment_method: "",
      reference_number: "",
      notes: "",
    });
    setDate(new Date());
  };

  const handleInputChange = (field: keyof Distribution, value: any) => {
    setDistributionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      handleInputChange('distribution_date', selectedDate.toISOString().split('T')[0]);
    }
  };

  const DialogWrapper = isMobile ? MobileDialog : Dialog;
  const ContentWrapper = isMobile ? "div" : DialogContent;

  return (
    <DialogWrapper open={open} onOpenChange={onOpenChange}>
      <ContentWrapper className={isMobile ? "" : "max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>Record Distribution Payment</DialogTitle>
          <DialogDescription>
            Record a payment made to the property owner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Property *</Label>
              <Select 
                value={distributionData.property_id} 
                onValueChange={(value) => handleInputChange('property_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={distributionData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Distribution Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={distributionData.payment_method} 
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={distributionData.reference_number || ''}
                onChange={(e) => handleInputChange('reference_number', e.target.value)}
                placeholder="Check number, transaction ID, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={distributionData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this payment"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDistribution} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </DialogWrapper>
  );
}