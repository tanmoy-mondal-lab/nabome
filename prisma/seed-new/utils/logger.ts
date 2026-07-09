/**
 * Logging utilities for seed operations
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARNING = 3,
  ERROR = 4,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  module?: string;
}

class SeedLogger {
  private logs: LogEntry[] = [];
  private moduleTimings: Map<string, number> = new Map();
  private startTime: number = Date.now();

  /**
   * Log a debug message
   */
  debug(message: string, module?: string): void {
    this.log(LogLevel.DEBUG, message, module);
  }

  /**
   * Log an info message
   */
  info(message: string, module?: string): void {
    this.log(LogLevel.INFO, message, module);
  }

  /**
   * Log a success message
   */
  success(message: string, module?: string): void {
    this.log(LogLevel.SUCCESS, message, module);
  }

  /**
   * Log a warning message
   */
  warning(message: string, module?: string): void {
    this.log(LogLevel.WARNING, message, module);
  }

  /**
   * Log an error message
   */
  error(message: string, module?: string): void {
    this.log(LogLevel.ERROR, message, module);
  }

  /**
   * Start timing a module
   */
  startModule(moduleName: string): void {
    this.moduleTimings.set(moduleName, Date.now());
    this.info(`Starting ${moduleName}...`, moduleName);
  }

  /**
   * End timing a module and log success
   */
  endModule(moduleName: string): void {
    const startTime = this.moduleTimings.get(moduleName);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.success(`✔ ${moduleName} Seeded (${(duration / 1000).toFixed(2)}s)`, moduleName);
    } else {
      this.success(`✔ ${moduleName} Seeded`, moduleName);
    }
  }

  /**
   * Log module failure
   */
  failModule(moduleName: string, error: Error): void {
    const startTime = this.moduleTimings.get(moduleName);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.error(`✖ ${moduleName} Failed after ${(duration / 1000).toFixed(2)}s`, moduleName);
    } else {
      this.error(`✖ ${moduleName} Failed`, moduleName);
    }
    this.error(`  Error: ${error.message}`, moduleName);
  }

  /**
   * Log the final summary
   */
  summary(): void {
    const totalDuration = Date.now() - this.startTime;
    const successCount = this.logs.filter(l => l.level === LogLevel.SUCCESS).length;
    const errorCount = this.logs.filter(l => l.level === LogLevel.ERROR).length;

    console.log('\n' + '='.repeat(50));
    console.log(`Seed Summary`);
    console.log('='.repeat(50));
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Modules Succeeded: ${successCount}`);
    console.log(`Modules Failed: ${errorCount}`);
    console.log('='.repeat(50));
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, module?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      module,
    };
    this.logs.push(entry);

    const prefix = this.getPrefix(level, module);
    console.log(prefix + message);
  }

  /**
   * Get log prefix based on level
   */
  private getPrefix(level: LogLevel, module?: string): string {
    const levelPrefix = {
      [LogLevel.DEBUG]: '🔍 ',
      [LogLevel.INFO]: 'ℹ️  ',
      [LogLevel.SUCCESS]: '✅ ',
      [LogLevel.WARNING]: '⚠️  ',
      [LogLevel.ERROR]: '❌ ',
    };

    const modulePrefix = module ? `[${module}] ` : '';
    return levelPrefix[level] + modulePrefix;
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.moduleTimings.clear();
    this.startTime = Date.now();
  }
}

// Export singleton instance
export const logger = new SeedLogger();
