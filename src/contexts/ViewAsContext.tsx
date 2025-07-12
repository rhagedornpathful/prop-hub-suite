import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ViewAsRole = 'admin' | 'property_manager' | 'owner_investor' | 'tenant' | 'house_watcher' | null;

interface ViewAsContextType {
  viewAsRole: ViewAsRole;
  isViewingAs: boolean;
  setViewAsRole: (role: ViewAsRole) => void;
  exitViewAs: () => void;
  canUseViewAs: boolean;
}

const ViewAsContext = createContext<ViewAsContextType | undefined>(undefined);

export function ViewAsProvider({ children }: { children: React.ReactNode }) {
  const [viewAsRole, setViewAsRoleState] = useState<ViewAsRole>(() => {
    // Load from sessionStorage on init
    const saved = sessionStorage.getItem('viewAsRole');
    return saved && saved !== 'null' ? saved as ViewAsRole : null;
  });
  const { userRole } = useAuth(); // Use useAuth directly instead of useUserRole
  
  const isViewingAs = viewAsRole !== null;
  const canUseViewAs = userRole === 'admin'; // Check admin status directly

  const setViewAsRole = (role: ViewAsRole) => {
    if (!canUseViewAs) {
      console.warn('Only admin users can use View As feature');
      return;
    }
    
    setViewAsRoleState(role);
    
    // Persist to sessionStorage
    if (role) {
      sessionStorage.setItem('viewAsRole', role);
    } else {
      sessionStorage.removeItem('viewAsRole');
    }
    
    // Log the activity for audit purposes
    if (role) {
      console.log(`[AUDIT] Admin user viewing as: ${role} at ${new Date().toISOString()}`);
      
      // In a real app, you'd send this to your logging service
      // trackViewAsActivity(role);
    }
  };

  const exitViewAs = () => {
    console.log(`[AUDIT] Admin user exited View As mode at ${new Date().toISOString()}`);
    setViewAsRoleState(null);
    sessionStorage.removeItem('viewAsRole');
  };

  // Reset view as mode if user loses admin privileges
  useEffect(() => {
    if (!canUseViewAs && isViewingAs) {
      setViewAsRoleState(null);
    }
  }, [canUseViewAs, isViewingAs]);

  return (
    <ViewAsContext.Provider value={{
      viewAsRole,
      isViewingAs,
      setViewAsRole,
      exitViewAs,
      canUseViewAs,
    }}>
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAs() {
  const context = useContext(ViewAsContext);
  if (context === undefined) {
    throw new Error('useViewAs must be used within a ViewAsProvider');
  }
  return context;
}