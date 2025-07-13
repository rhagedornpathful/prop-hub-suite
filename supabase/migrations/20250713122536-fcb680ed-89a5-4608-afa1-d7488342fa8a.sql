-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for property image uploads
CREATE POLICY "Anyone can view property images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their property images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their property images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');