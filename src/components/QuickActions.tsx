import { useState } from 'react';
import { Plus, MessageSquare, Wrench, Home, Users, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface QuickActionsProps {
  onAddProperty: () => void;
  onAddTenant: () => void;
  onScheduleMaintenance: () => void;
  onOpenMessages?: () => void;
  onOpenDocuments?: () => void;
}

export const QuickActions = ({
  onAddProperty,
  onAddTenant, 
  onScheduleMaintenance,
  onOpenMessages,
  onOpenDocuments
}: QuickActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      icon: Home,
      label: 'Add Property',
      action: onAddProperty,
      shortcut: 'Ctrl+N',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Users,
      label: 'Add Tenant',
      action: onAddTenant,
      shortcut: 'Ctrl+T',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Wrench,
      label: 'Schedule Maintenance',
      action: onScheduleMaintenance,
      shortcut: 'Ctrl+M',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      action: onOpenMessages || (() => {}),
      shortcut: 'Ctrl+/',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: FileText,
      label: 'Documents',
      action: onOpenDocuments || (() => {}),
      shortcut: 'Ctrl+D',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  // Register keyboard shortcuts
  const shortcuts = actions.map(action => ({
    key: action.shortcut.split('+')[1].toLowerCase(),
    ctrlKey: action.shortcut.includes('Ctrl'),
    action: action.action,
    description: action.label,
    section: 'Quick Actions'
  }));

  useKeyboardShortcuts(shortcuts);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`flex flex-col-reverse items-end gap-3 transition-all duration-300 ${
          isExpanded ? 'mb-4' : 'mb-0'
        }`}>
          {/* Action buttons */}
          {isExpanded && actions.map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform ${
                    action.color
                  } text-white border-0 ${
                    isExpanded 
                      ? 'scale-100 opacity-100 translate-y-0' 
                      : 'scale-0 opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                  onClick={action.action}
                  aria-label={action.label}
                >
                  <action.icon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="mr-4">
                <div className="text-center">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.shortcut}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Main toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
                  isExpanded 
                    ? 'bg-red-500 hover:bg-red-600 rotate-45' 
                    : 'bg-primary hover:bg-primary/90 rotate-0'
                } text-white border-0`}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Close quick actions' : 'Open quick actions'}
              >
                {isExpanded ? (
                  <X className="h-8 w-8" />
                ) : (
                  <Plus className="h-8 w-8" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="mr-4">
              <div className="text-center">
                <div className="font-medium">
                  {isExpanded ? 'Close' : 'Quick Actions'}
                </div>
                {!isExpanded && (
                  <div className="text-xs text-muted-foreground">
                    Click or press any shortcut
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Backdrop for mobile */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden -z-10"
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </TooltipProvider>
  );
};