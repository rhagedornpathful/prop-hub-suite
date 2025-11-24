import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera,
  AlertCircle,
  X,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { takePhoto, selectPhoto } from "@/utils/camera";

interface PropertyCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
}

interface PropertyCheckItemCardProps {
  item: PropertyCheckItem;
  onToggle: (itemId: number) => void;
  onNotesChange: (itemId: number, notes: string) => void;
  onPhotosUpdate: (itemId: number, photos: string[]) => void;
}

export const PropertyCheckItemCard = ({ 
  item, 
  onToggle, 
  onNotesChange, 
  onPhotosUpdate 
}: PropertyCheckItemCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleCameraCapture = async () => {
    const result = await takePhoto();
    
    if (!result) return;

    setIsUploading(true);

    try {
      // Convert data URL to blob
      const response = await fetch(result.dataUrl);
      const blob = await response.blob();

      const fileName = `${Date.now()}.${result.format}`;
      const filePath = `property-checks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      const updatedPhotos = [...item.photos, publicUrl];
      onPhotosUpdate(item.id, updatedPhotos);

      toast({
        title: "Photo captured",
        description: "Photo has been successfully captured"
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGallerySelect = async () => {
    const result = await selectPhoto();
    
    if (!result) return;

    setIsUploading(true);

    try {
      // Convert data URL to blob
      const response = await fetch(result.dataUrl);
      const blob = await response.blob();

      const fileName = `${Date.now()}.${result.format}`;
      const filePath = `property-checks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      const updatedPhotos = [...item.photos, publicUrl];
      onPhotosUpdate(item.id, updatedPhotos);

      toast({
        title: "Photo uploaded",
        description: "Photo has been successfully uploaded"
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    const updatedPhotos = item.photos.filter(photo => photo !== photoUrl);
    onPhotosUpdate(item.id, updatedPhotos);
  };

  const hasIssue = item.notes && item.notes.toLowerCase().includes('issue');

  return (
    <div className={`border rounded-xl p-4 space-y-4 transition-all duration-200 ${
      item.completed ? 'border-success/30 bg-success/5' : 'border-border'
    }`}>
      <div className="flex items-start gap-4">
        <Checkbox
          id={`item-${item.id}`}
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1 min-h-[20px] min-w-[20px]"
        />
        <div className="flex-1">
          <label 
            htmlFor={`item-${item.id}`} 
            className={`text-base font-medium cursor-pointer block leading-relaxed ${
              item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {item.item}
            {item.required && <span className="text-destructive ml-1">*</span>}
          </label>
          
          {/* Phone-Optimized Photo Section */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Button
                size="default"
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isUploading}
                className="flex-1 min-h-[48px] flex items-center gap-2 rounded-xl"
              >
                {isUploading ? (
                  <Upload className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isUploading ? 'Uploading...' : 'Take Photo'}
              </Button>
              
              <Button
                size="default"
                variant="outline"
                onClick={handleGallerySelect}
                disabled={isUploading}
                className="min-h-[48px] rounded-xl"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              {item.photos.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {item.photos.length}
                </Badge>
              )}
            </div>

            {/* Phone-Optimized Photo Grid */}
            {item.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {item.photos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative overflow-hidden rounded-xl border bg-muted">
                      <img
                        src={photoUrl}
                        alt={`${item.item} photo ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        loading="lazy"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                      onClick={() => handleRemovePhoto(photoUrl)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phone-Optimized Notes */}
          <div className="mt-4">
            <Textarea
              placeholder="Add notes or observations..."
              value={item.notes}
              onChange={(e) => onNotesChange(item.id, e.target.value)}
              className="min-h-[80px] text-base rounded-xl border-border focus:border-primary resize-none"
            />
          </div>
          
          {/* Issue Flag */}
          {hasIssue && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded border">
              <AlertCircle className="h-4 w-4" />
              <span>Issue flagged for review</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
