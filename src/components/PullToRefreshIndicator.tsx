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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: Math.max(progress, 0.3),
        scale: isRefreshing ? 1 : Math.max(0.8 + progress * 0.2, 0.8)
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div className="bg-background/95 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border border-border/50 flex items-center gap-3">
        <div className="relative">
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <RefreshCw className="h-5 w-5 text-primary" />
            </motion.div>
          ) : canRelease ? (
            <motion.div
              animate={{ rotateX: 180, scale: 1.1 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 20
              }}
            >
              <ChevronDown className="h-5 w-5 text-success" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ 
                rotateX: pullDistance > threshold * 0.7 ? 160 : 0,
                scale: Math.max(1, progress * 1.2)
              }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
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
                transition: 'stroke-dasharray 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </svg>
        </div>
        
        <motion.span 
          className="text-sm font-medium select-none"
          animate={{
            color: isRefreshing 
              ? 'hsl(var(--primary))' 
              : canRelease 
              ? 'hsl(var(--success))' 
              : 'hsl(var(--foreground))'
          }}
          transition={{ duration: 0.2 }}
        >
          {isRefreshing 
            ? 'Refreshing...' 
            : canRelease 
            ? 'Release to refresh' 
            : 'Pull to refresh'
          }
        </motion.span>
      </div>
    </motion.div>
  );
}