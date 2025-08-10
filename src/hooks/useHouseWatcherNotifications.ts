import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isToday, isTomorrow, isPast } from 'date-fns';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  home_check_notifications: boolean;
  schedule_change_notifications: boolean;
  reminder_notifications: boolean;
}

export const useHouseWatcherNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    home_check_notifications: true,
    schedule_change_notifications: true,
    reminder_notifications: true
  });

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('house_watcher_settings')
        .select('email_notifications, push_notifications, home_check_notifications, schedule_change_notifications, reminder_notifications')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      await supabase
        .from('house_watcher_settings')
        .upsert({
          user_id: user.id,
          ...updates
        });

      setPreferences(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sendCheckReminder = async (propertyAddress: string, dueDate: string) => {
    if (!preferences.reminder_notifications) return;

    const checkDate = new Date(dueDate);
    let title = '';
    let description = '';

    if (isPast(checkDate)) {
      title = 'Overdue Check';
      description = `Property check for ${propertyAddress} is overdue`;
    } else if (isToday(checkDate)) {
      title = 'Check Due Today';
      description = `Property check for ${propertyAddress} is due today`;
    } else if (isTomorrow(checkDate)) {
      title = 'Check Due Tomorrow';
      description = `Property check for ${propertyAddress} is due tomorrow`;
    }

    if (title) {
      toast({
        title,
        description,
        duration: 5000
      });

      // Log notification in database
      await supabase
        .from('home_check_activities')
        .insert({
          session_id: crypto.randomUUID(),
          user_id: user?.id,
          activity_type: 'notification',
          activity_data: {
            type: 'reminder',
            property_address: propertyAddress,
            due_date: dueDate,
            notification_type: title.toLowerCase()
          }
        });
    }
  };

  const notifyScheduleChange = async (propertyAddress: string, oldDate: string, newDate: string) => {
    if (!preferences.schedule_change_notifications) return;

    toast({
      title: "Schedule Updated",
      description: `Check for ${propertyAddress} rescheduled from ${oldDate} to ${newDate}`,
      duration: 5000
    });

    // Log notification
    await supabase
      .from('home_check_activities')
      .insert({
        session_id: crypto.randomUUID(),
        user_id: user?.id,
        activity_type: 'notification',
        activity_data: {
          type: 'schedule_change',
          property_address: propertyAddress,
          old_date: oldDate,
          new_date: newDate
        }
      });
  };

  const notifyCheckCompleted = async (propertyAddress: string, sessionId: string) => {
    if (!preferences.home_check_notifications) return;

    toast({
      title: "Check Completed",
      description: `Home check for ${propertyAddress} has been completed`,
      duration: 3000
    });

    // Log notification
    await supabase
      .from('home_check_activities')
      .insert({
        session_id: sessionId,
        user_id: user?.id,
        activity_type: 'notification',
        activity_data: {
          type: 'check_completed',
          property_address: propertyAddress
        }
      });
  };

  useEffect(() => {
    loadPreferences();
  }, [user]);

  return {
    preferences,
    updatePreferences,
    sendCheckReminder,
    notifyScheduleChange,
    notifyCheckCompleted
  };
};