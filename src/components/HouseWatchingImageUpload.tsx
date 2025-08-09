import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera } from 'lucide-react';

interface HouseWatchingImageUploadProps {
  propertyId: string;
  currentImage?: string;
  onImageUpdate?: (imageUrl: string) => void;
}

export const HouseWatchingImageUpload: React.FC<HouseWatchingImageUploadProps> = ({
  propertyId,
  currentImage,
  onImageUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(currentImage || '');
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hw-${propertyId}-${Date.now()}.${fileExt}`;
      const filePath = `house-watching/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      setLocalImage(publicUrl);
      onImageUpdate?.(publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "House watching property image has been updated.",
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
    setLocalImage('');
    onImageUpdate?.('');
    
    toast({
      title: "Image removed",
      description: "House watching property image has been removed.",
    });
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
      {localImage ? (
        <div className="relative group image-wrapper aspect-photo">
          <img 
            src={localImage} 
            alt="House Watching Property" 
            className="responsive-image-fill lazy-image rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            onLoad={(e) => e.currentTarget.classList.add('loaded')}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center space-x-2">
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
                className="touch-target"
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
              className="touch-target"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-t-lg flex items-center justify-center bg-muted/10 touch-target aspect-photo">
          <label className="cursor-pointer flex flex-col items-center space-y-2 touch-target p-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-base text-muted-foreground text-center">
              {uploading ? 'Uploading...' : 'Upload Property Image'}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};