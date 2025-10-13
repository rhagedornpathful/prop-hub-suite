import { Shield, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface EncryptionIndicatorProps {
  level: 'disabled' | 'basic' | 'enhanced' | 'maximum';
  className?: string;
}

export const EncryptionIndicator = ({ level, className }: EncryptionIndicatorProps) => {
  const config = {
    disabled: {
      icon: ShieldAlert,
      color: 'text-muted-foreground',
      label: 'No Encryption',
      description: 'Messages are not encrypted'
    },
    basic: {
      icon: Shield,
      color: 'text-blue-500',
      label: 'Basic Encryption',
      description: 'Messages encrypted at rest'
    },
    enhanced: {
      icon: ShieldCheck,
      color: 'text-green-500',
      label: 'End-to-End Encrypted',
      description: 'Messages fully encrypted end-to-end'
    },
    maximum: {
      icon: Lock,
      color: 'text-purple-500',
      label: 'Zero-Knowledge Encryption',
      description: 'Maximum security, zero-knowledge architecture'
    }
  };

  const { icon: Icon, color, label, description } = config[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 ${className}`}>
            <Icon className={`h-3 w-3 ${color}`} />
            <span className="text-xs">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
