-- Create vendors table for Phase 4: Vendor Portal
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  category TEXT NOT NULL, -- plumbing, electrical, hvac, etc.
  specialties JSONB DEFAULT '[]'::jsonb,
  hourly_rate DECIMAL,
  service_areas JSONB DEFAULT '[]'::jsonb,
  license_number TEXT,
  insurance_expiry DATE,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  rating DECIMAL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  average_response_time_hours DECIMAL DEFAULT 0,
  joined_date DATE DEFAULT CURRENT_DATE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_work_orders table
CREATE TABLE public.vendor_work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id),
  property_id UUID REFERENCES public.properties(id),
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  estimated_cost DECIMAL,
  actual_cost DECIMAL,
  materials_cost DECIMAL,
  labor_cost DECIMAL,
  notes TEXT,
  completion_notes TEXT,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_reviews table
CREATE TABLE public.vendor_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  work_order_id UUID REFERENCES public.vendor_work_orders(id),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_invoices table
CREATE TABLE public.vendor_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  work_order_id UUID REFERENCES public.vendor_work_orders(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL NOT NULL,
  tax_amount DECIMAL DEFAULT 0,
  total_amount DECIMAL NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all vendor tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors table
CREATE POLICY "Admins can manage all vendors" ON public.vendors
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all vendors" ON public.vendors
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Vendors can manage their own profile" ON public.vendors
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can view vendors" ON public.vendors
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for vendor_work_orders table
CREATE POLICY "Admins can manage all vendor work orders" ON public.vendor_work_orders
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all vendor work orders" ON public.vendor_work_orders
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Vendors can manage their work orders" ON public.vendor_work_orders
  FOR ALL USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Property owners can view work orders for their properties" ON public.vendor_work_orders
  FOR SELECT USING (property_id IN (
    SELECT p.id FROM properties p 
    JOIN property_owners po ON po.id = p.owner_id 
    WHERE po.user_id = auth.uid()
  ));

-- RLS Policies for vendor_reviews table
CREATE POLICY "Admins can manage all vendor reviews" ON public.vendor_reviews
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all vendor reviews" ON public.vendor_reviews
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can create reviews for completed work" ON public.vendor_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Anyone can view vendor reviews" ON public.vendor_reviews
  FOR SELECT USING (true);

-- RLS Policies for vendor_invoices table
CREATE POLICY "Admins can manage all vendor invoices" ON public.vendor_invoices
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all vendor invoices" ON public.vendor_invoices
  FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Vendors can manage their invoices" ON public.vendor_invoices
  FOR ALL USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_vendors_category ON public.vendors(category);
CREATE INDEX idx_vendors_availability ON public.vendors(availability_status);
CREATE INDEX idx_vendor_work_orders_vendor_id ON public.vendor_work_orders(vendor_id);
CREATE INDEX idx_vendor_work_orders_status ON public.vendor_work_orders(status);
CREATE INDEX idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);
CREATE INDEX idx_vendor_invoices_vendor_id ON public.vendor_invoices(vendor_id);
CREATE INDEX idx_vendor_invoices_status ON public.vendor_invoices(status);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_work_orders_updated_at
  BEFORE UPDATE ON public.vendor_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_reviews_updated_at
  BEFORE UPDATE ON public.vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_invoices_updated_at
  BEFORE UPDATE ON public.vendor_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update vendor ratings when reviews are added
CREATE OR REPLACE FUNCTION public.update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendors 
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.vendor_reviews 
    WHERE vendor_id = NEW.vendor_id
  ),
  updated_at = NOW()
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update vendor rating on new reviews
CREATE TRIGGER update_vendor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vendor_rating();