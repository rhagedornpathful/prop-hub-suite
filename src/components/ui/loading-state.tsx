import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingState({ 
  isLoading, 
  children, 
  skeleton,
  className,
  spinnerSize = 'md',
  text = 'Loading...'
}: LoadingStateProps) {
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }

    const spinnerSizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6', 
      lg: 'h-8 w-8'
    };

    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="flex items-center gap-2">
          <Loader2 className={cn('animate-spin', spinnerSizes[spinnerSize])} />
          <span className="text-muted-foreground">{text}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Common skeleton patterns
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);