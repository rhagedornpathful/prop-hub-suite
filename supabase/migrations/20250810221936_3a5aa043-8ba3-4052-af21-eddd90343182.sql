-- Phase 5: Marketing & Leasing System

-- Create leads table for tracking potential tenants
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_move_date DATE,
  preferred_bedrooms INTEGER,
  preferred_bathrooms NUMERIC,
  preferred_location TEXT,
  notes TEXT,
  assigned_to UUID,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_listings table for marketing properties
CREATE TABLE public.property_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rent_amount NUMERIC NOT NULL,
  security_deposit NUMERIC,
  pet_deposit NUMERIC,
  application_fee NUMERIC DEFAULT 0,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC NOT NULL,
  square_feet INTEGER,
  amenities JSONB DEFAULT '[]'::jsonb,
  lease_terms JSONB DEFAULT '[]'::jsonb,
  available_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  virtual_tour_url TEXT,
  floor_plan_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  marketing_notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental_applications table
CREATE TABLE public.rental_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID,
  property_listing_id UUID NOT NULL,
  applicant_first_name TEXT NOT NULL,
  applicant_last_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_dob DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  current_address TEXT,
  current_landlord_name TEXT,
  current_landlord_phone TEXT,
  current_rent_amount NUMERIC,
  move_in_date DATE,
  employment_status TEXT,
  employer_name TEXT,
  employer_phone TEXT,
  annual_income NUMERIC,
  additional_income NUMERIC,
  additional_income_source TEXT,
  has_pets BOOLEAN DEFAULT false,
  pet_details TEXT,
  criminal_background_check BOOLEAN DEFAULT false,
  credit_check_authorized BOOLEAN DEFAULT false,
  references JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  rejection_reason TEXT,
  application_fee_paid BOOLEAN DEFAULT false,
  application_fee_amount NUMERIC,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_tours table for scheduling and tracking tours
CREATE TABLE public.property_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_listing_id UUID NOT NULL,
  lead_id UUID,
  tour_type TEXT NOT NULL DEFAULT 'in_person',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  number_of_attendees INTEGER DEFAULT 1,
  special_requests TEXT,
  tour_guide_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled',
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  tour_notes TEXT,
  feedback_rating INTEGER,
  feedback_comments TEXT,
  follow_up_scheduled BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_campaigns table for tracking marketing efforts
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  target_audience TEXT,
  budget NUMERIC,
  start_date DATE NOT NULL,
  end_date DATE,
  properties JSONB DEFAULT '[]'::jsonb,
  channels JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Admins can manage all leads" 
ON public.leads FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all leads" 
ON public.leads FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Assigned users can manage their leads" 
ON public.leads FOR ALL 
USING (assigned_to = auth.uid());

-- RLS Policies for property_listings
CREATE POLICY "Property listings are viewable by everyone" 
ON public.property_listings FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all property listings" 
ON public.property_listings FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all property listings" 
ON public.property_listings FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can manage listings for their properties" 
ON public.property_listings FOR ALL 
USING (property_id IN (
  SELECT p.id FROM properties p 
  JOIN property_owners po ON po.id = p.owner_id 
  WHERE po.user_id = auth.uid()
));

-- RLS Policies for rental_applications
CREATE POLICY "Admins can manage all rental applications" 
ON public.rental_applications FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all rental applications" 
ON public.rental_applications FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Property owners can view applications for their properties" 
ON public.rental_applications FOR SELECT 
USING (property_listing_id IN (
  SELECT pl.id FROM property_listings pl 
  JOIN properties p ON p.id = pl.property_id 
  JOIN property_owners po ON po.id = p.owner_id 
  WHERE po.user_id = auth.uid()
));

CREATE POLICY "Anyone can submit rental applications" 
ON public.rental_applications FOR INSERT 
WITH CHECK (true);

-- RLS Policies for property_tours
CREATE POLICY "Admins can manage all property tours" 
ON public.property_tours FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all property tours" 
ON public.property_tours FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Tour guides can manage their assigned tours" 
ON public.property_tours FOR ALL 
USING (tour_guide_id = auth.uid());

CREATE POLICY "Property owners can view tours for their properties" 
ON public.property_tours FOR SELECT 
USING (property_listing_id IN (
  SELECT pl.id FROM property_listings pl 
  JOIN properties p ON p.id = pl.property_id 
  JOIN property_owners po ON po.id = p.owner_id 
  WHERE po.user_id = auth.uid()
));

CREATE POLICY "Anyone can schedule property tours" 
ON public.property_tours FOR INSERT 
WITH CHECK (true);

-- RLS Policies for marketing_campaigns
CREATE POLICY "Admins can manage all marketing campaigns" 
ON public.marketing_campaigns FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all marketing campaigns" 
ON public.marketing_campaigns FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Campaign creators can manage their campaigns" 
ON public.marketing_campaigns FOR ALL 
USING (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_email ON public.leads(email);

CREATE INDEX idx_property_listings_property_id ON public.property_listings(property_id);
CREATE INDEX idx_property_listings_is_active ON public.property_listings(is_active);
CREATE INDEX idx_property_listings_is_featured ON public.property_listings(is_featured);
CREATE INDEX idx_property_listings_rent_amount ON public.property_listings(rent_amount);
CREATE INDEX idx_property_listings_bedrooms ON public.property_listings(bedrooms);

CREATE INDEX idx_rental_applications_status ON public.rental_applications(status);
CREATE INDEX idx_rental_applications_property_listing_id ON public.rental_applications(property_listing_id);
CREATE INDEX idx_rental_applications_lead_id ON public.rental_applications(lead_id);
CREATE INDEX idx_rental_applications_email ON public.rental_applications(applicant_email);

CREATE INDEX idx_property_tours_property_listing_id ON public.property_tours(property_listing_id);
CREATE INDEX idx_property_tours_scheduled_date ON public.property_tours(scheduled_date);
CREATE INDEX idx_property_tours_status ON public.property_tours(status);
CREATE INDEX idx_property_tours_lead_id ON public.property_tours(lead_id);

CREATE INDEX idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_start_date ON public.marketing_campaigns(start_date);
CREATE INDEX idx_marketing_campaigns_created_by ON public.marketing_campaigns(created_by);

-- Create triggers for updated_at columns
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_listings_updated_at
BEFORE UPDATE ON public.property_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_applications_updated_at
BEFORE UPDATE ON public.rental_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_tours_updated_at
BEFORE UPDATE ON public.property_tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();