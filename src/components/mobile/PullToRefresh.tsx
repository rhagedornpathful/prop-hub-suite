import { useState, useRef, useCallback } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className = ""
}: PullToRefreshProps) {
  const { isMobile, isTouchDevice } = useMobileDetection();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePanStart = useCallback((event: any, info: PanInfo) => {
    if (!isTouchDevice || !containerRef.current) return;
    
    // Only allow pull to refresh when scrolled to top
    const scrollTop = containerRef.current.scrollTop;
    if (scrollTop > 0) return;
    
    startY.current = info.point.y;
  }, [isTouchDevice]);

  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (!isTouchDevice || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;

    const deltaY = info.point.y - startY.current;
    if (deltaY > 0) {
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
      controls.set({ y: distance });
    }
  }, [isTouchDevice, isRefreshing, threshold, controls]);

  const handlePanEnd = useCallback(async (event: any, info: PanInfo) => {
    if (!isTouchDevice || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      setPullDistance(0);
      controls.set({ y: 0 });
      return;
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        controls.start({ y: 0 });
      }
    } else {
      setPullDistance(0);
      controls.start({ y: 0 });
    }
  }, [isTouchDevice, isRefreshing, pullDistance, threshold, onRefresh, controls]);

  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const shouldShowRefresh = pullDistance > 10;

  if (!isMobile && !isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      animate={controls}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull to refresh indicator */}
      {shouldShowRefresh && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
          style={{ 
            transform: `translateY(${-50 + (pullDistance / threshold) * 50}px)`,
            opacity: refreshOpacity 
          }}
        >
          <div className="bg-card/90 backdrop-blur-sm rounded-full p-3 shadow-lg border">
            <RefreshCw 
              className={`h-5 w-5 text-primary ${
                isRefreshing ? 'animate-spin' : ''
              } ${pullDistance >= threshold ? 'text-success' : 'text-muted-foreground'}`}
            />
          </div>
          <span className="ml-2 text-sm text-muted-foreground">
            {isRefreshing 
              ? 'Refreshing...' 
              : pullDistance >= threshold 
              ? 'Release to refresh' 
              : 'Pull to refresh'
            }
          </span>
        </motion.div>
      )}

      {children}
    </motion.div>
  );
}