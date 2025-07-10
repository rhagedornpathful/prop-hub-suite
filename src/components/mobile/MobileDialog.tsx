import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = ""
}: MobileDialogProps) {
  const { isMobile } = useMobileDetection();

  React.useEffect(() => {
    if (open && isMobile) {
      // Prevent body scroll when modal is open on mobile
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open, isMobile]);

  if (!isMobile) {
    return null; // Use regular Dialog component for desktop
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          
          {/* Mobile Dialog */}
          <motion.div
            className={`relative flex flex-col bg-card rounded-t-xl shadow-xl mt-auto max-h-[90vh] ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle bar for visual indication */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-muted rounded-full" />
            </div>
            
            {/* Header */}
            {(title || description) && (
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    {title && (
                      <h2 className="text-lg font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Content */}
            <ScrollArea className="flex-1 px-6 py-4">
              {children}
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}