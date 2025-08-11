import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive';
  animate?: boolean;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
};

const variantClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive'
};

export function Icon({ 
  icon: IconComponent, 
  className, 
  size = 'md', 
  variant = 'default',
  animate = false,
  ...props 
}: IconProps) {
  return (
    <IconComponent 
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        animate && 'transition-transform duration-200 hover:scale-110',
        className
      )}
      {...props}
    />
  );
}

// Status indicator component
interface StatusIconProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export function StatusIcon({ status, size = 'md', animate = true, className }: StatusIconProps) {
  const sizeMap = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-muted-foreground',
    busy: 'bg-destructive',
    away: 'bg-warning'
  };

  return (
    <div 
      className={cn(
        'rounded-full',
        sizeMap[size],
        statusColors[status],
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

// Icon with badge component
interface IconWithBadgeProps {
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'success' | 'warning';
  iconProps?: Omit<IconProps, 'icon'>;
  className?: string;
}

export function IconWithBadge({ 
  icon, 
  badge, 
  badgeVariant = 'destructive', 
  iconProps, 
  className 
}: IconWithBadgeProps) {
  const badgeColors = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground'
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <Icon icon={icon} {...iconProps} />
      {badge && (
        <span className={cn(
          'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium',
          badgeColors[badgeVariant]
        )}>
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
}

// Animated icon container for loading states
interface AnimatedIconProps {
  icon: LucideIcon;
  animation?: 'spin' | 'pulse' | 'bounce' | 'glow';
  iconProps?: Omit<IconProps, 'icon'>;
  className?: string;
}

export function AnimatedIcon({ 
  icon, 
  animation = 'spin', 
  iconProps, 
  className 
}: AnimatedIconProps) {
  const animationClasses = {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'animate-glow'
  };

  return (
    <div className={cn(animationClasses[animation], className)}>
      <Icon icon={icon} {...iconProps} />
    </div>
  );
}