/**
 * Authentication utility functions for managing auth state and emergency mode
 */

import { logger } from '@/lib/logger';

/**
 * Completely clears emergency admin mode and all related flags
 */
export function clearEmergencyMode(): void {
  logger.info('🧹 Clearing emergency admin mode...');
  
  // Clear sessionStorage flags
  sessionStorage.removeItem('emergencyAdmin');
  sessionStorage.removeItem('emergencyAdminUser');
  
  // Clear global window flags
  delete (window as any).__EMERGENCY_ADMIN_MODE__;
  
  // Clear any other auth-related storage that might interfere
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase.auth.') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    logger.info('🧹 Removing localStorage key:', key);
    localStorage.removeItem(key);
  });
  
  logger.info('✅ Emergency mode cleared');
}


/**
 * Thoroughly clears all Supabase auth state to prevent limbo states
 */
export function cleanupAuthState(): void {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');

    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Remove all Supabase auth keys from sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    logger.warn('cleanupAuthState encountered an error', e);
  }
}

/**
 * Checks if we're currently in emergency admin mode
 */
export function isEmergencyMode(): boolean {
  return sessionStorage.getItem('emergencyAdmin') === 'true' || 
         !!(window as any).__EMERGENCY_ADMIN_MODE__;
}

/**
 * Forces a complete auth reset and redirect to login
 */
export function forceAuthReset(): void {
  logger.info('🔄 Forcing complete auth reset...');
  // Clear emergency mode and auth artifacts
  clearEmergencyMode();
  cleanupAuthState();
  // Force redirect to auth page
  window.location.href = '/auth';
}

/**
 * Gets a clean auth redirect URL for the current environment
 */
export function getAuthRedirectUrl(): string {
  return `${window.location.origin}/`;
}
