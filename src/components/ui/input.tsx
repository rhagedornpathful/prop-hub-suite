import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  inputType?: 'email' | 'tel' | 'number' | 'url' | 'search' | 'password' | 'text';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputType, ...props }, ref) => {
    const finalType = inputType || type || 'text';
    
    return (
      <input
        type={finalType}
        className={cn(
          "flex h-12 w-full rounded-lg border-2 bg-background px-4 py-3 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          props.required ? "border-input focus-visible:border-primary" : "border-input focus-visible:border-ring",
          className
        )}
        ref={ref}
        aria-required={props.required}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
