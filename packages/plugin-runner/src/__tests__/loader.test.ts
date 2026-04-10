/**
 * Plugin loader tests
 */

import type { Plugin } from "@ohcnetwork/leaderboard-api";
import { describe, expect, it } from "vitest";

// Re-create validatePlugin logic for testing since it's not exported
function validatePlugin(plugin: unknown): asserts plugin is Plugin {
  if (typeof plugin !== "object" || plugin === null) {
    throw new Error("Plugin must be an object");
  }

  const p = plugin as Record<string, unknown>;

  if (typeof p.name !== "string" || !p.name) {
    throw new Error("Plugin must have a 'name' string property");
  }

  if (typeof p.version !== "string" || !p.version) {
    throw new Error("Plugin must have a 'version' string property");
  }

  if (typeof p.scrape !== "function") {
    throw new Error("Plugin must have a 'scrape' function");
  }

  if (p.setup !== undefined && typeof p.setup !== "function") {
    throw new Error("Plugin 'setup' must be a function if provided");
  }

  if (p.aggregate !== undefined && typeof p.aggregate !== "function") {
    throw new Error("Plugin 'aggregate' must be a function if provided");
  }

  if (p.badgeDefinitions !== undefined && !Array.isArray(p.badgeDefinitions)) {
    throw new Error("Plugin 'badgeDefinitions' must be an array if provided");
  }

  if (p.badgeRules !== undefined && !Array.isArray(p.badgeRules)) {
    throw new Error("Plugin 'badgeRules' must be an array if provided");
  }
}

describe("Plugin Loader", () => {
  it("should validate a minimal plugin structure", () => {
    const validPlugin = {
      name: "test-plugin",
      version: "1.0.0",
      scrape: async () => {},
    };

    expect(() => validatePlugin(validPlugin)).not.toThrow();
  });

  it("should validate plugin with setup method", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      setup: async () => {},
      scrape: async () => {},
    };

    expect(() => validatePlugin(plugin)).not.toThrow();
  });

  it("should validate plugin with aggregate method", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      scrape: async () => {},
      aggregate: async () => {},
    };

    expect(() => validatePlugin(plugin)).not.toThrow();
  });

  it("should validate plugin with all optional methods", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      setup: async () => {},
      scrape: async () => {},
      aggregate: async () => {},
    };

    expect(() => validatePlugin(plugin)).not.toThrow();
  });

  it("should validate plugin with badgeDefinitions", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      scrape: async () => {},
      badgeDefinitions: [
        {
          slug: "test-badge",
          name: "Test Badge",
          description: "A test badge",
          variants: { bronze: { description: "Bronze", svg_url: "" } },
        },
      ],
    };

    expect(() => validatePlugin(plugin)).not.toThrow();
  });

  it("should validate plugin with badgeRules", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      scrape: async () => {},
      badgeRules: [
        {
          type: "threshold",
          badgeSlug: "test-badge",
          enabled: true,
          aggregateSlug: "activity_count",
          thresholds: [{ variant: "bronze", value: 10 }],
        },
      ],
    };

    expect(() => validatePlugin(plugin)).not.toThrow();
  });

  it("should reject plugin without name", () => {
    const invalidPlugin = {
      version: "1.0.0",
      scrape: async () => {},
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin must have a 'name' string property",
    );
  });

  it("should reject plugin without version", () => {
    const invalidPlugin = {
      name: "test",
      scrape: async () => {},
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin must have a 'version' string property",
    );
  });

  it("should reject plugin without scrape method", () => {
    const invalidPlugin = {
      name: "test",
      version: "1.0.0",
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin must have a 'scrape' function",
    );
  });

  it("should reject non-object plugin", () => {
    expect(() => validatePlugin(null)).toThrow("Plugin must be an object");
    expect(() => validatePlugin("string")).toThrow("Plugin must be an object");
    expect(() => validatePlugin(42)).toThrow("Plugin must be an object");
  });

  it("should reject plugin with non-function setup", () => {
    const invalidPlugin = {
      name: "test",
      version: "1.0.0",
      scrape: async () => {},
      setup: "not-a-function",
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin 'setup' must be a function if provided",
    );
  });

  it("should reject plugin with non-function aggregate", () => {
    const invalidPlugin = {
      name: "test",
      version: "1.0.0",
      scrape: async () => {},
      aggregate: "not-a-function",
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin 'aggregate' must be a function if provided",
    );
  });

  it("should reject plugin with non-array badgeDefinitions", () => {
    const invalidPlugin = {
      name: "test",
      version: "1.0.0",
      scrape: async () => {},
      badgeDefinitions: "not-an-array",
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin 'badgeDefinitions' must be an array if provided",
    );
  });

  it("should reject plugin with non-array badgeRules", () => {
    const invalidPlugin = {
      name: "test",
      version: "1.0.0",
      scrape: async () => {},
      badgeRules: "not-an-array",
    };

    expect(() => validatePlugin(invalidPlugin)).toThrow(
      "Plugin 'badgeRules' must be an array if provided",
    );
  });
});
