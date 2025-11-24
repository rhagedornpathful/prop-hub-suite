/**
 * Media Gallery Bottom Sheet
 * Shows captured media with ability to assign to checklist items
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Video, Image as ImageIcon, Trash2 } from 'lucide-react';
import { type MediaResult } from '@/utils/camera';

interface MediaItem extends MediaResult {
  id: string;
  timestamp: Date;
  assignedTo?: string; // Item ID
}

interface MediaGallerySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem[];
  onDeleteMedia: (id: string) => void;
  onAssignMedia: (mediaId: string, itemId: string) => void;
}

export function MediaGallerySheet({
  open,
  onOpenChange,
  media,
  onDeleteMedia,
  onAssignMedia,
}: MediaGallerySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>Captured Media</SheetTitle>
          <SheetDescription>
            {media.length} item{media.length !== 1 ? 's' : ''} captured
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(60vh-120px)] mt-4">
          <div className="grid grid-cols-2 gap-3">
            {media.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {item.type === 'photo' ? (
                    <img
                      src={item.dataUrl}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={item.dataUrl}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      {item.duration && (
                        <Badge className="absolute bottom-2 right-2" variant="secondary">
                          {Math.round(item.duration)}s
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDeleteMedia(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Type indicator */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    {item.type === 'photo' ? (
                      <ImageIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <Video className="h-3 w-3 mr-1" />
                    )}
                    {item.type}
                  </Badge>
                </div>

                {/* Assignment status */}
                {item.assignedTo && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="text-xs">
                      Assigned
                    </Badge>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground mt-1">
                  {item.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>

          {media.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No media captured yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the camera button to capture photos or videos
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
