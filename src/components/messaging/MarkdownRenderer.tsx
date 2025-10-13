import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  // Simple markdown parsing - bold, italic, code, links, lists
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    lines.forEach((line, lineIndex) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${lineIndex}`} className="bg-muted p-3 rounded-md overflow-x-auto my-2">
              <code className="text-sm font-mono">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          codeBlockLang = line.substring(3).trim();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={lineIndex} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>);
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={lineIndex} className="text-xl font-semibold mt-4 mb-2">{line.substring(3)}</h2>);
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(<h1 key={lineIndex} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>);
        return;
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={lineIndex} className="ml-4">
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
        return;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={lineIndex} className="border-l-4 border-primary pl-4 my-2 italic text-muted-foreground">
            {parseInlineMarkdown(line.substring(2))}
          </blockquote>
        );
        return;
      }

      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <p key={lineIndex} className="my-1">
            {parseInlineMarkdown(line)}
          </p>
        );
      } else {
        elements.push(<br key={lineIndex} />);
      }
    });

    return elements;
  };

  const parseInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
      if (boldMatch) {
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch[0].length);
        continue;
      }

      // Italic *text*
      const italicMatch = remaining.match(/^\*(.*?)\*/);
      if (italicMatch) {
        parts.push(<em key={key++}>{italicMatch[1]}</em>);
        remaining = remaining.substring(italicMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/^`(.*?)`/);
      if (codeMatch) {
        parts.push(
          <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch[0].length);
        continue;
      }

      // Links [text](url)
      const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        parts.push(
          <a 
            key={key++} 
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkMatch[0].length);
        continue;
      }

      // Regular text
      parts.push(remaining[0]);
      remaining = remaining.substring(1);
    }

    return parts;
  };

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      {parseMarkdown(content)}
    </div>
  );
};
