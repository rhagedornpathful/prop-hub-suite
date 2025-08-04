import React from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRelease: boolean;
  threshold: number;
}

export function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  pullDistance,
  canRelease,
  threshold
}: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const translateY = Math.max(-50 + (progress * 50), -40);

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-50"
      style={{ 
        transform: `translateY(${translateY}px)`,
        opacity: Math.max(progress, 0.3)
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: Math.max(progress, 0.3) }}
    >
      <div className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-3">
        <div className="relative">
          {isRefreshing ? (
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          ) : canRelease ? (
            <motion.div
              animate={{ rotateX: 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-success" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotateX: pullDistance > threshold * 0.7 ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          )}
          
          {/* Progress ring */}
          <svg
            className="absolute -inset-1 h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/20"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={canRelease ? "text-success" : "text-primary"}
              strokeDasharray={`${progress * 62.8} 62.8`}
              transform="rotate(-90 12 12)"
              style={{
                transition: 'stroke-dasharray 0.1s ease-out'
              }}
            />
          </svg>
        </div>
        
        <span className="text-sm font-medium">
          {isRefreshing 
            ? 'Refreshing...' 
            : canRelease 
            ? 'Release to refresh' 
            : 'Pull to refresh'
          }
        </span>
      </div>
    </motion.div>
  );
}