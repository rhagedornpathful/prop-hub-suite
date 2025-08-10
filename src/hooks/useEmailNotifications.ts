import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface EmailNotificationData {
  tenant_name?: string;
  property_address?: string;
  maintenance_description?: string;
  due_date?: string;
  amount?: number;
  lease_end_date?: string;
  inspection_date?: string;
  inspection_time?: string;
  status?: string;
  priority?: string;
  manager_name?: string;
  emergency_contact?: string;
  monthly_rent?: number;
  move_in_date?: string;
  portal_url?: string;
  payment_url?: string;
  dashboard_url?: string;
  contact_url?: string;
  reschedule_url?: string;
  inspector_name?: string;
  inspection_purpose?: string;
  scheduled_date?: string;
  notes?: string;
  late_fee?: number;
  new_rent?: number;
  current_rent?: number;
  days_remaining?: number;
}

type EmailTemplate = 
  | 'maintenance_request' 
  | 'lease_reminder' 
  | 'welcome_tenant' 
  | 'payment_reminder' 
  | 'maintenance_update' 
  | 'property_inspection';

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendEmail = async (
    template: EmailTemplate,
    to: string[],
    data: EmailNotificationData
  ) => {
    try {
      console.log(`Sending ${template} email to:`, to);
      
      const { data: response, error } = await supabase.functions.invoke('send-property-email', {
        body: {
          template,
          to,
          data
        }
      });

      if (error) {
        throw error;
      }

      console.log('Email sent successfully:', response);
      
      toast({
        title: "Email Sent",
        description: `${template.replace('_', ' ').toUpperCase()} email sent to ${to.length} recipient(s)`,
      });

      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      
      toast({
        title: "Email Failed",
        description: `Failed to send ${template} email. Please try again.`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Specific email sending functions
  const sendMaintenanceRequestEmail = async (
    managerEmails: string[],
    data: {
      tenant_name: string;
      property_address: string;
      maintenance_description: string;
      priority?: string;
      dashboard_url?: string;
    }
  ) => {
    return sendEmail('maintenance_request', managerEmails, data);
  };

  const sendWelcomeTenantEmail = async (
    tenantEmail: string,
    data: {
      tenant_name: string;
      property_address: string;
      move_in_date: string;
      monthly_rent: number;
      manager_name: string;
      emergency_contact: string;
      portal_url?: string;
    }
  ) => {
    return sendEmail('welcome_tenant', [tenantEmail], data);
  };

  const sendPaymentReminderEmail = async (
    tenantEmail: string,
    data: {
      tenant_name: string;
      property_address: string;
      amount: number;
      due_date: string;
      late_fee?: number;
      payment_url?: string;
    }
  ) => {
    return sendEmail('payment_reminder', [tenantEmail], data);
  };

  const sendMaintenanceUpdateEmail = async (
    tenantEmail: string,
    data: {
      tenant_name: string;
      property_address: string;
      maintenance_description: string;
      status: string;
      scheduled_date?: string;
      notes?: string;
    }
  ) => {
    return sendEmail('maintenance_update', [tenantEmail], data);
  };

  const sendLeaseReminderEmail = async (
    tenantEmail: string,
    data: {
      tenant_name: string;
      property_address: string;
      lease_end_date: string;
      days_remaining: number;
      current_rent: number;
      new_rent?: number;
      contact_url?: string;
    }
  ) => {
    return sendEmail('lease_reminder', [tenantEmail], data);
  };

  const sendPropertyInspectionEmail = async (
    tenantEmail: string,
    data: {
      tenant_name: string;
      property_address: string;
      inspection_date: string;
      inspection_time: string;
      inspector_name: string;
      inspection_purpose?: string;
      reschedule_url?: string;
    }
  ) => {
    return sendEmail('property_inspection', [tenantEmail], data);
  };

  return {
    sendEmail,
    sendMaintenanceRequestEmail,
    sendWelcomeTenantEmail,
    sendPaymentReminderEmail,
    sendMaintenanceUpdateEmail,
    sendLeaseReminderEmail,
    sendPropertyInspectionEmail,
  };
};