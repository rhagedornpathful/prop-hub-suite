import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { takePhoto, selectPhoto } from "@/utils/camera";

interface HomeCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
  issuesFound?: boolean;
}

interface HomeCheckItemCardProps {
  item: HomeCheckItem;
  onToggle: (itemId: number) => void;
  onNotesChange: (itemId: number, notes: string) => void;
  onPhotosUpdate: (itemId: number, photos: string[]) => void;
}

export const HomeCheckItemCard = ({ 
  item, 
  onToggle, 
  onNotesChange, 
  onPhotosUpdate 
}: HomeCheckItemCardProps) => {
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
      const filePath = `home-checks/${fileName}`;

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
      const filePath = `home-checks/${fileName}`;

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

  const hasIssue = item.issuesFound || (item.notes && item.notes.toLowerCase().includes('issue'));

  return (
    <div className={`border rounded-lg p-4 space-y-3 transition-colors ${
      item.completed ? 'border-success/30 bg-success/5' : 'border-border'
    }`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`item-${item.id}`}
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1"
        />
        <div className="flex-1">
          <label 
            htmlFor={`item-${item.id}`} 
            className={`text-sm font-medium cursor-pointer ${
              item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {item.item}
            {item.required && <span className="text-destructive ml-1">*</span>}
          </label>
          
          {/* Photo Section */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isUploading}
                className="flex items-center gap-1"
              >
                {isUploading ? (
                  <Upload className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
                {isUploading ? 'Uploading...' : 'Take Photo'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleGallerySelect}
                disabled={isUploading}
                className="flex items-center gap-1"
              >
                <ImageIcon className="h-3 w-3" />
                Gallery
              </Button>
              
              {item.photos.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Photo Grid */}
            {item.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {item.photos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-[4/3] relative overflow-hidden rounded border bg-muted">
                      <img
                        src={photoUrl}
                        alt={`${item.item} photo ${index + 1}`}
                        className="w-full h-full object-contain hover:object-cover transition-all duration-200 cursor-pointer"
                        loading="lazy"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(photoUrl)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-3">
            <Textarea
              placeholder="Add notes or observations..."
              value={item.notes}
              onChange={(e) => onNotesChange(item.id, e.target.value)}
              className="min-h-[60px] text-sm"
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
