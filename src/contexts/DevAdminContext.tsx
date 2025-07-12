import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DevAdminContextType {
  isDevAdminActive: boolean;
  toggleDevAdmin: () => void;
  isDevelopment: boolean;
}

const DevAdminContext = createContext<DevAdminContextType | undefined>(undefined);

interface DevAdminProviderProps {
  children: ReactNode;
}

export function DevAdminProvider({ children }: DevAdminProviderProps) {
  const [isDevAdminActive, setIsDevAdminActive] = useState(false);
  
  // Check if we're in development mode and on localhost
  const isDevelopment = process.env.NODE_ENV === 'development' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Load dev admin state from localStorage on mount
  useEffect(() => {
    if (isDevelopment) {
      const saved = localStorage.getItem('dev-admin-mode');
      if (saved === 'true') {
        setIsDevAdminActive(true);
      }
    }
  }, [isDevelopment]);

  const toggleDevAdmin = () => {
    if (!isDevelopment) return;
    
    const newState = !isDevAdminActive;
    setIsDevAdminActive(newState);
    
    // Save to localStorage
    localStorage.setItem('dev-admin-mode', newState.toString());
  };

  // Don't provide dev admin functionality outside of development
  if (!isDevelopment) {
    return (
      <DevAdminContext.Provider value={{
        isDevAdminActive: false,
        toggleDevAdmin: () => {},
        isDevelopment: false
      }}>
        {children}
      </DevAdminContext.Provider>
    );
  }

  return (
    <DevAdminContext.Provider value={{
      isDevAdminActive,
      toggleDevAdmin,
      isDevelopment
    }}>
      {children}
    </DevAdminContext.Provider>
  );
}

export function useDevAdmin() {
  const context = useContext(DevAdminContext);
  if (context === undefined) {
    throw new Error('useDevAdmin must be used within a DevAdminProvider');
  }
  return context;
}