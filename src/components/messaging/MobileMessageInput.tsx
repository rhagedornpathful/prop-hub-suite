import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { useUploadAttachment } from '@/hooks/queries/useEnterpriseMessaging';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileMessageInputProps {
  onSendMessage: (content: string, attachments?: string[]) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export const MobileMessageInput: React.FC<MobileMessageInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const uploadAttachment = useUploadAttachment();

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;
    
    try {
      await onSendMessage(content, attachments.length > 0 ? attachments : undefined);
      setContent('');
      setAttachments([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadAttachment.mutateAsync(file);
      setAttachments(prev => [...prev, url]);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of ~6 lines
    textarea.style.height = `${newHeight}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((url, index) => (
            <div key={index} className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-xs">
              <Paperclip className="h-3 w-3" />
              <span>Attachment {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File Upload */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploadAttachment.isPending}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[36px] resize-none border-0 bg-accent text-sm focus-visible:ring-0"
            style={{ height: '36px' }}
          />
        </div>

        {/* Voice Recording (Mobile only) */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            disabled={disabled}
          >
            <Mic className={`h-4 w-4 ${isRecording ? 'text-destructive' : ''}`} />
          </Button>
        )}

        {/* Send Button */}
        <Button
          size="sm"
          className="h-9 w-9 p-0 flex-shrink-0"
          onClick={handleSend}
          disabled={disabled || (!content.trim() && attachments.length === 0)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
    </div>
  );
};