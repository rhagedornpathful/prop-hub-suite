import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, Minus, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICON_SIZES } from '@/lib/iconSizes';

export type StatusType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'pending' 
  | 'active'
  | 'inactive'
  | 'completed'
  | 'in_progress'
  | 'cancelled'
  | 'default';

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  colorClass: string;
  label: string;
}> = {
  success: {
    icon: CheckCircle,
    variant: 'default',
    colorClass: 'bg-success/10 text-success border-success/20',
    label: 'Success'
  },
  completed: {
    icon: CheckCircle,
    variant: 'default',
    colorClass: 'bg-success/10 text-success border-success/20',
    label: 'Completed'
  },
  error: {
    icon: XCircle,
    variant: 'destructive',
    colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
    label: 'Error'
  },
  cancelled: {
    icon: XCircle,
    variant: 'destructive',
    colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
    label: 'Cancelled'
  },
  warning: {
    icon: AlertCircle,
    variant: 'default',
    colorClass: 'bg-warning/10 text-warning border-warning/20',
    label: 'Warning'
  },
  pending: {
    icon: Clock,
    variant: 'secondary',
    colorClass: 'bg-muted text-muted-foreground border-muted-foreground/20',
    label: 'Pending'
  },
  in_progress: {
    icon: Clock,
    variant: 'default',
    colorClass: 'bg-info/10 text-info border-info/20',
    label: 'In Progress'
  },
  info: {
    icon: AlertCircle,
    variant: 'default',
    colorClass: 'bg-info/10 text-info border-info/20',
    label: 'Info'
  },
  active: {
    icon: Circle,
    variant: 'default',
    colorClass: 'bg-success/10 text-success border-success/20',
    label: 'Active'
  },
  inactive: {
    icon: Minus,
    variant: 'secondary',
    colorClass: 'bg-muted text-muted-foreground border-muted-foreground/20',
    label: 'Inactive'
  },
  default: {
    icon: Circle,
    variant: 'outline',
    colorClass: '',
    label: 'Default'
  }
};

/**
 * Accessible status badge with icons
 * Includes both color AND icon to support colorblind users
 */
export function StatusBadge({ 
  status, 
  children, 
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.default;
  const Icon = config.icon;
  const displayText = children || config.label;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 border',
        config.colorClass,
        className
      )}
      aria-label={`Status: ${displayText}`}
    >
      {showIcon && <Icon className={ICON_SIZES.xs} aria-hidden="true" />}
      <span>{displayText}</span>
    </Badge>
  );
}

/**
 * Compact status indicator (icon only with tooltip)
 */
export function StatusIndicator({ 
  status, 
  className 
}: Pick<StatusBadgeProps, 'status' | 'className'>) {
  const config = statusConfig[status] || statusConfig.default;
  const Icon = config.icon;

  return (
    <div 
      className={cn('inline-flex', className)}
      title={config.label}
      aria-label={`Status: ${config.label}`}
    >
      <Icon className={cn(ICON_SIZES.sm, config.colorClass.split(' ')[1])} />
    </div>
  );
}
