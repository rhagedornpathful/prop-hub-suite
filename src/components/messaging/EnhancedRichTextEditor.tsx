import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Paperclip,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFileSelect?: (files: FileList) => void;
  onImagePaste?: (file: File) => void;
  onVoiceRecord?: () => void;
  placeholder?: string;
  minRows?: number;
}

export const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
  value,
  onChange,
  onFileSelect,
  onImagePaste,
  onVoiceRecord,
  placeholder = "Type your message...",
  minRows = 3,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    let newText = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        newText = `${value.substring(0, start)}**${textToInsert}**${value.substring(end)}`;
        cursorOffset = start + 2;
        break;
      case 'italic':
        newText = `${value.substring(0, start)}*${textToInsert}*${value.substring(end)}`;
        cursorOffset = start + 1;
        break;
      case 'code':
        newText = `${value.substring(0, start)}\`${textToInsert}\`${value.substring(end)}`;
        cursorOffset = start + 1;
        break;
      case 'codeblock':
        newText = `${value.substring(0, start)}\n\`\`\`\n${textToInsert}\n\`\`\`\n${value.substring(end)}`;
        cursorOffset = start + 5;
        break;
      case 'link':
        newText = `${value.substring(0, start)}[${textToInsert}](url)${value.substring(end)}`;
        cursorOffset = start + textToInsert.length + 3;
        break;
      case 'bullet':
        newText = `${value.substring(0, start)}\n- ${textToInsert}${value.substring(end)}`;
        cursorOffset = start + 3;
        break;
      case 'numbered':
        newText = `${value.substring(0, start)}\n1. ${textToInsert}${value.substring(end)}`;
        cursorOffset = start + 4;
        break;
      case 'quote':
        newText = `${value.substring(0, start)}\n> ${textToInsert}${value.substring(end)}`;
        cursorOffset = start + 3;
        break;
      default:
        return;
    }

    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorOffset, cursorOffset);
    }, 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file && onImagePaste) {
          onImagePaste(file);
        }
        break;
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onFileSelect) {
      onFileSelect(files);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('bold', 'bold text')}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('italic', 'italic text')}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('code', 'code')}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline Code</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('bullet', 'list item')}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('numbered', 'list item')}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('quote', 'quoted text')}
              >
                <Quote className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertMarkdown('link', 'link text')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {onFileSelect && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleFileClick}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach File</TooltipContent>
              </Tooltip>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}

          {onVoiceRecord && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onVoiceRecord}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice Message</TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="border-0 focus-visible:ring-0 resize-none"
        rows={minRows}
      />
    </div>
  );
};
