import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICON_SIZES } from '@/lib/iconSizes';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: ICON_SIZES.sm,
  md: ICON_SIZES.lg,
  lg: ICON_SIZES.xl,
  xl: ICON_SIZES['2xl']
};

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
};