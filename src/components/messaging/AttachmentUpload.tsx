import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, File, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttachmentFile {
  id: string;
  file: File;
  preview?: string;
  uploadProgress: number;
  uploaded: boolean;
}

interface AttachmentUploadProps {
  messageId?: string;
  onAttachmentsChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  messageId,
  onAttachmentsChange,
  maxFiles = 10,
  maxSizeMB = 20
}) => {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (attachments.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files`,
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    const newAttachments: AttachmentFile[] = files.map(file => ({
      id: Math.random().toString(36),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadProgress: 0,
      uploaded: false
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    onAttachmentsChange?.(files);

    // If messageId exists, upload immediately
    if (messageId) {
      await uploadFiles(newAttachments, messageId);
    }
  };

  const uploadFiles = async (files: AttachmentFile[], msgId: string) => {
    setIsUploading(true);

    for (const attachment of files) {
      try {
        const filePath = `messages/${msgId}/${attachment.id}-${attachment.file.name}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, attachment.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Create attachment record
        const { error: dbError } = await supabase
          .from('message_attachments')
          .insert({
            message_id: msgId,
            file_name: attachment.file.name,
            file_path: filePath,
            file_type: attachment.file.type,
            file_size: attachment.file.size,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) throw dbError;

        // Update progress
        setAttachments(prev => prev.map(a => 
          a.id === attachment.id ? { ...a, uploadProgress: 100, uploaded: true } : a
        ));

      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${attachment.file.name}`,
          variant: "destructive"
        });
      }
    }

    setIsUploading(false);
  };

  const removeAttachment = (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachments(prev => prev.filter(a => a.id !== id));
    onAttachmentsChange?.(attachments.filter(a => a.id !== id).map(a => a.file));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || attachments.length >= maxFiles}
      >
        <Paperclip className="h-4 w-4 mr-2" />
        Attach Files
      </Button>

      {attachments.length > 0 && (
        <div className="space-y-2 mt-3">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center gap-2 p-2 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0">
                {attachment.preview ? (
                  <img src={attachment.preview} alt="" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                    {getFileIcon(attachment.file.type)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.file.size / 1024).toFixed(1)} KB
                </p>
                {attachment.uploadProgress > 0 && attachment.uploadProgress < 100 && (
                  <Progress value={attachment.uploadProgress} className="h-1 mt-1" />
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
