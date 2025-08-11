-- Phase 1: Enhanced Property Data Model and Analytics

-- Enhance properties table with comprehensive data structure
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_class text,
ADD COLUMN IF NOT EXISTS listing_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS market_value numeric,
ADD COLUMN IF NOT EXISTS assessed_value numeric,
ADD COLUMN IF NOT EXISTS purchase_price numeric,
ADD COLUMN IF NOT EXISTS purchase_date date,
ADD COLUMN IF NOT EXISTS renovation_cost numeric,
ADD COLUMN IF NOT EXISTS hoa_fees numeric,
ADD COLUMN IF NOT EXISTS insurance_cost numeric,
ADD COLUMN IF NOT EXISTS property_taxes numeric,
ADD COLUMN IF NOT EXISTS cap_rate numeric,
ADD COLUMN IF NOT EXISTS cash_flow numeric,
ADD COLUMN IF NOT EXISTS occupancy_rate numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS lease_expiry_date date,
ADD COLUMN IF NOT EXISTS last_inspection_date date,
ADD COLUMN IF NOT EXISTS next_inspection_date date,
ADD COLUMN IF NOT EXISTS energy_efficiency_rating text,
ADD COLUMN IF NOT EXISTS neighborhood_score numeric,
ADD COLUMN IF NOT EXISTS walkability_score numeric,
ADD COLUMN IF NOT EXISTS school_rating numeric,
ADD COLUMN IF NOT EXISTS crime_score numeric,
ADD COLUMN IF NOT EXISTS appreciation_rate numeric,
ADD COLUMN IF NOT EXISTS days_on_market integer,
ADD COLUMN IF NOT EXISTS marketing_description text,
ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS nearby_attractions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS investment_metrics jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS zillow_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_zillow_sync timestamp with time zone,
ADD COLUMN IF NOT EXISTS data_sources jsonb DEFAULT '{}'::jsonb;

-- Create property analytics table for tracking performance
CREATE TABLE IF NOT EXISTS public.property_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  comparison_period text, -- 'monthly', 'quarterly', 'yearly'
  change_percentage numeric,
  benchmark_value numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create property market comparisons table
CREATE TABLE IF NOT EXISTS public.property_market_comparisons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  comparable_address text NOT NULL,
  comparable_price numeric,
  comparable_sqft numeric,
  comparable_bed_bath text,
  distance_miles numeric,
  days_on_market integer,
  sold_date date,
  price_per_sqft numeric,
  comparison_score numeric,
  data_source text DEFAULT 'zillow',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create property alerts table for automated notifications
CREATE TABLE IF NOT EXISTS public.property_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  alert_type text NOT NULL, -- 'maintenance_due', 'inspection_due', 'lease_expiry', 'market_change', 'performance'
  priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  title text NOT NULL,
  description text,
  threshold_value numeric,
  current_value numeric,
  is_active boolean DEFAULT true,
  is_acknowledged boolean DEFAULT false,
  acknowledged_at timestamp with time zone,
  acknowledged_by uuid,
  triggered_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_analytics_property_id ON public.property_analytics(property_id);
CREATE INDEX IF NOT EXISTS idx_property_analytics_metric_type ON public.property_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_property_analytics_date ON public.property_analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_property_comparisons_property_id ON public.property_market_comparisons(property_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_property_id ON public.property_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_active ON public.property_alerts(is_active) WHERE is_active = true;

-- Enable RLS on new tables
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_market_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_analytics
CREATE POLICY "Admins can manage all analytics" ON public.property_analytics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage analytics" ON public.property_analytics
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can view their analytics" ON public.property_analytics
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p 
      JOIN property_owners po ON po.id = p.owner_id 
      WHERE po.user_id = auth.uid()
    )
  );

-- RLS policies for property_market_comparisons
CREATE POLICY "Admins can manage all comparisons" ON public.property_market_comparisons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage comparisons" ON public.property_market_comparisons
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can view their comparisons" ON public.property_market_comparisons
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p 
      JOIN property_owners po ON po.id = p.owner_id 
      WHERE po.user_id = auth.uid()
    )
  );

-- RLS policies for property_alerts
CREATE POLICY "Admins can manage all alerts" ON public.property_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage alerts" ON public.property_alerts
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can view their alerts" ON public.property_alerts
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p 
      JOIN property_owners po ON po.id = p.owner_id 
      WHERE po.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_property_analytics_updated_at
  BEFORE UPDATE ON public.property_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_alerts_updated_at
  BEFORE UPDATE ON public.property_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();