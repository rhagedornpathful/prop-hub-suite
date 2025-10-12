import { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Global keyboard shortcuts help trigger
 * Shows a floating help button and responds to ? or Ctrl+/ to open shortcuts dialog
 */
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open on ? key or Ctrl+/
      if (
        (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === '/')
      ) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-4 z-40 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 screen-only"
            aria-label="Keyboard shortcuts (press ? to open)"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="font-medium">Keyboard Shortcuts</p>
          <p className="text-xs text-muted-foreground">Press <kbd className="px-1 bg-muted rounded">?</kbd> to open</p>
        </TooltipContent>
      </Tooltip>

      <KeyboardShortcutsDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

export default KeyboardShortcutsHelp;
