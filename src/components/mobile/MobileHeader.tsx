import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export const MobileHeader = ({ 
  title, 
  showBack = false, 
  onMenuClick,
  className 
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-card border-b border-border safe-area-inset-top",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
};
