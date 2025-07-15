// Production-ready environment configuration
export const config = {
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature flags
  features: {
    debugMode: process.env.NODE_ENV === 'development',
    errorReporting: process.env.NODE_ENV === 'production',
    performanceMonitoring: process.env.NODE_ENV === 'production',
    consoleLogging: process.env.NODE_ENV === 'development',
  },
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Performance thresholds
  performance: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxFileSize: 10 * 1024 * 1024, // 10MB
    lazyLoadThreshold: 200, // pixels
    debounceDelay: 300, // milliseconds
  },
  
  // Security
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    passwordMinLength: 8,
  },
  
  // UI Configuration
  ui: {
    pageSize: 20,
    maxPageSize: 100,
    animationDuration: 300,
    toastDuration: 5000,
  },
};

// Type-safe feature flag checker
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature] ?? false;
};

// Safe logging utility
export const safeLog = {
  info: (...args: unknown[]) => {
    if (isFeatureEnabled('consoleLogging')) {
      console.info(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isFeatureEnabled('consoleLogging')) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isFeatureEnabled('consoleLogging')) {
      console.warn(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isFeatureEnabled('debugMode')) {
      console.debug(...args);
    }
  },
};

export default config;