import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
  } | null;
  onDownload: () => void;
}

export function DocumentPreviewDialog({ 
  open, 
  onOpenChange, 
  document,
  onDownload 
}: DocumentPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!document || !open) {
      setPreviewUrl(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoading(true);
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          'https://nhjsxtwuweegqcexakoz.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk'
        );

        const { data } = await supabase.storage
          .from('documents')
          .download(document.file_path);

        if (data) {
          const url = URL.createObjectURL(data);
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error('Failed to load preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document, open]);

  if (!document) return null;

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <FileText className="w-16 h-16 mb-4" />
          <p>Preview not available</p>
        </div>
      );
    }

    // Image preview
    if (document.file_type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg">
          <img 
            src={previewUrl} 
            alt={document.file_name}
            className="max-w-full max-h-[600px] object-contain"
          />
        </div>
      );
    }

    // PDF preview
    if (document.file_type === 'application/pdf') {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[600px] rounded-lg border"
          title={document.file_name}
        />
      );
    }

    // Text file preview
    if (document.file_type.startsWith('text/')) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[600px] rounded-lg border bg-background p-4"
          title={document.file_name}
        />
      );
    }

    // Fallback for unsupported types
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        <FileText className="w-16 h-16 mb-4" />
        <p className="mb-4">Preview not available for this file type</p>
        <Button onClick={onDownload}>Download to view</Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-8">{document.file_name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
