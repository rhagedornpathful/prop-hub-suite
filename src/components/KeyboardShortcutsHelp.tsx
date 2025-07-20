import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp = ({ shortcuts, isOpen, onClose }: KeyboardShortcutsHelpProps) => {
  const formatKey = (shortcut: KeyboardShortcut) => {
    const keys = [];
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      keys.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.altKey) {
      keys.push('Alt');
    }
    if (shortcut.shiftKey) {
      keys.push('Shift');
    }
    keys.push(shortcut.key.toUpperCase());
    
    return keys;
  };

  // Group shortcuts by section
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const section = shortcut.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([section, sectionShortcuts]) => (
              <div key={section}>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  {section}
                </h3>
                <div className="space-y-2">
                  {sectionShortcuts.map((shortcut, index) => (
                    <div key={`${section}-${index}`} className="flex items-center justify-between py-2">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {formatKey(shortcut).map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <Badge 
                              variant="outline" 
                              className="font-mono text-xs px-2 py-1 min-w-[28px] justify-center"
                            >
                              {key}
                            </Badge>
                            {keyIndex < formatKey(shortcut).length - 1 && (
                              <span className="mx-1 text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {section !== Object.keys(groupedShortcuts)[Object.keys(groupedShortcuts).length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Show/hide this help</span>
                <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                  ?
                </Badge>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;