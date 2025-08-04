import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export const FormFieldError = ({ error, className }: FormFieldErrorProps) => {
  if (!error) return null;

  return (
    <div className={cn("flex items-center gap-2 text-destructive text-sm mt-2 p-2 bg-destructive/10 rounded-md border border-destructive/20", className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="font-medium">{error}</span>
    </div>
  );
};