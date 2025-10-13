import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ScheduleMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  content: string;
  subject?: string;
  recipientIds: string[];
}

export const ScheduleMessageDialog: React.FC<ScheduleMessageDialogProps> = ({
  open,
  onOpenChange,
  conversationId,
  content,
  subject,
  recipientIds
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('09:00');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!date || !user) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledFor = new Date(date);
    scheduledFor.setHours(hours, minutes, 0, 0);

    if (scheduledFor <= new Date()) {
      toast({ title: 'Invalid time', description: 'Scheduled time must be in the future', variant: 'destructive' });
      return;
    }

    setIsScheduling(true);
    try {
      const { error } = await supabase.from('scheduled_messages').insert({
        user_id: user.id,
        conversation_id: conversationId,
        content,
        subject,
        recipient_ids: recipientIds,
        scheduled_for: scheduledFor.toISOString(),
        status: 'scheduled'
      });

      if (error) throw error;

      toast({ title: 'Message scheduled', description: `Will be sent on ${format(scheduledFor, 'PPp')}` });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to schedule message:', error);
      toast({ title: 'Error', description: 'Failed to schedule message', variant: 'destructive' });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date()} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-10" />
            </div>
          </div>

          {date && (
            <div className="text-sm text-muted-foreground">
              Message will be sent: {format(date, 'PPP')} at {time}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!date || isScheduling}>
            {isScheduling ? 'Scheduling...' : 'Schedule Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
