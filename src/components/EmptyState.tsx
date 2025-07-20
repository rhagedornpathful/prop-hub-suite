import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-12',
  };

  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className={cn("flex flex-col items-center justify-center text-center", sizeClasses[size])}>
        {Icon && (
          <Icon className={cn("text-muted-foreground mb-4", iconSizeClasses[size])} />
        )}
        <h3 className={cn("font-semibold text-foreground mb-2", titleSizeClasses[size])}>
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground mb-6 max-w-md">
            {description}
          </p>
        )}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};