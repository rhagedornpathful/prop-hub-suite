-- Create check templates tables and insert default data
CREATE TABLE IF NOT EXISTS public.check_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('home_check', 'property_check')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.check_template_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (template_id) REFERENCES public.check_templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.check_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL,
  item_text TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (section_id) REFERENCES public.check_template_sections(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.check_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_template_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for check_templates
CREATE POLICY "Admins can manage all check templates" ON public.check_templates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Property managers can manage all check templates" ON public.check_templates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'::app_role
  )
);

CREATE POLICY "Check templates are viewable by authenticated users" ON public.check_templates FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Create RLS policies for check_template_sections
CREATE POLICY "Admins can manage all check template sections" ON public.check_template_sections FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Property managers can manage all check template sections" ON public.check_template_sections FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'::app_role
  )
);

CREATE POLICY "Check template sections are viewable by authenticated users" ON public.check_template_sections FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Create RLS policies for check_template_items
CREATE POLICY "Admins can manage all check template items" ON public.check_template_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Property managers can manage all check template items" ON public.check_template_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'property_manager'::app_role
  )
);

CREATE POLICY "Check template items are viewable by authenticated users" ON public.check_template_items FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Create updated_at triggers
CREATE TRIGGER update_check_templates_updated_at
    BEFORE UPDATE ON public.check_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_check_template_sections_updated_at
    BEFORE UPDATE ON public.check_template_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_check_template_items_updated_at
    BEFORE UPDATE ON public.check_template_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
DO $$
DECLARE
    home_template_id UUID;
    property_template_id UUID;
    section_id UUID;
BEGIN
    -- Insert Home Check Template
    INSERT INTO public.check_templates (name, description, type, is_active)
    VALUES (
        'Default Home Check',
        'Standard home inspection checklist for house watching services',
        'home_check',
        true
    ) RETURNING id INTO home_template_id;

    -- Insert Property Check Template  
    INSERT INTO public.check_templates (name, description, type, is_active)
    VALUES (
        'Default Property Check',
        'Comprehensive property inspection checklist for property management',
        'property_check',
        true
    ) RETURNING id INTO property_template_id;

    -- Insert Home Check Sections and Items
    -- Exterior Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (home_template_id, 'Exterior', 'External property inspection', 1) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Take photo of front of house upon arrival', true, 1),
    (section_id, 'Walk around front of property, check doors/windows secure', true, 2),
    (section_id, 'Complete perimeter walk, check all exterior access points', true, 3),
    (section_id, 'Look up at roof, gutters, downspouts from ground level', true, 4),
    (section_id, 'Test front porch light and any motion sensors', true, 5),
    (section_id, 'Collect mail, packages, newspapers, flyers', true, 6),
    (section_id, 'Note condition of lawn, plants, sprinklers', false, 7),
    (section_id, 'Check trash collection status, move bins if needed', false, 8);

    -- Entry & Security Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (home_template_id, 'Entry & Security', 'Property access and security systems', 2) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Unlock and enter property, handle alarm system', true, 1),
    (section_id, 'Quick walk-through to check for obvious issues', true, 2),
    (section_id, 'Verify all windows/doors show secure on alarm panel', true, 3);

    -- Interior Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (home_template_id, 'Interior', 'Internal property inspection', 3) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Check main living room, family room, dining room', true, 1),
    (section_id, 'Run water at sink, check appliances, look for leaks', true, 2),
    (section_id, 'Run water at all sinks, flush toilets, check for leaks', true, 3),
    (section_id, 'Enter all bedrooms, check windows, general condition', true, 4),
    (section_id, 'Check basement, utility room, water heater, HVAC', true, 5),
    (section_id, 'Test 3-4 light switches, check smoke detector lights', true, 6),
    (section_id, 'Check thermostat, note temperature, adjust if needed', true, 7),
    (section_id, 'Water plants per owner instructions', false, 8),
    (section_id, 'Open/close different curtains, move items for lived-in look', false, 9);

    -- Final Steps Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (home_template_id, 'Final Steps', 'Completion and securing tasks', 4) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Take one final photo of main living area before leaving', true, 1),
    (section_id, 'Turn off unnecessary lights, rearm alarm system', true, 2),
    (section_id, 'Ensure all doors locked, test locks from outside', true, 3),
    (section_id, 'Take final exterior photo showing property secured', true, 4);

    -- Insert Property Check Sections and Items
    -- Exterior Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (property_template_id, 'Exterior', 'External building inspection', 1) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Inspect roof condition and gutters', true, 1),
    (section_id, 'Check exterior walls and siding', true, 2),
    (section_id, 'Examine windows and doors', true, 3),
    (section_id, 'Assess driveway and walkways', false, 4),
    (section_id, 'Check outdoor lighting systems', false, 5),
    (section_id, 'Inspect fencing and boundaries', false, 6),
    (section_id, 'Evaluate landscaping condition', false, 7),
    (section_id, 'Check building foundation', true, 8);

    -- Interior Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (property_template_id, 'Interior', 'Internal systems and condition', 2) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Assess overall interior condition', true, 1),
    (section_id, 'Test electrical systems and outlets', true, 2),
    (section_id, 'Check plumbing and water systems', true, 3),
    (section_id, 'Inspect HVAC system operation', true, 4),
    (section_id, 'Test safety systems (smoke/CO detectors)', true, 5),
    (section_id, 'Check flooring condition', false, 6),
    (section_id, 'Inspect walls and ceilings', false, 7),
    (section_id, 'Evaluate appliances (if included)', false, 8);

    -- Security Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (property_template_id, 'Security', 'Security systems and access control', 3) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Test all entry point locks', true, 1),
    (section_id, 'Check window security', true, 2),
    (section_id, 'Inspect security system functionality', false, 3),
    (section_id, 'Test motion-activated lighting', false, 4),
    (section_id, 'Verify garage security', false, 5),
    (section_id, 'Check perimeter security', false, 6);

    -- Utilities Section
    INSERT INTO public.check_template_sections (template_id, name, description, sort_order)
    VALUES (property_template_id, 'Utilities', 'Utility systems and readings', 4) RETURNING id INTO section_id;
    
    INSERT INTO public.check_template_items (section_id, item_text, is_required, sort_order) VALUES
    (section_id, 'Test water pressure and flow', true, 1),
    (section_id, 'Check electrical panel and circuits', true, 2),
    (section_id, 'Inspect gas systems (if applicable)', false, 3),
    (section_id, 'Test utility shut-off valves', false, 4),
    (section_id, 'Check internet/communication lines', false, 5),
    (section_id, 'Inspect meter readings', false, 6);

END $$;