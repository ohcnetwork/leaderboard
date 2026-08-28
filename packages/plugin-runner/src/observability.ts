/**
 * Error reporting for the plugin runner.
 *
 * Sentry is initialised once by the host process and reached through the
 * standard `Logger` interface, so plugins never depend on a reporting SDK.
 */

import type { Logger } from "@ohcnetwork/leaderboard-api";
import type { ObservabilityConfig } from "./config";

/** Subset of `@sentry/node` the runner depends on. */
interface SentryLike {
  init(options: Record<string, unknown>): void;
  captureException(error: unknown, hint?: Record<string, unknown>): string;
  captureMessage(message: string, hint?: Record<string, unknown>): string;
  addBreadcrumb(breadcrumb: Record<string, unknown>): void;
  flush(timeout?: number): Promise<boolean>;
}

export interface ErrorReporter {
  captureError(
    message: string,
    error: Error | undefined,
    context: Record<string, unknown>,
  ): void;
  captureWarning(message: string, context: Record<string, unknown>): void;
  addBreadcrumb(level: string, message: string): void;
  flush(): Promise<void>;
}

/**
 * `substituteEnvVars` leaves the literal `${{ env.X }}` behind when the
 * variable is unset, so an unresolved placeholder must not reach Sentry.
 */
function isResolved(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== "" && !value.includes("${{");
}

class SentryReporter implements ErrorReporter {
  private eventsSent = 0;

  constructor(
    private readonly sentry: SentryLike,
    private readonly maxEventsPerRun: number,
    private readonly logger: Pick<Logger, "warn">,
  ) {}

  private withinBudget(): boolean {
    if (this.eventsSent < this.maxEventsPerRun) return true;
    if (this.eventsSent === this.maxEventsPerRun) {
      this.eventsSent++;
      this.logger.warn(
        `Sentry event budget of ${this.maxEventsPerRun} reached; further events this run are dropped`,
      );
    }
    return false;
  }

  /**
   * Groups by the stable dimensions only. High-cardinality values such as the
   * repository name stay tags, otherwise every repo becomes its own issue.
   */
  private buildScope(context: Record<string, unknown>) {
    const tags: Record<string, string> = {};
    const extra: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(context)) {
      if (value === undefined || value === null) continue;
      if (typeof value === "string" || typeof value === "number") {
        tags[key] = String(value);
      } else {
        extra[key] = value;
      }
    }

    return { tags, extra };
  }

  captureError(
    message: string,
    error: Error | undefined,
    context: Record<string, unknown>,
  ): void {
    if (!this.withinBudget()) return;
    this.eventsSent++;

    const { tags, extra } = this.buildScope(context);
    const fingerprint = [
      String(context.phase ?? "unknown"),
      String(context.plugin ?? "runner"),
      String(context.source ?? "general"),
      error?.name ?? message,
    ];

    if (error) {
      this.sentry.captureException(error, {
        tags,
        extra: { ...extra, message },
        fingerprint,
      });
    } else {
      this.sentry.captureMessage(message, {
        level: "error",
        tags,
        extra,
        fingerprint,
      });
    }
  }

  captureWarning(message: string, context: Record<string, unknown>): void {
    if (!this.withinBudget()) return;
    this.eventsSent++;

    const { tags, extra } = this.buildScope(context);
    this.sentry.captureMessage(message, {
      level: "warning",
      tags,
      extra,
      fingerprint: [
        String(context.phase ?? "unknown"),
        String(context.plugin ?? "runner"),
        String(context.source ?? "general"),
        message,
      ],
    });
  }

  addBreadcrumb(level: string, message: string): void {
    this.sentry.addBreadcrumb({ level, message, category: "runner" });
  }

  async flush(): Promise<void> {
    await this.sentry.flush(5000);
  }
}

/**
 * Wraps a logger so error/warn calls are also reported, and info/debug calls
 * become breadcrumbs that give those reports surrounding context.
 */
class ReportingLogger implements Logger {
  constructor(
    private readonly inner: Logger,
    private readonly reporter: ErrorReporter,
    private readonly bindings: Record<string, unknown> = {},
  ) {}

  child(bindings: Record<string, unknown>): Logger {
    return new ReportingLogger(
      this.inner.child?.(bindings) ?? this.inner,
      this.reporter,
      { ...this.bindings, ...bindings },
    );
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.inner.debug(message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.inner.info(message, meta);
    this.reporter.addBreadcrumb("info", message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.inner.warn(message, meta);
    this.reporter.captureWarning(message, { ...this.bindings, ...meta });
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.inner.error(message, error, meta);
    this.reporter.captureError(message, error, { ...this.bindings, ...meta });
  }
}

export interface Observability {
  logger: Logger;
  reporter?: ErrorReporter;
  failFast: boolean;
  flush(): Promise<void>;
}

/**
 * Initialises error reporting from config. Returns the original logger
 * untouched when no reporter is configured.
 */
export async function initObservability(
  observability: ObservabilityConfig | undefined,
  logger: Logger,
): Promise<Observability> {
  const failFast = observability?.fail_fast ?? false;
  const sentryConfig = observability?.sentry;

  if (!sentryConfig?.enabled || !isResolved(sentryConfig.dsn)) {
    if (sentryConfig?.enabled && sentryConfig.dsn) {
      logger.warn(
        "Sentry is enabled but the DSN is unset or contains an unresolved placeholder; error reporting is disabled",
      );
    }
    return { logger, failFast, flush: async () => {} };
  }

  let sentry: SentryLike;
  try {
    sentry = (await import("@sentry/node")) as unknown as SentryLike;
  } catch (error) {
    logger.warn(
      "Sentry is configured but '@sentry/node' could not be loaded; error reporting is disabled",
      { error: (error as Error).message },
    );
    return { logger, failFast, flush: async () => {} };
  }

  sentry.init({
    dsn: sentryConfig.dsn,
    environment:
      sentryConfig.environment ?? process.env.NODE_ENV ?? "production",
    release: sentryConfig.release,
    tracesSampleRate: sentryConfig.traces_sample_rate,
  });

  const reporter = new SentryReporter(
    sentry,
    sentryConfig.max_events_per_run,
    logger,
  );

  logger.info("Sentry error reporting enabled");

  return {
    logger: new ReportingLogger(logger, reporter),
    reporter,
    failFast,
    flush: () => reporter.flush(),
  };
}
