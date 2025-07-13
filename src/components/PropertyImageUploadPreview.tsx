import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera } from 'lucide-react';

interface PropertyImageUploadPreviewProps {
  images?: string[];
  onImagesChange?: (images: string[]) => void;
}

export const PropertyImageUploadPreview: React.FC<PropertyImageUploadPreviewProps> = ({
  images = [],
  onImagesChange
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate file sizes
      for (const file of fileArray) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB. Please select smaller images.`,
            variant: "destructive",
          });
          return;
        }
      }

      // Convert files to preview URLs
      const newImageUrls: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImageUrls.push(e.target.result as string);
            if (newImageUrls.length === fileArray.length) {
              // All files have been read
              const updatedImages = [...images, ...newImageUrls];
              onImagesChange?.(updatedImages);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange?.(updatedImages);
    
    toast({
      title: "Image removed",
      description: "Image has been removed from the preview.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image} 
                alt={`Property preview ${index + 1}`} 
                className="w-full h-32 object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
        <label className="cursor-pointer flex flex-col items-center space-y-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground text-center">
            {uploading ? 'Processing...' : 'Upload Property Images'}
            <br />
            <span className="text-xs">Click to select multiple images (Max 5MB each)</span>
          </span>
        </label>
      </div>
    </div>
  );
};