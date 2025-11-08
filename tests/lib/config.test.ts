import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getConfig, clearConfigCache } from "@/lib/config";
import {
  validConfig,
  minimalValidConfig,
  missingOrgFieldsConfig,
  missingMetaFieldsConfig,
  emptyRolesConfig,
  invalidUrlsConfig,
  invalidEmailConfig,
  invalidDateConfig,
  scraperMissingSourceConfig,
  invalidCronConfig,
  roleMissingNameConfig,
  additionalPropertiesConfig,
} from "../fixtures/configs";
import {
  backupConfig,
  restoreConfig,
  replaceConfigWith,
  setTestEnvVars,
  clearTestEnvVars,
  hasValidationError,
  extractErrorPaths,
} from "../utils/test-helpers";

describe("Config Validation", () => {
  let originalConfig: string | null;

  beforeEach(() => {
    // Backup original config
    originalConfig = backupConfig();
    // Clear cache before each test
    clearConfigCache();
  });

  afterEach(() => {
    // Restore original config
    restoreConfig(originalConfig);
    // Clear cache after each test
    clearConfigCache();
  });

  describe("Valid Configurations", () => {
    it("should load a complete valid configuration", () => {
      replaceConfigWith(validConfig);
      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.org.name).toBe("Test Organization");
      expect(config.meta.title).toBe("Test Leaderboard");
      expect(config.leaderboard.roles).toHaveProperty("admin");
      expect(config.scrapers).toHaveProperty("github");
    });

    it("should load a minimal valid configuration (only required fields)", () => {
      replaceConfigWith(minimalValidConfig);
      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.org.name).toBe("Minimal Org");
      expect(config.org.socials).toBeUndefined();
      expect(config.scrapers).toBeUndefined();
    });

    it("should cache the configuration on subsequent calls", () => {
      replaceConfigWith(validConfig);

      const config1 = getConfig();
      const config2 = getConfig();

      expect(config1).toBe(config2); // Same reference
    });

    it("should reload configuration after cache is cleared", () => {
      replaceConfigWith(validConfig);
      const config1 = getConfig();

      clearConfigCache();
      replaceConfigWith(minimalValidConfig);
      const config2 = getConfig();

      expect(config1.org.name).toBe("Test Organization");
      expect(config2.org.name).toBe("Minimal Org");
    });

    it("should accept configuration with optional socials", () => {
      const configWithSocials = {
        ...minimalValidConfig,
        org: {
          ...minimalValidConfig.org,
          socials: {
            github: "https://github.com/test",
            slack: "https://slack.test.org",
          },
        },
      };

      replaceConfigWith(configWithSocials);
      const config = getConfig();

      expect(config.org.socials?.github).toBe("https://github.com/test");
      expect(config.org.socials?.slack).toBe("https://slack.test.org");
    });

    it("should accept configuration with optional start_date", () => {
      const configWithDate = {
        ...minimalValidConfig,
        org: {
          ...minimalValidConfig.org,
          start_date: "2020-01-01",
        },
      };

      replaceConfigWith(configWithDate);
      const config = getConfig();

      expect(config.org.start_date).toBe("2020-01-01");
    });

    it("should accept multiple roles", () => {
      const configWithMultipleRoles = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          roles: {
            admin: { name: "Admin", description: "Administrator" },
            contributor: { name: "Contributor" },
            viewer: { name: "Viewer", description: "Read-only access" },
          },
        },
      };

      replaceConfigWith(configWithMultipleRoles);
      const config = getConfig();

      expect(Object.keys(config.leaderboard.roles)).toHaveLength(3);
      expect(config.leaderboard.roles.admin.name).toBe("Admin");
      expect(config.leaderboard.roles.contributor.description).toBeUndefined();
    });

    it("should accept scrapers with only required source field", () => {
      const configWithMinimalScraper = {
        ...minimalValidConfig,
        scrapers: {
          custom: {
            source: "https://github.com/test/scraper",
          },
        },
      };

      replaceConfigWith(configWithMinimalScraper);
      const config = getConfig();

      expect(config.scrapers?.custom.source).toBe(
        "https://github.com/test/scraper"
      );
      expect(config.scrapers?.custom.cron).toBeUndefined();
    });

    it("should accept scrapers with cron expression", () => {
      const configWithCron = {
        ...minimalValidConfig,
        scrapers: {
          scheduled: {
            source: "./local/scraper",
            cron: "0 0 * * *",
          },
        },
      };

      replaceConfigWith(configWithCron);
      const config = getConfig();

      expect(config.scrapers?.scheduled.cron).toBe("0 0 * * *");
    });

    it("should accept scrapers with custom attributes", () => {
      const configWithCustomAttrs = {
        ...minimalValidConfig,
        scrapers: {
          github: {
            source: "https://github.com/test/scraper",
            org: "testorg",
            token: "${{ GITHUB_TOKEN }}",
            custom_field: "custom_value",
          },
        },
      };

      replaceConfigWith(configWithCustomAttrs);
      const config = getConfig();

      expect(config.scrapers?.github.org).toBe("testorg");
      expect(config.scrapers?.github.token).toBe("${{ GITHUB_TOKEN }}");
      expect(config.scrapers?.github.custom_field).toBe("custom_value");
    });

    it("should accept various valid cron expressions", () => {
      const validCronExpressions = [
        "0 0 * * *", // Standard 5-field
        "0 0 0 * * *", // 6-field with seconds
        "*/5 * * * *", // Every 5 minutes
        "0 0 1 * *", // First day of month
        "@daily", // Named schedule
        "@hourly", // Named schedule
        "@weekly", // Named schedule
      ];

      for (const cron of validCronExpressions) {
        clearConfigCache();
        const configWithCron = {
          ...minimalValidConfig,
          scrapers: {
            test: {
              source: "./scraper",
              cron,
            },
          },
        };

        replaceConfigWith(configWithCron);
        expect(() => getConfig()).not.toThrow();
      }
    });
  });

  describe("Invalid Configurations - Missing Required Fields", () => {
    it("should reject configuration with missing org required fields", () => {
      replaceConfigWith(missingOrgFieldsConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("/org");
        expect(message).toContain("description");
        expect(message).toContain("url");
        expect(message).toContain("logo_url");
      }
    });

    it("should reject configuration with missing meta required fields", () => {
      replaceConfigWith(missingMetaFieldsConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("/meta");
        expect(message).toContain("description");
        expect(message).toContain("image_url");
        expect(message).toContain("site_url");
        expect(message).toContain("favicon_url");
      }
    });

    it("should reject configuration with empty roles", () => {
      replaceConfigWith(emptyRolesConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(
          hasValidationError(message, "/leaderboard/roles", "fewer than 1")
        ).toBe(true);
      }
    });

    it("should reject configuration with role missing name field", () => {
      replaceConfigWith(roleMissingNameConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(
          hasValidationError(message, "/leaderboard/roles/admin", "name")
        ).toBe(true);
      }
    });

    it("should reject configuration with scraper missing source field", () => {
      replaceConfigWith(scraperMissingSourceConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(hasValidationError(message, "/scrapers/github", "source")).toBe(
          true
        );
      }
    });

    it("should reject configuration missing top-level required sections", () => {
      const missingTopLevel = {
        org: {
          name: "Test",
          description: "Test",
          url: "https://test.org",
          logo_url: "https://test.org/logo.png",
        },
        // Missing: meta, leaderboard
      };

      replaceConfigWith(missingTopLevel);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("meta");
        expect(message).toContain("leaderboard");
      }
    });
  });

  describe("Invalid Configurations - Format Validation", () => {
    it("should reject configuration with invalid URLs", () => {
      replaceConfigWith(invalidUrlsConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        const errorPaths = extractErrorPaths(message);

        // Should have multiple URL format errors
        expect(errorPaths.length).toBeGreaterThan(0);
        expect(message).toContain("format");
      }
    });

    it("should reject configuration with invalid email format", () => {
      replaceConfigWith(invalidEmailConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(
          hasValidationError(message, "/org/socials/email", "format")
        ).toBe(true);
      }
    });

    it("should reject configuration with invalid date format", () => {
      replaceConfigWith(invalidDateConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(hasValidationError(message, "/org/start_date", "format")).toBe(
          true
        );
      }
    });

    it("should reject configuration with invalid cron expression", () => {
      replaceConfigWith(invalidCronConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(
          hasValidationError(message, "/scrapers/github/cron", "pattern")
        ).toBe(true);
      }
    });
  });

  describe("Invalid Configurations - Additional Properties", () => {
    it("should reject configuration with unexpected fields in org", () => {
      replaceConfigWith(additionalPropertiesConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("additional");
      }
    });

    it("should reject configuration with unexpected top-level fields", () => {
      const configWithExtra = {
        ...minimalValidConfig,
        unexpected_field: "should not be here",
      };

      replaceConfigWith(configWithExtra);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);
    });
  });

  describe("Environment Variable Substitution", () => {
    it("should substitute environment variables in scraper config", () => {
      setTestEnvVars({
        GITHUB_TOKEN: "test-token-123",
        SLACK_API_KEY: "test-key-456",
      });

      replaceConfigWith(validConfig);
      const config = getConfig();

      expect(config.scrapers?.github?.token).toBe("test-token-123");
      expect(config.scrapers?.slack?.api_key).toBe("test-key-456");

      clearTestEnvVars(["GITHUB_TOKEN", "SLACK_API_KEY"]);
    });

    it("should keep template variable if env var is not set", () => {
      // Make sure env vars are not set
      clearTestEnvVars(["GITHUB_TOKEN", "SLACK_API_KEY"]);

      replaceConfigWith(validConfig);
      const config = getConfig();

      expect(config.scrapers?.github?.token).toBe("${{ GITHUB_TOKEN }}");
      expect(config.scrapers?.slack?.api_key).toBe("${{ SLACK_API_KEY }}");
    });

    it("should substitute env vars recursively", () => {
      setTestEnvVars({
        TEST_VAR: "substituted-value",
      });

      const configWithEnvVar = {
        ...minimalValidConfig,
        scrapers: {
          test: {
            source: "./scraper",
            value: "${{ TEST_VAR }}",
          },
        },
      };

      replaceConfigWith(configWithEnvVar);
      const config = getConfig();

      expect(config.scrapers?.test?.value).toBe("substituted-value");

      clearTestEnvVars(["TEST_VAR"]);
    });

    it("should handle env vars with underscores and numbers", () => {
      setTestEnvVars({
        API_KEY_V2: "key-v2",
        TOKEN_123: "token-123",
      });

      const configWithComplexEnvVars = {
        ...minimalValidConfig,
        scrapers: {
          test_one: {
            source: "./scraper",
            key: "${{ API_KEY_V2 }}",
          },
          test_two: {
            source: "./scraper",
            token: "${{ TOKEN_123 }}",
          },
        },
      };

      replaceConfigWith(configWithComplexEnvVars);
      const config = getConfig();

      expect(config.scrapers?.test_one?.key).toBe("key-v2");
      expect(config.scrapers?.test_two?.token).toBe("token-123");

      clearTestEnvVars(["API_KEY_V2", "TOKEN_123"]);
    });

    it("should not substitute partial matches", () => {
      const configWithPartialMatch = {
        ...minimalValidConfig,
        scrapers: {
          test: {
            source: "./scraper",
            value1: "prefix ${{ VAR }} suffix",
            value2: "${{VAR}}",
            value3: "${{ VAR",
          },
        },
      };

      replaceConfigWith(configWithPartialMatch);
      const config = getConfig();

      // These should not be substituted as they don't match the exact pattern
      expect(config.scrapers?.test?.value1).toBe("prefix ${{ VAR }} suffix");
      expect(config.scrapers?.test?.value2).toBe("${{VAR}}");
      expect(config.scrapers?.test?.value3).toBe("${{ VAR");
    });
  });

  describe("Scraper Configuration Validation", () => {
    it("should accept scraper with git URL source", () => {
      const configWithGitSource = {
        ...minimalValidConfig,
        scrapers: {
          remote: {
            source: "https://github.com/org/scraper",
          },
        },
      };

      replaceConfigWith(configWithGitSource);
      const config = getConfig();

      expect(config.scrapers?.remote.source).toBe(
        "https://github.com/org/scraper"
      );
    });

    it("should accept scraper with local path source", () => {
      const configWithLocalSource = {
        ...minimalValidConfig,
        scrapers: {
          local: {
            source: "./scrapers/custom",
          },
        },
      };

      replaceConfigWith(configWithLocalSource);
      const config = getConfig();

      expect(config.scrapers?.local.source).toBe("./scrapers/custom");
    });

    it("should accept multiple scrapers with different configurations", () => {
      const configWithMultipleScrapers = {
        ...minimalValidConfig,
        scrapers: {
          github: {
            source: "https://github.com/org/github-scraper",
            cron: "0 0 * * *",
            org: "testorg",
          },
          slack: {
            source: "./scrapers/slack",
            api_key: "test-key",
          },
          custom: {
            source: "https://github.com/org/custom",
            cron: "@daily",
            custom_attr1: "value1",
            custom_attr2: "value2",
          },
        },
      };

      replaceConfigWith(configWithMultipleScrapers);
      const config = getConfig();

      expect(Object.keys(config.scrapers!)).toHaveLength(3);
      expect(config.scrapers?.github.cron).toBe("0 0 * * *");
      expect(config.scrapers?.slack.cron).toBeUndefined();
      expect(config.scrapers?.custom.custom_attr1).toBe("value1");
    });

    it("should validate scraper key format (lowercase with underscores)", () => {
      const configWithInvalidKey = {
        ...minimalValidConfig,
        scrapers: {
          "Invalid-Key": {
            source: "./scraper",
          },
        },
      };

      replaceConfigWith(configWithInvalidKey);

      // This should fail because scraper keys must match ^[a-z_]+$
      expect(() => getConfig()).toThrow(/Configuration validation failed/);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty scrapers object", () => {
      const configWithEmptyScrapers = {
        ...minimalValidConfig,
        scrapers: {},
      };

      replaceConfigWith(configWithEmptyScrapers);
      const config = getConfig();

      expect(config.scrapers).toBeDefined();
      expect(Object.keys(config.scrapers!)).toHaveLength(0);
    });

    it("should handle role with empty description", () => {
      const configWithEmptyDescription = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          roles: {
            user: {
              name: "User",
              description: "",
            },
          },
        },
      };

      replaceConfigWith(configWithEmptyDescription);
      const config = getConfig();

      expect(config.leaderboard.roles.user.description).toBe("");
    });

    it("should preserve special characters in string values", () => {
      const configWithSpecialChars = {
        ...minimalValidConfig,
        org: {
          ...minimalValidConfig.org,
          description: 'Test & Co. <Special> "Chars"',
        },
      };

      replaceConfigWith(configWithSpecialChars);
      const config = getConfig();

      expect(config.org.description).toBe('Test & Co. <Special> "Chars"');
    });

    it("should handle very long string values", () => {
      const longDescription = "A".repeat(10000);
      const configWithLongString = {
        ...minimalValidConfig,
        org: {
          ...minimalValidConfig.org,
          description: longDescription,
        },
      };

      replaceConfigWith(configWithLongString);
      const config = getConfig();

      expect(config.org.description).toBe(longDescription);
      expect(config.org.description.length).toBe(10000);
    });
  });
});
