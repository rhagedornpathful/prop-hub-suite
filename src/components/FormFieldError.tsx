import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export const FormFieldError = ({ error, className }: FormFieldErrorProps) => {
  if (!error) return null;

  return (
    <div className={cn("flex items-center gap-1 text-red-500 text-xs mt-1", className)}>
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  );
};