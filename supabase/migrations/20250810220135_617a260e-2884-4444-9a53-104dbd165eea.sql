-- Create comprehensive payment and subscription system

-- Create payments table for tracking all payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  tenant_id UUID,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('rent', 'deposit', 'fee', 'service', 'late_fee', 'application')),
  payment_method TEXT CHECK (payment_method IN ('card', 'ach', 'check', 'cash')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  description TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create subscriptions table for recurring payments
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID,
  tenant_id UUID,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('rent', 'property_management', 'house_watching')),
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  interval_type TEXT NOT NULL DEFAULT 'month' CHECK (interval_type IN ('month', 'year')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create owner_statements table for financial reporting
CREATE TABLE public.owner_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  property_id UUID,
  statement_period_start DATE NOT NULL,
  statement_period_end DATE NOT NULL,
  total_rent_collected NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  management_fees NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  statement_data JSONB
);

-- Create payment_methods table for storing customer payment methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  last_four TEXT,
  brand TEXT, -- For cards: visa, mastercard, etc.
  is_default BOOLEAN DEFAULT false,
  expires_month INTEGER, -- For cards
  expires_year INTEGER, -- For cards
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rent_rolls table for tracking rental income
CREATE TABLE public.rent_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  tenant_id UUID,
  month_year DATE NOT NULL, -- First day of the month
  rent_amount NUMERIC NOT NULL,
  amount_collected NUMERIC DEFAULT 0,
  late_fees NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'due' CHECK (status IN ('due', 'partial', 'paid', 'late', 'void')),
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_rolls ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can view payments for their properties" ON public.payments
  FOR SELECT USING (
    has_role(auth.uid(), 'property_manager'::app_role) AND
    property_id IN (
      SELECT property_id FROM property_manager_assignments 
      WHERE manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Edge functions can manage payments" ON public.payments
  FOR ALL USING (true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Edge functions can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

-- Owner statements policies
CREATE POLICY "Property owners can view their statements" ON public.owner_statements
  FOR SELECT USING (
    owner_id IN (
      SELECT id FROM property_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all owner statements" ON public.owner_statements
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage owner statements" ON public.owner_statements
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Payment methods policies
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payment methods" ON public.payment_methods
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Rent rolls policies
CREATE POLICY "Admins can manage all rent rolls" ON public.rent_rolls
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage rent rolls for their properties" ON public.rent_rolls
  FOR ALL USING (
    has_role(auth.uid(), 'property_manager'::app_role) AND
    property_id IN (
      SELECT property_id FROM property_manager_assignments 
      WHERE manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can view rent rolls for their properties" ON public.rent_rolls
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN property_owners po ON po.id = p.owner_id
      WHERE po.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view their own rent rolls" ON public.rent_rolls
  FOR SELECT USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_account_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_property_id ON public.payments(property_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON public.payments(stripe_payment_intent_id);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX idx_owner_statements_owner_id ON public.owner_statements(owner_id);
CREATE INDEX idx_owner_statements_property_id ON public.owner_statements(property_id);
CREATE INDEX idx_owner_statements_period ON public.owner_statements(statement_period_start, statement_period_end);

CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_id ON public.payment_methods(stripe_payment_method_id);

CREATE INDEX idx_rent_rolls_property_id ON public.rent_rolls(property_id);
CREATE INDEX idx_rent_rolls_tenant_id ON public.rent_rolls(tenant_id);
CREATE INDEX idx_rent_rolls_month_year ON public.rent_rolls(month_year);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owner_statements_updated_at BEFORE UPDATE ON public.owner_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rent_rolls_updated_at BEFORE UPDATE ON public.rent_rolls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();