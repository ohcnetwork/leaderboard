/**
 * Structured logging implementation
 */

import type { Logger } from "@ohcnetwork/leaderboard-api";

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class ConsoleLogger implements Logger {
  private minLevel: LogLevel;
  private bindings: Record<string, unknown>;

  constructor(
    minLevel: LogLevel = LogLevel.INFO,
    bindings: Record<string, unknown> = {},
  ) {
    this.minLevel = minLevel;
    this.bindings = bindings;
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const merged = { ...this.bindings, ...meta };
    const timestamp = new Date().toISOString();
    const metaStr =
      Object.keys(merged).length > 0 ? ` ${JSON.stringify(merged)}` : "";
    console.log(`[${timestamp}] ${levelName}: ${message}${metaStr}`);
  }

  child(bindings: Record<string, unknown>): Logger {
    return new ConsoleLogger(this.minLevel, { ...this.bindings, ...bindings });
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, "INFO", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, "WARN", message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const errorMeta = error
      ? { error: error.message, stack: error.stack, ...meta }
      : meta;
    this.log(LogLevel.ERROR, "ERROR", message, errorMeta);
  }
}

export function createLogger(debug = false): Logger {
  return new ConsoleLogger(debug ? LogLevel.DEBUG : LogLevel.INFO);
}
