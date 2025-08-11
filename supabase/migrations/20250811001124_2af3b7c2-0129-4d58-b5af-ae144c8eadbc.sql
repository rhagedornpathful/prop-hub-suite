-- ROLE AUDIT: Create missing vendor role and update RLS policies
-- First, check if vendor role exists, if not add it
DO $$
BEGIN
    -- Add vendor role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vendor' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'vendor';
    END IF;
    
    -- Add property_owner role if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'property_owner' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'property_owner';
    END IF;
END $$;

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    business_license TEXT,
    insurance_info TEXT,
    specialties TEXT[],
    service_areas TEXT[],
    hourly_rate NUMERIC,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors table
DROP POLICY IF EXISTS "Admins can manage all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Property managers can manage vendors" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can manage their own profile" ON public.vendors;

CREATE POLICY "Admins can manage all vendors" ON public.vendors
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Property managers can manage vendors" ON public.vendors
FOR ALL USING (has_role(auth.uid(), 'property_manager'::app_role));

CREATE POLICY "Vendors can manage their own profile" ON public.vendors
FOR ALL USING (user_id = auth.uid());

-- AUDIT RLS POLICIES: Ensure no role can access admin-only data
-- Check conversation_participants table RLS
DROP POLICY IF EXISTS "Users can only participate in their conversations" ON conversation_participants;
CREATE POLICY "Users can only participate in their conversations" ON conversation_participants
FOR ALL USING (
    user_id = auth.uid() OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role)
);

-- Ensure vendor work orders are properly restricted
DROP POLICY IF EXISTS "Vendors can only see their assigned work orders" ON vendor_work_orders;
CREATE POLICY "Vendors can only see their assigned work orders" ON vendor_work_orders
FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role)
);

-- Create vendor_reviews table if not exists for vendor rating system
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES public.vendor_work_orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(vendor_id, work_order_id)
);

-- Enable RLS on vendor_reviews
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vendor reviews" ON public.vendor_reviews
FOR SELECT USING (true);

CREATE POLICY "Admins and property managers can manage reviews" ON public.vendor_reviews
FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'property_manager'::app_role)
);

CREATE POLICY "Users can create reviews for completed work" ON public.vendor_reviews
FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM vendor_work_orders 
        WHERE id = work_order_id AND status = 'completed'
    )
);