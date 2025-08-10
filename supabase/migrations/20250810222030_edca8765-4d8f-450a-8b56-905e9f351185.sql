-- Create leads table for prospect tracking
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'text')),
  move_in_date DATE,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  source TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'website', 'referral', 'zillow', 'apartments', 'craigslist', 'facebook', 'google', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'touring', 'applied', 'approved', 'rejected', 'leased', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_listings table for marketing listings
CREATE TABLE public.property_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  listed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  rent_amount DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  application_fee DECIMAL(10,2) DEFAULT 0,
  lease_term_months INTEGER DEFAULT 12,
  available_date DATE NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  pet_policy TEXT,
  parking_available BOOLEAN DEFAULT false,
  utilities_included TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  lead_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  listing_platforms TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  virtual_tour_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental_applications table
CREATE TABLE public.rental_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.property_listings(id) ON DELETE SET NULL,
  applicant_first_name TEXT NOT NULL,
  applicant_last_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  date_of_birth DATE,
  social_security_number TEXT,
  current_address TEXT,
  employment_status TEXT CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'student', 'retired')),
  employer_name TEXT,
  monthly_income DECIMAL(10,2),
  desired_move_in_date DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  previous_landlord_name TEXT,
  previous_landlord_phone TEXT,
  rental_history JSONB DEFAULT '[]',
  personal_references JSONB DEFAULT '[]',
  pets JSONB DEFAULT '[]',
  additional_occupants JSONB DEFAULT '[]',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'conditionally_approved', 'rejected', 'withdrawn')),
  application_fee_paid BOOLEAN DEFAULT false,
  application_fee_amount DECIMAL(10,2),
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'in_progress', 'completed', 'failed')),
  credit_check_status TEXT DEFAULT 'pending' CHECK (credit_check_status IN ('pending', 'in_progress', 'completed', 'failed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_tours table for scheduling
CREATE TABLE public.property_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.property_listings(id) ON DELETE SET NULL,
  scheduled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tour_guide_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  tour_type TEXT DEFAULT 'in_person' CHECK (tour_type IN ('in_person', 'virtual', 'self_guided')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  visitor_count INTEGER DEFAULT 1,
  special_requests TEXT,
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('email', 'social_media', 'paid_ads', 'print', 'direct_mail', 'event')),
  target_audience JSONB DEFAULT '{}',
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  metrics JSONB DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  creative_assets JSONB DEFAULT '[]',
  tracking_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Admins can manage all leads" 
ON public.leads FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can manage leads" 
ON public.leads FOR ALL 
USING (has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Assigned users can manage their leads" 
ON public.leads FOR ALL 
USING (assigned_to = auth.uid());

-- Create RLS policies for property_listings
CREATE POLICY "Admins can manage all listings" 
ON public.property_listings FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can manage listings" 
ON public.property_listings FOR ALL 
USING (has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Property owners can manage their property listings" 
ON public.property_listings FOR ALL 
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN property_owners po ON po.id = p.owner_id
    WHERE po.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view active listings" 
ON public.property_listings FOR SELECT 
USING (is_active = true);

-- Create RLS policies for rental_applications
CREATE POLICY "Admins can manage all applications" 
ON public.rental_applications FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can manage applications" 
ON public.rental_applications FOR ALL 
USING (has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Property owners can view applications for their properties" 
ON public.rental_applications FOR SELECT 
USING (
  property_id IN (
    SELECT p.id FROM properties p
    JOIN property_owners po ON po.id = p.owner_id
    WHERE po.user_id = auth.uid()
  )
);

-- Create RLS policies for property_tours
CREATE POLICY "Admins can manage all tours" 
ON public.property_tours FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can manage tours" 
ON public.property_tours FOR ALL 
USING (has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Tour guides can manage their tours" 
ON public.property_tours FOR ALL 
USING (tour_guide_id = auth.uid());

-- Create RLS policies for marketing_campaigns
CREATE POLICY "Admins can manage all campaigns" 
ON public.marketing_campaigns FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can manage campaigns" 
ON public.marketing_campaigns FOR ALL 
USING (has_role(auth.uid(), 'property_manager'));

CREATE POLICY "Campaign creators can manage their campaigns" 
ON public.marketing_campaigns FOR ALL 
USING (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_leads_property_id ON public.leads(property_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_property_listings_property_id ON public.property_listings(property_id);
CREATE INDEX idx_property_listings_is_active ON public.property_listings(is_active);
CREATE INDEX idx_property_listings_available_date ON public.property_listings(available_date);
CREATE INDEX idx_rental_applications_property_id ON public.rental_applications(property_id);
CREATE INDEX idx_rental_applications_status ON public.rental_applications(status);
CREATE INDEX idx_property_tours_property_id ON public.property_tours(property_id);
CREATE INDEX idx_property_tours_scheduled_date ON public.property_tours(scheduled_date);
CREATE INDEX idx_marketing_campaigns_property_id ON public.marketing_campaigns(property_id);
CREATE INDEX idx_marketing_campaigns_status ON public.marketing_campaigns(status);

-- Create triggers for updated_at
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