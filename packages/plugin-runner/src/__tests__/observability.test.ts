/**
 * Observability initialisation tests
 */

import { describe, expect, it, vi } from "vitest";
import { createLogger } from "../logger";
import { initObservability } from "../observability";

const logger = createLogger(false);

describe("initObservability", () => {
  it("returns the original logger when no observability config is set", async () => {
    const result = await initObservability(undefined, logger);

    expect(result.logger).toBe(logger);
    expect(result.reporter).toBeUndefined();
    expect(result.failFast).toBe(false);
  });

  it("stays disabled when the DSN is an unresolved env placeholder", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});

    const result = await initObservability(
      {
        fail_fast: false,
        sentry: {
          dsn: "${{ env.SENTRY_DSN }}",
          enabled: true,
          traces_sample_rate: 0,
          max_events_per_run: 100,
        },
      },
      logger,
    );

    expect(result.logger).toBe(logger);
    expect(result.reporter).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("unresolved placeholder"),
    );

    warn.mockRestore();
  });

  it("stays disabled when sentry is explicitly disabled", async () => {
    const result = await initObservability(
      {
        fail_fast: true,
        sentry: {
          dsn: "https://key@example.ingest.sentry.io/1",
          enabled: false,
          traces_sample_rate: 0,
          max_events_per_run: 100,
        },
      },
      logger,
    );

    expect(result.logger).toBe(logger);
    expect(result.failFast).toBe(true);
  });

  it("propagates fail_fast without any sentry config", async () => {
    const result = await initObservability({ fail_fast: true }, logger);

    expect(result.failFast).toBe(true);
  });
});
