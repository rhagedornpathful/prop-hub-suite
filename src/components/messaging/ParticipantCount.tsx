import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantCountProps {
  count: number;
  maxDisplay?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const ParticipantCount = ({ 
  count, 
  maxDisplay = 99,
  size = 'sm',
  className 
}: ParticipantCountProps) => {
  if (count <= 1) return null;
  
  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count;
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm",
        className
      )}
      title={`${count} participant${count > 1 ? 's' : ''}`}
    >
      <Users className={cn(
        size === 'sm' && "h-3 w-3",
        size === 'md' && "h-4 w-4"
      )} />
      <span className="font-medium">{displayCount}</span>
    </div>
  );
};
