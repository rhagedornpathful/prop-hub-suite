import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    section: "Navigation",
    items: [
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show/hide this help" },
    ]
  },
  {
    section: "Quick Actions", 
    items: [
      { keys: ["Ctrl", "N"], description: "Add new property" },
      { keys: ["Ctrl", "T"], description: "Add new tenant" },
      { keys: ["Ctrl", "M"], description: "Schedule maintenance" },
    ]
  },
  {
    section: "General",
    items: [
      { keys: ["Esc"], description: "Close dialogs and menus" },
      { keys: ["Tab"], description: "Navigate between elements" },
      { keys: ["Enter"], description: "Confirm actions" },
    ]
  }
];

const KeyBadge = ({ keys }: { keys: string[] }) => (
  <div className="flex items-center gap-1">
    {keys.map((key, index) => (
      <motion.span
        key={index}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <Badge 
          variant="outline" 
          className="px-2 py-1 text-xs font-mono bg-muted/50"
        >
          {key}
        </Badge>
        {index < keys.length - 1 && (
          <span className="text-muted-foreground mx-1">+</span>
        )}
      </motion.span>
    ))}
  </div>
);

export function KeyboardShortcutsHelp({ isOpen, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </DialogTitle>
                <DialogDescription>
                  Use these keyboard shortcuts to navigate and perform actions quickly.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {shortcuts.map((section, sectionIndex) => (
                  <motion.div
                    key={section.section}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                  >
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                      {section.section}
                    </h3>
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm">{item.description}</span>
                          <KeyBadge keys={item.keys} />
                        </motion.div>
                      ))}
                    </div>
                    {sectionIndex < shortcuts.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Command className="h-4 w-4" />
                  <span>
                    Tip: Press <Badge variant="outline" className="mx-1 px-2 py-0.5 text-xs">?</Badge> 
                    anytime to toggle this help panel
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}