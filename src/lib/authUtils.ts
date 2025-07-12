/**
 * Authentication utility functions for managing auth state and emergency mode
 */

/**
 * Completely clears emergency admin mode and all related flags
 */
export function clearEmergencyMode(): void {
  console.log('🧹 Clearing emergency admin mode...');
  
  // Clear sessionStorage flags
  sessionStorage.removeItem('emergencyAdmin');
  sessionStorage.removeItem('emergencyAdminUser');
  
  // Clear global window flags
  delete (window as any).__EMERGENCY_ADMIN_MODE__;
  
  // Clear any other auth-related storage that might interfere
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase.auth.') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('🧹 Removing localStorage key:', key);
    localStorage.removeItem(key);
  });
  
  console.log('✅ Emergency mode cleared');
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
  console.log('🔄 Forcing complete auth reset...');
  
  // Clear emergency mode
  clearEmergencyMode();
  
  // Force redirect to auth page
  window.location.href = '/auth';
}

/**
 * Gets a clean auth redirect URL for the current environment
 */
export function getAuthRedirectUrl(): string {
  return `${window.location.origin}/`;
}