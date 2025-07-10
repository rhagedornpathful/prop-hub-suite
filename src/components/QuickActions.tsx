import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar } from "lucide-react";

interface QuickActionsProps {
  onAddProperty: () => void;
  onAddTenant: () => void;
  onScheduleMaintenance: () => void;
}

export function QuickActions({ 
  onAddProperty, 
  onAddTenant, 
  onScheduleMaintenance 
}: QuickActionsProps) {
  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault();
          onAddProperty();
          break;
        case 't':
          event.preventDefault();
          onAddTenant();
          break;
        case 'm':
          event.preventDefault();
          onScheduleMaintenance();
          break;
      }
    }
  }, [onAddProperty, onAddTenant, onScheduleMaintenance]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="bg-gradient-primary hover:bg-primary-dark transition-all duration-200"
            onClick={onAddProperty}
            aria-label="Add new property (Ctrl+N)"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
            <span className="hidden sm:inline text-xs ml-2 opacity-70">Ctrl+N</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline"
            onClick={onAddTenant}
            className="transition-all duration-200"
            aria-label="Add new tenant (Ctrl+T)"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Tenant
            <span className="hidden sm:inline text-xs ml-2 opacity-70">Ctrl+T</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline"
            onClick={onScheduleMaintenance}
            className="transition-all duration-200"
            aria-label="Schedule maintenance (Ctrl+M)"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Maintenance
            <span className="hidden sm:inline text-xs ml-2 opacity-70">Ctrl+M</span>
          </Button>
        </motion.div>
      </div>
      
      {/* Keyboard shortcuts help text */}
      <div className="text-xs text-muted-foreground mb-4 hidden sm:block">
        💡 Tip: Use keyboard shortcuts for quick actions. Press ? for help.
      </div>
    </motion.div>
  );
}