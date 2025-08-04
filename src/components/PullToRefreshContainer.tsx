import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  resistanceRatio?: number;
  enabled?: boolean;
}

export function PullToRefreshContainer({
  onRefresh,
  children,
  className = "",
  threshold = 80,
  resistanceRatio = 0.5,
  enabled = true
}: PullToRefreshContainerProps) {
  const pullToRefresh = usePullToRefresh({
    onRefresh,
    threshold,
    resistanceRatio
  });

  if (!enabled || !pullToRefresh.isEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      ref={pullToRefresh.bindToContainer}
      style={{ touchAction: 'pan-y' }}
    >
      <PullToRefreshIndicator
        isPulling={pullToRefresh.isPulling}
        isRefreshing={pullToRefresh.isRefreshing}
        pullDistance={pullToRefresh.pullDistance}
        canRelease={pullToRefresh.canRelease}
        threshold={threshold}
      />
      {children}
    </div>
  );
}