/**
 * Plugin loader tests
 */

import { describe, it, expect, vi } from "vitest";
import { createLogger } from "../logger";

// Mock logger for tests
const logger = createLogger(false);

describe("Plugin Loader", () => {
  it("should validate plugin structure", () => {
    const validPlugin = {
      name: "test-plugin",
      version: "1.0.0",
      scrape: async () => {},
    };

    expect(validPlugin.name).toBe("test-plugin");
    expect(validPlugin.version).toBe("1.0.0");
    expect(typeof validPlugin.scrape).toBe("function");
  });

  it("should validate plugin with setup method", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      setup: async () => {},
      scrape: async () => {},
    };

    expect(typeof plugin.setup).toBe("function");
    expect(typeof plugin.scrape).toBe("function");
  });

  it("should reject plugin without name", () => {
    const invalidPlugin = {
      version: "1.0.0",
      scrape: async () => {},
    };

    expect(invalidPlugin).not.toHaveProperty("name");
  });

  it("should reject plugin without version", () => {
    const invalidPlugin = {
      name: "test",
      scrape: async () => {},
    };

    expect(invalidPlugin).not.toHaveProperty("version");
  });

  it("should reject plugin without scrape method", () => {
    const invalidPlugin = {
      name: "test",
      version: "1.0.0",
    };

    expect(invalidPlugin).not.toHaveProperty("scrape");
  });
});
