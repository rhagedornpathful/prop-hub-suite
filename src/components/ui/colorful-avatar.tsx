import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

interface ColorfulAvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string; // Name or initials
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg'
};

/**
 * Generates a consistent color based on a string (name)
 * Uses HSL for better color distribution and accessibility
 */
function getColorFromString(str: string): { bg: string; text: string } {
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hash to generate a hue (0-360)
  const hue = Math.abs(hash % 360);
  
  // Use different saturation and lightness for variety
  // Keep saturation high (60-80%) and lightness moderate (40-60%) for vibrant colors
  const saturation = 65 + (Math.abs(hash) % 15);
  const lightness = 45 + (Math.abs(hash >> 8) % 15);
  
  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    text: lightness > 50 ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 95%)'
  };
}

/**
 * Extracts initials from a name (max 2 characters)
 */
function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const ColorfulAvatar = React.forwardRef<
  HTMLDivElement,
  ColorfulAvatarProps
>(({ src, alt, fallback, size = 'md', className, showOnlineStatus, isOnline }, ref) => {
  const initials = getInitials(fallback);
  const colors = getColorFromString(fallback);
  
  return (
    <div className="relative inline-block" ref={ref}>
      <Avatar className={cn(sizeClasses[size], className)}>
        {src && <AvatarImage src={src} alt={alt || fallback} />}
        <AvatarFallback 
          style={{ 
            backgroundColor: colors.bg,
            color: colors.text
          }}
          className="font-semibold"
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            size === 'sm' && "h-2 w-2",
            size === 'md' && "h-2.5 w-2.5",
            size === 'lg' && "h-3 w-3",
            size === 'xl' && "h-4 w-4",
            isOnline ? "bg-green-500" : "bg-muted-foreground"
          )}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
});

ColorfulAvatar.displayName = "ColorfulAvatar";
