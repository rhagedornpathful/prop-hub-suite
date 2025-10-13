import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MediaPreviewProps {
  url: string;
  type: 'image' | 'video' | 'audio';
  fileName?: string;
  onRemove?: () => void;
  onDownload?: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  url,
  type,
  fileName,
  onRemove,
  onDownload,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <>
      <Card className="relative overflow-hidden group">
        {type === 'image' && (
          <div className="relative">
            <img 
              src={url} 
              alt={fileName || 'Image preview'} 
              className="w-full h-auto max-h-96 object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={() => setIsExpanded(true)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {onDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {type === 'video' && (
          <video 
            src={url} 
            controls 
            className="w-full max-h-96 rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {type === 'audio' && (
          <div className="p-4">
            <audio src={url} controls className="w-full">
              Your browser does not support the audio element.
            </audio>
            {fileName && (
              <p className="text-sm text-muted-foreground mt-2">{fileName}</p>
            )}
          </div>
        )}

        {onRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </Card>

      {isExpanded && type === 'image' && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/20"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img 
            src={url} 
            alt={fileName || 'Image preview'} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};
