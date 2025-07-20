import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
  weight: number;
}

const passwordRules: PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
    weight: 20
  },
  {
    label: "Contains uppercase letter",
    test: (password) => /[A-Z]/.test(password),
    weight: 20
  },
  {
    label: "Contains lowercase letter", 
    test: (password) => /[a-z]/.test(password),
    weight: 20
  },
  {
    label: "Contains number",
    test: (password) => /[0-9]/.test(password),
    weight: 20
  },
  {
    label: "Contains special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
    weight: 20
  }
];

export const PasswordStrengthIndicator = ({ 
  password, 
  onStrengthChange 
}: PasswordStrengthIndicatorProps) => {
  const [strength, setStrength] = useState(0);
  
  useEffect(() => {
    const passedRules = passwordRules.filter(rule => rule.test(password));
    const calculatedStrength = passedRules.reduce((acc, rule) => acc + rule.weight, 0);
    
    setStrength(calculatedStrength);
    onStrengthChange?.(calculatedStrength);
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-yellow-500";
    if (strength >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthLabel = () => {
    if (strength >= 80) return "Strong";
    if (strength >= 60) return "Good";
    if (strength >= 40) return "Fair";
    if (strength >= 20) return "Weak";
    return "Very Weak";
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className={cn(
          "text-sm font-medium",
          strength >= 80 ? "text-green-600" :
          strength >= 60 ? "text-yellow-600" :
          strength >= 40 ? "text-orange-600" :
          "text-red-600"
        )}>
          {getStrengthLabel()}
        </span>
      </div>
      
      <Progress 
        value={strength} 
        className="h-2"
      />
      
      <div className="space-y-1">
        {passwordRules.map((rule, index) => {
          const passed = rule.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={cn(
                passed ? "text-green-600" : "text-muted-foreground"
              )}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};