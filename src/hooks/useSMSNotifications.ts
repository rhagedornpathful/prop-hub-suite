import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SMSNotificationData {
  tenant_name?: string;
  property_address?: string;
  maintenance_description?: string;
  amount?: number;
  due_date?: string;
  emergency_type?: string;
  inspection_date?: string;
  days_remaining?: number;
  custom_message?: string;
}

type SMSTemplate = 
  | 'urgent_maintenance' 
  | 'payment_overdue' 
  | 'emergency_alert' 
  | 'lease_expiration' 
  | 'inspection_reminder' 
  | 'custom';

export const useSMSNotifications = () => {
  const { toast } = useToast();

  const sendSMS = async (
    template: SMSTemplate,
    phoneNumbers: string[],
    data: SMSNotificationData
  ) => {
    try {
      console.log(`Sending ${template} SMS to:`, phoneNumbers);
      
      const { data: response, error } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          template,
          phoneNumbers,
          data
        }
      });

      if (error) {
        throw error;
      }

      console.log('SMS sent successfully:', response);
      
      toast({
        title: "SMS Sent",
        description: `${template.replace('_', ' ').toUpperCase()} sent to ${response.totalSent} recipient(s)`,
      });

      return response;
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      toast({
        title: "SMS Failed",
        description: `Failed to send ${template} SMS. Please try again.`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Specific SMS sending functions
  const sendUrgentMaintenanceSMS = async (
    phoneNumbers: string[],
    data: {
      property_address: string;
      maintenance_description: string;
    }
  ) => {
    return sendSMS('urgent_maintenance', phoneNumbers, data);
  };

  const sendPaymentOverdueSMS = async (
    phoneNumber: string,
    data: {
      tenant_name: string;
      property_address: string;
      amount: number;
      due_date: string;
    }
  ) => {
    return sendSMS('payment_overdue', [phoneNumber], data);
  };

  const sendEmergencyAlertSMS = async (
    phoneNumbers: string[],
    data: {
      emergency_type: string;
      property_address: string;
    }
  ) => {
    return sendSMS('emergency_alert', phoneNumbers, data);
  };

  const sendLeaseExpirationSMS = async (
    phoneNumber: string,
    data: {
      tenant_name: string;
      property_address: string;
      days_remaining: number;
    }
  ) => {
    return sendSMS('lease_expiration', [phoneNumber], data);
  };

  const sendInspectionReminderSMS = async (
    phoneNumber: string,
    data: {
      property_address: string;
      inspection_date: string;
    }
  ) => {
    return sendSMS('inspection_reminder', [phoneNumber], data);
  };

  const sendCustomSMS = async (
    phoneNumbers: string[],
    customMessage: string
  ) => {
    return sendSMS('custom', phoneNumbers, { custom_message: customMessage });
  };

  return {
    sendSMS,
    sendUrgentMaintenanceSMS,
    sendPaymentOverdueSMS,
    sendEmergencyAlertSMS,
    sendLeaseExpirationSMS,
    sendInspectionReminderSMS,
    sendCustomSMS,
  };
};