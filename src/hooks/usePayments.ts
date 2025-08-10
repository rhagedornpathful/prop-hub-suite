import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface PaymentRequest {
  amount: number;
  currency?: string;
  paymentType: 'rent' | 'deposit' | 'application_fee' | 'maintenance' | 'utilities' | 'other';
  description?: string;
  propertyId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionRequest {
  amount: number;
  currency?: string;
  interval: 'month' | 'year';
  planName: string;
  propertyId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export const usePayments = () => {
  const { toast } = useToast();

  const createOneTimePayment = async (paymentData: PaymentRequest) => {
    try {
      console.log('Creating one-time payment:', paymentData);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: paymentData.currency || 'usd',
          payment_type: paymentData.paymentType,
          description: paymentData.description,
          property_id: paymentData.propertyId,
          tenant_id: paymentData.tenantId,
          metadata: paymentData.metadata,
        }
      });

      if (error) {
        throw error;
      }

      console.log('Payment session created:', data);
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.open(data.url, '_blank');
      }

      toast({
        title: "Payment Initiated",
        description: `${paymentData.paymentType.toUpperCase()} payment of $${paymentData.amount} initiated`,
      });

      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      
      toast({
        title: "Payment Failed",
        description: `Failed to initiate ${paymentData.paymentType} payment. Please try again.`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const createSubscription = async (subscriptionData: SubscriptionRequest) => {
    try {
      console.log('Creating subscription:', subscriptionData);
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          amount: Math.round(subscriptionData.amount * 100), // Convert to cents
          currency: subscriptionData.currency || 'usd',
          interval: subscriptionData.interval,
          plan_type: 'rent_subscription',
          description: subscriptionData.planName,
          property_id: subscriptionData.propertyId,
          tenant_id: subscriptionData.tenantId,
          metadata: subscriptionData.metadata,
        }
      });

      if (error) {
        throw error;
      }

      console.log('Subscription session created:', data);
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.open(data.url, '_blank');
      }

      toast({
        title: "Subscription Initiated",
        description: `${subscriptionData.planName} subscription of $${subscriptionData.amount}/${subscriptionData.interval} initiated`,
      });

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      
      toast({
        title: "Subscription Failed",
        description: `Failed to initiate ${subscriptionData.planName} subscription. Please try again.`,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Predefined payment templates
  const createRentPayment = async (amount: number, propertyId: string, tenantId?: string) => {
    return createOneTimePayment({
      amount,
      paymentType: 'rent',
      description: 'Monthly Rent Payment',
      propertyId,
      tenantId,
    });
  };

  const createApplicationFee = async (amount: number, propertyId: string) => {
    return createOneTimePayment({
      amount,
      paymentType: 'application_fee',
      description: 'Rental Application Fee',
      propertyId,
    });
  };

  const createSecurityDeposit = async (amount: number, propertyId: string, tenantId?: string) => {
    return createOneTimePayment({
      amount,
      paymentType: 'deposit',
      description: 'Security Deposit',
      propertyId,
      tenantId,
    });
  };

  const createMaintenanceFee = async (amount: number, propertyId: string, description: string) => {
    return createOneTimePayment({
      amount,
      paymentType: 'maintenance',
      description,
      propertyId,
    });
  };

  const createMonthlyRentSubscription = async (amount: number, propertyId: string, tenantId?: string) => {
    return createSubscription({
      amount,
      interval: 'month',
      planName: 'Monthly Rent Subscription',
      propertyId,
      tenantId,
    });
  };

  return {
    createOneTimePayment,
    createSubscription,
    createRentPayment,
    createApplicationFee,
    createSecurityDeposit,
    createMaintenanceFee,
    createMonthlyRentSubscription,
  };
};