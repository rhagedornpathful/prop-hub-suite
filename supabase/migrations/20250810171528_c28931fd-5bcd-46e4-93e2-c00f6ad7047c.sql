-- Create check templates table
CREATE TABLE public.check_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('home_check', 'property_check')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create check template sections table
CREATE TABLE public.check_template_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.check_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create check template items table
CREATE TABLE public.check_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.check_template_sections(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.check_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_template_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for check_templates
CREATE POLICY "Admins can manage all check templates" 
ON public.check_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all check templates" 
ON public.check_templates 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can view active check templates" 
ON public.check_templates 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for check_template_sections
CREATE POLICY "Admins can manage all check template sections" 
ON public.check_template_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all check template sections" 
ON public.check_template_sections 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can view check template sections" 
ON public.check_template_sections 
FOR SELECT 
USING (true);

-- RLS Policies for check_template_items
CREATE POLICY "Admins can manage all check template items" 
ON public.check_template_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage all check template items" 
ON public.check_template_items 
FOR ALL 
USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Users can view check template items" 
ON public.check_template_items 
FOR SELECT 
USING (true);

-- Create triggers for updated_at
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

-- Insert default home check template
INSERT INTO public.check_templates (name, description, type, is_default, created_by)
VALUES ('Default Home Check', 'Standard home inspection checklist', 'home_check', true, auth.uid());

-- Get the template ID for sections
DO $$
DECLARE
  template_id UUID;
  exterior_section_id UUID;
  entry_section_id UUID;
  interior_section_id UUID;
  final_section_id UUID;
BEGIN
  SELECT id INTO template_id FROM public.check_templates WHERE type = 'home_check' AND is_default = true LIMIT 1;
  
  -- Insert sections
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Exterior', 'External property inspection', 1, 'Home')
  RETURNING id INTO exterior_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Entry & Security', 'Entry points and security features', 2, 'Shield')
  RETURNING id INTO entry_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Interior', 'Internal property inspection', 3, 'Building')
  RETURNING id INTO interior_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Final Steps', 'Completion and documentation', 4, 'CheckCircle')
  RETURNING id INTO final_section_id;
  
  -- Insert exterior items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (exterior_section_id, 'Check front yard and landscaping', true, 1),
    (exterior_section_id, 'Inspect exterior walls and siding', true, 2),
    (exterior_section_id, 'Check roof condition (visible areas)', true, 3),
    (exterior_section_id, 'Inspect gutters and downspouts', false, 4),
    (exterior_section_id, 'Check walkways and driveway', true, 5),
    (exterior_section_id, 'Inspect outdoor lighting', false, 6),
    (exterior_section_id, 'Check mailbox and address numbers', true, 7),
    (exterior_section_id, 'Inspect deck/patio areas', false, 8);
  
  -- Insert entry & security items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (entry_section_id, 'Check all exterior doors', true, 1),
    (entry_section_id, 'Test door locks and security', true, 2),
    (entry_section_id, 'Inspect windows and screens', true, 3),
    (entry_section_id, 'Check garage door operation', false, 4),
    (entry_section_id, 'Test security system (if applicable)', false, 5),
    (entry_section_id, 'Check outdoor cameras/lighting', false, 6);
  
  -- Insert interior items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (interior_section_id, 'Check all rooms for issues', true, 1),
    (interior_section_id, 'Test plumbing fixtures', true, 2),
    (interior_section_id, 'Check electrical outlets and lighting', true, 3),
    (interior_section_id, 'Inspect HVAC system operation', true, 4),
    (interior_section_id, 'Check for signs of pests or damage', true, 5),
    (interior_section_id, 'Test smoke and carbon monoxide detectors', true, 6),
    (interior_section_id, 'Check appliances (if included)', false, 7),
    (interior_section_id, 'Inspect flooring condition', false, 8);
  
  -- Insert final steps items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (final_section_id, 'Take photos of any issues found', true, 1),
    (final_section_id, 'Document weather conditions', true, 2),
    (final_section_id, 'Complete general notes', true, 3),
    (final_section_id, 'Submit the inspection report', true, 4);
END $$;

-- Insert default property check template
INSERT INTO public.check_templates (name, description, type, is_default, created_by)
VALUES ('Default Property Check', 'Comprehensive property inspection checklist', 'property_check', true, auth.uid());

-- Insert property check sections and items
DO $$
DECLARE
  template_id UUID;
  exterior_section_id UUID;
  interior_section_id UUID;
  security_section_id UUID;
  utilities_section_id UUID;
  summary_section_id UUID;
BEGIN
  SELECT id INTO template_id FROM public.check_templates WHERE type = 'property_check' AND is_default = true LIMIT 1;
  
  -- Insert sections
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Exterior', 'External property assessment', 1, 'Home')
  RETURNING id INTO exterior_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Interior', 'Internal property assessment', 2, 'Building')
  RETURNING id INTO interior_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Security', 'Security systems and access', 3, 'Shield')
  RETURNING id INTO security_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Utilities', 'Utilities and systems check', 4, 'Zap')
  RETURNING id INTO utilities_section_id;
  
  INSERT INTO public.check_template_sections (template_id, name, description, sort_order, icon)
  VALUES 
    (template_id, 'Summary', 'Final inspection summary', 5, 'FileText')
  RETURNING id INTO summary_section_id;
  
  -- Insert exterior items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (exterior_section_id, 'Overall property condition assessment', true, 1),
    (exterior_section_id, 'Roof and gutters inspection', true, 2),
    (exterior_section_id, 'Siding and exterior walls check', true, 3),
    (exterior_section_id, 'Foundation inspection', true, 4),
    (exterior_section_id, 'Landscaping and yard maintenance', false, 5),
    (exterior_section_id, 'Driveway and walkway condition', false, 6),
    (exterior_section_id, 'Outdoor fixtures and lighting', false, 7);
  
  -- Insert interior items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (interior_section_id, 'General cleanliness and condition', true, 1),
    (interior_section_id, 'Flooring condition throughout', true, 2),
    (interior_section_id, 'Wall and ceiling inspection', true, 3),
    (interior_section_id, 'Kitchen appliances and fixtures', true, 4),
    (interior_section_id, 'Bathroom fixtures and plumbing', true, 5),
    (interior_section_id, 'Windows and doors operation', true, 6),
    (interior_section_id, 'HVAC system functionality', true, 7);
  
  -- Insert security items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (security_section_id, 'Door locks and entry security', true, 1),
    (security_section_id, 'Window locks and security', true, 2),
    (security_section_id, 'Alarm system functionality', false, 3),
    (security_section_id, 'Security cameras operation', false, 4),
    (security_section_id, 'Garage door and remote access', false, 5);
  
  -- Insert utilities items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (utilities_section_id, 'Electrical systems and outlets', true, 1),
    (utilities_section_id, 'Plumbing and water pressure', true, 2),
    (utilities_section_id, 'HVAC operation and filters', true, 3),
    (utilities_section_id, 'Water heater functionality', true, 4),
    (utilities_section_id, 'Smoke and CO detectors', true, 5),
    (utilities_section_id, 'Internet and cable connections', false, 6);
  
  -- Insert summary items
  INSERT INTO public.check_template_items (section_id, item, is_required, sort_order)
  VALUES 
    (summary_section_id, 'Document all findings with photos', true, 1),
    (summary_section_id, 'Complete overall condition assessment', true, 2),
    (summary_section_id, 'Prepare recommendations for improvements', false, 3),
    (summary_section_id, 'Submit comprehensive report', true, 4);
END $$;