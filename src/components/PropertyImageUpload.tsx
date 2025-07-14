import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera } from 'lucide-react';
import { useUpdateProperty } from '@/hooks/queries/useProperties';

interface PropertyImageUploadProps {
  propertyId: string;
  currentImage?: string;
  onImageUpdate?: (imageUrl: string) => void;
}

export const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  propertyId,
  currentImage,
  onImageUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const updateProperty = useUpdateProperty();

  const uploadImage = async (file: File) => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      console.log('🖼️ Uploading image for property:', propertyId);
      console.log('🔗 Image URL:', publicUrl);

      // Update property with new image
      const result = await updateProperty.mutateAsync({
        id: propertyId,
        updates: {
          images: [publicUrl]
        }
      });
      
      console.log('✅ Property updated with image:', result);

      onImageUpdate?.(publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Property image has been updated.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        updates: {
          images: []
        }
      });

      onImageUpdate?.('');
      
      toast({
        title: "Image removed",
        description: "Property image has been removed.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      uploadImage(file);
    }
  };

  return (
    <div className="relative">
      {currentImage ? (
        <div className="relative group">
          <img 
            src={currentImage} 
            alt="Property" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <Button 
                size="sm" 
                variant="secondary"
                disabled={uploading}
                asChild
              >
                <span>
                  <Camera className="w-4 h-4 mr-2" />
                  Change
                </span>
              </Button>
            </label>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
          <label className="cursor-pointer flex flex-col items-center space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? 'Uploading...' : 'Upload Property Image'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};