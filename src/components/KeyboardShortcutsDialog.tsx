import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useEnhancedKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const { getShortcutsByCategory, formatShortcut } = useEnhancedKeyboardShortcuts();
  const shortcutsByCategory = getShortcutsByCategory();

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    dialogs: 'Dialogs',
    general: 'General',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => {
            if (shortcuts.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="font-semibold mb-3">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="secondary" className="font-mono">
                        {formatShortcut(shortcut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            Tip: Press <Badge variant="outline" className="mx-1 font-mono">Ctrl + /</Badge> anywhere to see this help dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
