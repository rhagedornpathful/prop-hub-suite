-- Add expiry tracking to documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS expiry_reminder_sent boolean DEFAULT false;

-- Create document_versions table for version control
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  uploaded_by uuid NOT NULL,
  change_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- Create document_activities table for audit trail
CREATE TABLE IF NOT EXISTS public.document_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create document_signatures table for e-signature tracking
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  signer_email text NOT NULL,
  signer_name text NOT NULL,
  signer_user_id uuid,
  signature_data text,
  signature_image_url text,
  ip_address inet,
  signed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  reminder_sent_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_versions
CREATE POLICY "Users can view versions of accessible documents"
ON public.document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND (d.user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'property_manager'))
  )
);

CREATE POLICY "Users can create versions of their documents"
ON public.document_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND (d.user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'property_manager'))
  )
);

-- RLS policies for document_activities
CREATE POLICY "Users can view activities of accessible documents"
ON public.document_activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_activities.document_id
    AND (d.user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'property_manager'))
  )
);

CREATE POLICY "System can insert document activities"
ON public.document_activities FOR INSERT
WITH CHECK (true);

-- RLS policies for document_signatures
CREATE POLICY "Users can view signatures for their documents"
ON public.document_signatures FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_signatures.document_id
    AND (d.user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'property_manager'))
  )
  OR signer_user_id = auth.uid()
  OR signer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Users can request signatures for their documents"
ON public.document_signatures FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_signatures.document_id
    AND (d.user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'property_manager'))
  )
);

CREATE POLICY "Signers can update their signature status"
ON public.document_signatures FOR UPDATE
USING (
  signer_user_id = auth.uid()
  OR signer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage all signatures"
ON public.document_signatures FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_document_versions_updated_at
BEFORE UPDATE ON public.document_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_activities_document_id ON public.document_activities(document_id);
CREATE INDEX idx_document_activities_created_at ON public.document_activities(created_at DESC);
CREATE INDEX idx_document_signatures_document_id ON public.document_signatures(document_id);
CREATE INDEX idx_document_signatures_status ON public.document_signatures(status);
CREATE INDEX idx_documents_expiry_date ON public.documents(expiry_date) WHERE expiry_date IS NOT NULL;