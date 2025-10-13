import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Platform = 'ios' | 'android' | 'web';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  platform: Platform;
  isNativeApp: boolean;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Initial device detection
    const isNativeApp = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform() as Platform;
    
    // Check screen width
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    let deviceType: DeviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType,
      platform,
      isNativeApp,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      let deviceType: DeviceType = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      
      setDeviceInfo(prev => ({
        ...prev,
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};
