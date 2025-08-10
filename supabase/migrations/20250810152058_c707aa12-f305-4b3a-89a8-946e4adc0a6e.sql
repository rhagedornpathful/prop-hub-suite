-- Create services table for service packages
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'house_watching', 'property_management', 'add_on'
  package_tier TEXT, -- 'essential', 'premier', 'platinum', 'standard', 'premium', 'executive'
  base_price NUMERIC NOT NULL DEFAULT 0,
  rent_percentage NUMERIC DEFAULT 0, -- For property management services
  billing_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'percentage', 'one_time', 'quote_based'
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all services" 
ON public.services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all services" 
ON public.services 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the service packages
INSERT INTO public.services (name, description, category, package_tier, base_price, rent_percentage, billing_type, features, sort_order) VALUES
-- House Watching Services
('Essential Package', 'Monthly property visits with basic photo reports and security checks', 'house_watching', 'essential', 149, 0, 'monthly', '["Monthly property visits", "Basic photo reports", "Security & maintenance checks", "Mail collection", "Business hours emergency response (8am-5pm est)"]'::jsonb, 1),
('Premier Package', 'Bi-weekly property visits with detailed reports and 24/7 emergency response', 'house_watching', 'premier', 299, 0, 'monthly', '["Bi-weekly property visits", "Detailed photo reports", "Mail collection & forwarding", "All Essential features", "24/7 emergency response", "Full storm preparation service", "Landscape monitoring", "Pool/spa coordination", "HVAC & filter changes", "2 contractor supervisions/month"]'::jsonb, 2),
('Platinum Package', 'Weekly property visits with comprehensive services and concierge support', 'house_watching', 'platinum', 499, 0, 'monthly', '["Weekly property visits", "Comprehensive photo reports", "Mail collection & forwarding", "All Premier features", "Priority 24/7 emergency response", "Landscape management", "Unlimited contractor supervision", "Concierge services", "Interior cleaning coordination", "Personal property management"]'::jsonb, 3),

-- Property Management Services  
('Standard Management', 'Essential property management with tenant screening and rent collection', 'property_management', 'standard', 199, 6, 'monthly', '["Tenant screening & placement", "Rent collection", "Basic financial reporting", "Maintenance coordination", "Monthly property inspections"]'::jsonb, 4),
('Premium Management', 'Enhanced property management with 24/7 support and detailed reporting', 'property_management', 'premium', 299, 4, 'monthly', '["All Standard features", "Professional property photography", "24/7 tenant support", "Preventive maintenance programs", "Insurance claim assistance", "Detailed financial reporting"]'::jsonb, 5),
('Executive Management', 'Full-service property management with investment advisory and luxury services', 'property_management', 'executive', 399, 2, 'monthly', '["All Premium features", "Investment advisory services", "Capital improvement management", "Tax document preparation", "Luxury amenity coordination", "White-glove tenant services"]'::jsonb, 6),

-- Add-On Services
('Additional Property Visits', 'Extra property visits beyond your package', 'add_on', null, 75, 0, 'one_time', '["Additional property visit", "Basic photo report"]'::jsonb, 7),
('Emergency Response', 'After-hours emergency response service', 'add_on', null, 150, 0, 'one_time', '["Emergency response call", "On-site assessment", "Immediate action coordination"]'::jsonb, 8),
('Contractor Project Management', 'Professional oversight of contractor projects', 'add_on', null, 200, 0, 'one_time', '["Project planning", "Contractor coordination", "Progress monitoring", "Quality assurance"]'::jsonb, 9),
('Deep Cleaning Coordination', 'Professional deep cleaning service coordination', 'add_on', null, 400, 0, 'one_time', '["Professional cleaning coordination", "Quality inspection", "Service scheduling"]'::jsonb, 10),
('Landscape Design Consultation', 'Professional landscape design and planning', 'add_on', null, 0, 0, 'quote_based', '["Site assessment", "Design consultation", "Plant selection", "Implementation planning"]'::jsonb, 11),
('Home Improvement Management', 'Complete home improvement project management', 'add_on', null, 0, 0, 'quote_based', '["Project planning", "Contractor sourcing", "Budget management", "Timeline coordination", "Quality control"]'::jsonb, 12);