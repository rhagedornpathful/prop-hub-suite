/**
 * Quick Capture Button Component
 * Floating action button for quick photo/video capture during checks
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { takePhoto, selectPhoto, recordVideo, type MediaResult } from '@/utils/camera';
import { toast } from 'sonner';

interface QuickCaptureButtonProps {
  onCapture: (media: MediaResult) => void;
  className?: string;
}

export function QuickCaptureButton({ onCapture, className }: QuickCaptureButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      onCapture({
        ...result,
        type: 'photo'
      });
      toast.success('Photo captured!');
    }
    setIsOpen(false);
  };

  const handleSelectPhoto = async () => {
    const result = await selectPhoto();
    if (result) {
      onCapture({
        ...result,
        type: 'photo'
      });
      toast.success('Photo selected!');
    }
    setIsOpen(false);
  };

  const handleRecordVideo = async () => {
    const result = await recordVideo();
    if (result) {
      onCapture(result);
      toast.success('Video recorded!');
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-lg z-50",
            "hover:scale-110 transition-transform",
            className
          )}
        >
          <Camera className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTakePhoto} className="cursor-pointer">
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSelectPhoto} className="cursor-pointer">
          <Image className="h-4 w-4 mr-2" />
          Select from Gallery
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRecordVideo} className="cursor-pointer">
          <Video className="h-4 w-4 mr-2" />
          Record Video
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
