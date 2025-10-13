import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
  onFilesDropped: (files: FileList) => void;
  children: React.ReactNode;
  className?: string;
  accept?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesDropped,
  children,
  className,
  accept,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  return (
    <div
      className={cn("relative", className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-foreground">Drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Release to upload files
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
