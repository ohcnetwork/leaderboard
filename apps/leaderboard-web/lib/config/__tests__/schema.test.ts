/**
 * Config schema validation tests
 */

import { describe, it, expect } from "vitest";
import { ConfigSchema, LeaderboardConfigSchema } from "../schema";

describe("ConfigSchema", () => {
  it("should validate a valid config", () => {
    const validConfig = {
      org: {
        name: "Test Org",
        description: "A test organization",
        url: "https://example.com",
        logo_url: "https://example.com/logo.png",
      },
      meta: {
        title: "Test Leaderboard",
        description: "Test leaderboard description",
        image_url: "https://example.com/image.png",
        site_url: "https://example.com",
        favicon_url: "https://example.com/favicon.ico",
      },
      leaderboard: {
        roles: {
          core: {
            name: "Core",
            description: "Core member",
          },
        },
      },
    };

    const result = ConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it("should reject invalid URLs", () => {
    const invalidConfig = {
      org: {
        name: "Test Org",
        description: "A test organization",
        url: "not-a-url",
        logo_url: "https://example.com/logo.png",
      },
      meta: {
        title: "Test",
        description: "Test",
        image_url: "https://example.com/image.png",
        site_url: "https://example.com",
        favicon_url: "https://example.com/favicon.ico",
      },
      leaderboard: {
        roles: {},
      },
    };

    const result = ConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it("should allow optional fields", () => {
    const configWithOptionals = {
      org: {
        name: "Test Org",
        description: "A test organization",
        url: "https://example.com",
        logo_url: "https://example.com/logo.png",
        start_date: "2020-01-01",
        socials: {
          github: "https://github.com/test",
          slack: "https://slack.com/test",
        },
      },
      meta: {
        title: "Test",
        description: "Test",
        image_url: "https://example.com/image.png",
        site_url: "https://example.com",
        favicon_url: "https://example.com/favicon.ico",
      },
      leaderboard: {
        data_source: "https://github.com/example-org/leaderboard-data",
        roles: {
          core: { name: "Core" },
        },
        plugins: {
          test: {
            source: "https://example.com/plugin.js",
            config: {
              apiKey: "test",
            },
          },
        },
      },
    };

    const result = ConfigSchema.safeParse(configWithOptionals);
    expect(result.success).toBe(true);
  });
});

describe("LeaderboardConfigSchema", () => {
  it("should validate plugins configuration", () => {
    const config = {
      roles: {
        core: { name: "Core" },
      },
      plugins: {
        github: {
          name: "GitHub Plugin",
          source: "https://example.com/manifest.js",
          config: {
            token: "test",
            org: "test-org",
          },
        },
      },
    };

    const result = LeaderboardConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.plugins?.github.source).toBe(
        "https://example.com/manifest.js"
      );
    }
  });

  it("should allow file:// URLs for plugin sources", () => {
    const config = {
      roles: {
        core: { name: "Core" },
      },
      plugins: {
        local: {
          source: "file://./plugins/local.js",
        },
      },
    };

    const result = LeaderboardConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("should validate role configuration with hidden flag", () => {
    const config = {
      roles: {
        bot: {
          name: "Bot",
          description: "Bot account",
          hidden: true,
        },
      },
    };

    const result = LeaderboardConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.roles.bot.hidden).toBe(true);
    }
  });
});
