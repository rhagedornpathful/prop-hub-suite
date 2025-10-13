-- Create document folders table first
CREATE TABLE IF NOT EXISTS public.document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES public.document_folders(id) ON DELETE CASCADE,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'folder',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Now add folder support to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.document_folders(id) ON DELETE SET NULL;

-- Enable RLS on document_folders
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_folders
CREATE POLICY "Users can manage their own folders"
ON public.document_folders
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all folders"
ON public.document_folders
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Property managers can manage all folders"
ON public.document_folders
FOR ALL
USING (has_role(auth.uid(), 'property_manager'));

-- Add trigger for updated_at
CREATE TRIGGER update_document_folders_updated_at
BEFORE UPDATE ON public.document_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();