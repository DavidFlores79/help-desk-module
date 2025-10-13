import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = environment.production;
    this.logLevel = (environment.logLevel as LogLevel) || 'info';
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  /**
   * Log with custom emoji
   */
  log(emoji: string, message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(`${emoji} ${message}`, ...args);
    }
  }

  /**
   * Group logs together
   */
  group(label: string, collapsed: boolean = false): void {
    if (!this.isProduction) {
      if (collapsed) {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (!this.isProduction) {
      console.groupEnd();
    }
  }

  /**
   * Log table data
   */
  table(data: any): void {
    if (!this.isProduction) {
      console.table(data);
    }
  }

  /**
   * Determine if a message should be logged based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.logLevel === 'none') {
      return false;
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }
}
