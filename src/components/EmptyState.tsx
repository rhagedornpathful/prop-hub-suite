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
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  suggestions,
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
          <p className="text-muted-foreground mb-4 max-w-md">
            {description}
          </p>
        )}
        {suggestions && suggestions.length > 0 && (
          <ul className="text-sm text-muted-foreground mb-6 space-y-1 text-left">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size="lg"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                size="lg"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};