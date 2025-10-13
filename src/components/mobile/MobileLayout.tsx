import React from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  showBottomNav?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export const MobileLayout = ({
  children,
  title,
  showBack = false,
  showBottomNav = true,
  onMenuClick,
  className,
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MobileHeader 
        title={title} 
        showBack={showBack}
        onMenuClick={onMenuClick}
      />
      
      <main className={cn(
        "flex-1 overflow-y-auto",
        showBottomNav && "pb-16",
        className
      )}>
        {children}
      </main>
      
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};
