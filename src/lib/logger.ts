// Production-safe logging utility
class Logger {
  private isDevelopment = import.meta.env.DEV;

  log(...args: unknown[]) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: unknown[]) {
    if (this.isDevelopment) {
      console.error(...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: unknown[]) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }
}

export const logger = new Logger();