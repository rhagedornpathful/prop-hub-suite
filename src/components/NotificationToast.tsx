import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantMap = {
  success: 'default',
  error: 'destructive',
  warning: 'default',
  info: 'default',
} as const;

export const showNotification = ({
  title,
  description,
  type = 'info',
  duration = 5000,
  action,
}: NotificationOptions) => {
  const Icon = iconMap[type];
  
  toast({
    title,
    description: description ? (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {description}
      </div>
    ) : undefined,
    variant: variantMap[type],
    duration,
    action: action ? (
      <button
        onClick={action.onClick}
        className="text-sm font-medium underline hover:no-underline"
      >
        {action.label}
      </button>
    ) : undefined,
  });
};

// Convenience functions
export const showSuccess = (title: string, description?: string) =>
  showNotification({ title, description, type: 'success' });

export const showError = (title: string, description?: string) =>
  showNotification({ title, description, type: 'error' });

export const showWarning = (title: string, description?: string) =>
  showNotification({ title, description, type: 'warning' });

export const showInfo = (title: string, description?: string) =>
  showNotification({ title, description, type: 'info' });

// Hook for auto-notifications
export const useAutoNotification = (
  condition: boolean,
  notification: NotificationOptions,
  dependencies: any[] = []
) => {
  useEffect(() => {
    if (condition) {
      showNotification(notification);
    }
  }, [...dependencies, condition]);
};