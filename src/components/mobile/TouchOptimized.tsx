import * as React from 'react';
import { motion } from 'framer-motion';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface TouchOptimizedProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onPress?: () => void;
  hapticFeedback?: boolean;
}

export function TouchOptimized({
  children,
  className = "",
  disabled = false,
  onPress,
  hapticFeedback = false
}: TouchOptimizedProps) {
  const { isTouchDevice } = useMobileDetection();

  const handlePress = () => {
    if (disabled) return;
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
    
    onPress?.();
  };

  if (!isTouchDevice) {
    return (
      <div className={className} onClick={onPress}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      onClick={handlePress}
      style={{
        minHeight: '44px', // Minimum touch target size
        minWidth: '44px',
        touchAction: 'manipulation', // Prevents double-tap zoom
      }}
    >
      {children}
    </motion.div>
  );
}

// Touch-optimized button wrapper
interface TouchButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function TouchButton({
  children,
  className = "",
  disabled = false,
  onClick,
  variant = 'default',
  type = 'button'
}: TouchButtonProps) {
  const { isTouchDevice } = useMobileDetection();

  const touchOptimizedClasses = isTouchDevice 
    ? 'min-h-[44px] min-w-[44px] px-4 py-3' 
    : '';

  return (
    <motion.button
      className={`${touchOptimizedClasses} ${className}`}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </motion.button>
  );
}