import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input, InputProps } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  type?: InputProps['inputType'];
  textarea?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps & (
  | React.ComponentPropsWithoutRef<typeof Input>
  | React.ComponentPropsWithoutRef<typeof Textarea>
)>(({ label, id, required, error, hint, type, textarea, children, className, ...props }, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children || (
        textarea ? (
          <Textarea
            id={id}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...props as React.ComponentPropsWithoutRef<typeof Textarea>}
          />
        ) : (
          <Input
            id={id}
            inputType={type}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            ref={ref as React.Ref<HTMLInputElement>}
            {...props as React.ComponentPropsWithoutRef<typeof Input>}
          />
        )
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = "FormField";
