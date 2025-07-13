import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SchedulePropertyCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyAddress: string;
}

export function SchedulePropertyCheckDialog({
  open,
  onOpenChange,
  propertyId,
  propertyAddress,
}: SchedulePropertyCheckDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  // Generate time options (every hour from 8 AM to 6 PM)
  const timeOptions = [];
  for (let hour = 8; hour <= 18; hour++) {
    const time12 = hour <= 12 ? hour : hour - 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayTime = `${time12 === 0 ? 12 : time12}:00 ${ampm}`;
    const valueTime = `${hour.toString().padStart(2, '0')}:00:00`;
    timeOptions.push({ label: displayTime, value: valueTime });
  }

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for the scheduled check.",
        variant: "destructive",
      });
      return;
    }

    // Don't allow scheduling in the past
    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (selectedDateTime <= new Date()) {
      toast({
        title: "Invalid Date/Time",
        description: "Cannot schedule a check in the past.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from('property_check_sessions')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          scheduled_by: user.id,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: "Check Scheduled",
        description: `Property check scheduled for ${format(selectedDate, 'PPP')} at ${timeOptions.find(t => t.value === selectedTime)?.label}`,
      });

      onOpenChange(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    } catch (error) {
      console.error('Error scheduling check:', error);
      toast({
        title: "Error",
        description: "Failed to schedule property check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Property Check</DialogTitle>
          <DialogDescription>
            Schedule a property inspection for {propertyAddress}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Time</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedTime ? timeOptions.find(t => t.value === selectedTime)?.label : "Select time"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isScheduling || !selectedDate || !selectedTime}
          >
            {isScheduling ? "Scheduling..." : "Schedule Check"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}