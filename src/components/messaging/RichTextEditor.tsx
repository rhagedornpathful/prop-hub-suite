import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Paperclip,
  Smile,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUploadAttachment } from '@/hooks/queries/useEnterpriseMessaging';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  showFormatting?: boolean;
  allowAttachments?: boolean;
  mentionUsers?: Array<{ id: string; username: string; name: string }>;
}

const EMOJI_SHORTCUTS = [
  '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', 
  '🔥', '💯', '😢', '😡', '🤷‍♂️', '🙏', '✅', '❌'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  showFormatting = true,
  allowAttachments = true,
  mentionUsers = []
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const uploadAttachment = useUploadAttachment();

  const insertFormatting = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      onSend();
      return;
    }

    // Handle @ mentions
    if (e.key === '@') {
      setShowMentions(true);
      setMentionFilter('');
    }

    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertFormatting('**');
          break;
        case 'i':
          e.preventDefault();
          insertFormatting('*');
          break;
        case 'u':
          e.preventDefault();
          insertFormatting('<u>', '</u>');
          break;
        case 'Enter':
          e.preventDefault();
          onSend();
          break;
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const url = await uploadAttachment.mutateAsync(file);
        const attachmentText = file.type.startsWith('image/') 
          ? `![${file.name}](${url})`
          : `[${file.name}](${url})`;
        insertText(attachmentText);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
    
    // Reset file input
    event.target.value = '';
  };

  const insertMention = (user: { id: string; username: string; name: string }) => {
    insertText(`@${user.username} `);
    setShowMentions(false);
  };

  const filteredMentionUsers = mentionUsers.filter(user => 
    user.username.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    user.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('**')}
                  disabled={disabled}
                >
                  <Bold className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Bold (Ctrl+B)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('*')}
                  disabled={disabled}
                >
                  <Italic className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Italic (Ctrl+I)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('<u>', '</u>')}
                  disabled={disabled}
                >
                  <Underline className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Underline (Ctrl+U)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-4 bg-border mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('- ', '')}
                  disabled={disabled}
                >
                  <List className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Bullet List</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('1. ', '')}
                  disabled={disabled}
                >
                  <ListOrdered className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Numbered List</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('> ', '')}
                  disabled={disabled}
                >
                  <Quote className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Quote</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => insertFormatting('`')}
                  disabled={disabled}
                >
                  <Code className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Code</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1" />

          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={disabled}
              >
                <Smile className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_SHORTCUTS.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg"
                    onClick={() => {
                      insertText(emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* File Attachment */}
          {allowAttachments && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || uploadAttachment.isPending}
                    >
                      <Paperclip className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Attach Files</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      )}

      {/* Text Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-24 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Send Button */}
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          size="sm"
          className="absolute bottom-2 right-2 h-8 w-8 p-0"
        >
          <Send className="h-3 w-3" />
        </Button>

        {/* Mentions Dropdown */}
        {showMentions && filteredMentionUsers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {filteredMentionUsers.slice(0, 5).map((user) => (
              <button
                key={user.id}
                className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2"
                onClick={() => insertMention(user)}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-muted-foreground">@{user.username}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};