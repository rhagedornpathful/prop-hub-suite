import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({ 
  className, 
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  ...props 
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-3/4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded';
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-wave bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]';
      case 'none':
        return 'bg-muted';
      default:
        return 'animate-pulse bg-muted';
    }
  };

  return (
    <div
      className={cn(
        getVariantClasses(),
        getAnimationClasses(),
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
};

// Common skeleton patterns
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-4 space-y-3", className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className }: { items?: number; className?: string }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);