// Production-ready environment configuration
export const config = {
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Feature flags
  features: {
    debugMode: import.meta.env.DEV,
    errorReporting: import.meta.env.PROD,
    performanceMonitoring: import.meta.env.PROD,
    consoleLogging: import.meta.env.DEV,
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