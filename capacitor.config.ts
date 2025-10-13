import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bd81fa1e51cd42f4be629fca5c241d7a',
  appName: 'app-latitude-premier',
  webDir: 'dist',
  server: {
    url: 'https://bd81fa1e-51cd-42f4-be62-9fca5c241d7a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
