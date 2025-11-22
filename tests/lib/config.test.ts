import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getConfig,
  clearConfigCache,
  getHiddenRoles,
  getVisibleRoles,
} from "@/lib/config";
import {
  validConfig,
  minimalValidConfig,
  missingOrgFieldsConfig,
  missingMetaFieldsConfig,
  emptyRolesConfig,
  invalidUrlsConfig,
  invalidEmailConfig,
  invalidDateConfig,
  scraperInstanceMissingSourceConfig,
  invalidSourceFormatConfig,
  roleMissingNameConfig,
  additionalPropertiesConfig,
  invalidThemeConfig,
} from "../fixtures/configs";
import {
  backupConfig,
  restoreConfig,
  replaceConfigWith,
  hasValidationError,
  extractErrorPaths,
} from "../utils/test-helpers";
import { Config } from "@/types/config";

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
      expect(config.leaderboard.scrapers).toBeDefined();
      expect(Object.keys(config.leaderboard.scrapers!)).toHaveLength(2);
      expect(config.leaderboard.scrapers!.github).toBeDefined();
      expect(config.leaderboard.scrapers!.slack).toBeDefined();
    });

    it("should load a minimal valid configuration (only required fields)", () => {
      replaceConfigWith(minimalValidConfig);
      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.org.name).toBe("Minimal Org");
      expect(config.org.socials).toBeUndefined();
      expect(config.leaderboard.scrapers).toBeUndefined();
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
      expect(config.leaderboard.roles.admin?.name).toBe("Admin");
      expect(config.leaderboard.roles.contributor?.description).toBeUndefined();
    });

    it("should accept roles with hidden property", () => {
      const configWithHiddenRoles = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          roles: {
            admin: { name: "Admin", description: "Administrator" },
            bot: { name: "Bot", description: "Bot account", hidden: true },
            contributor: { name: "Contributor" },
          },
        },
      };

      replaceConfigWith(configWithHiddenRoles);
      const config = getConfig();

      expect(config.leaderboard.roles.bot?.hidden).toBe(true);
      expect(config.leaderboard.roles.admin?.hidden).toBeUndefined();
      expect(config.leaderboard.roles.contributor?.hidden).toBeUndefined();
    });

    it("should correctly identify hidden roles", () => {
      const configWithHiddenRoles = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          roles: {
            admin: { name: "Admin" },
            bot: { name: "Bot", hidden: true },
            test: { name: "Test", hidden: true },
            contributor: { name: "Contributor" },
          },
        },
      };

      replaceConfigWith(configWithHiddenRoles);
      const hiddenRoles = getHiddenRoles();
      const visibleRoles = getVisibleRoles();

      expect(hiddenRoles).toEqual(["bot", "test"]);
      expect(visibleRoles).toEqual(["admin", "contributor"]);
    });

    it("should return empty array when no hidden roles exist", () => {
      replaceConfigWith(minimalValidConfig);
      const hiddenRoles = getHiddenRoles();

      expect(hiddenRoles).toEqual([]);
    });

    it("should accept configuration with valid theme URL", () => {
      const configWithTheme = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          theme: "https://cdn.example.com/theme.css",
        },
      };

      replaceConfigWith(configWithTheme);
      const config = getConfig();

      expect(config.leaderboard.theme).toBe(
        "https://cdn.example.com/theme.css"
      );
    });

    it("should accept configuration without theme (optional field)", () => {
      replaceConfigWith(minimalValidConfig);
      const config = getConfig();

      expect(config.leaderboard.theme).toBeUndefined();
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

    it("should reject configuration with invalid theme URL format", () => {
      replaceConfigWith(invalidThemeConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(
          hasValidationError(message, "/leaderboard/theme", "format")
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

  describe("Scraper Configuration Validation", () => {
    it("should accept valid scraper configuration", () => {
      replaceConfigWith(validConfig);
      const config = getConfig();

      expect(config.leaderboard.scrapers).toBeDefined();
      expect(Object.keys(config.leaderboard.scrapers!)).toHaveLength(2);
      expect(config.leaderboard.scrapers!.github?.name).toBe("GitHub Scraper");
      expect(config.leaderboard.scrapers!.github?.source).toBe(
        "testorg/github-scraper"
      );
      expect(config.leaderboard.scrapers!.github?.config).toHaveProperty(
        "GITHUB_TOKEN"
      );
    });

    it("should accept multiple scrapers", () => {
      replaceConfigWith(validConfig);
      const config = getConfig();

      expect(Object.keys(config.leaderboard.scrapers!)).toHaveLength(2);
      expect(config.leaderboard.scrapers!.github?.name).toBe("GitHub Scraper");
      expect(config.leaderboard.scrapers!.slack?.name).toBe("Slack Scraper");
    });

    it("should accept various valid source formats", () => {
      const validSources = [
        "testorg/scraper", // GitHub org/repo
        "https://github.com/testorg/scraper.git", // HTTPS git URL
        "git://github.com/testorg/scraper.git", // Git protocol URL
        "http://example.com/scraper.tar.gz", // HTTP tarball
        "https://example.com/scraper.tgz", // HTTPS tarball
        "file:///path/to/scraper", // File URL
      ];

      for (const source of validSources) {
        clearConfigCache();
        const configWithSource = {
          ...minimalValidConfig,
          leaderboard: {
            ...minimalValidConfig.leaderboard,
            scrapers: {
              test: {
                name: "Test Scraper",
                source: source,
                config: {
                  TOKEN: "${{ env.TOKEN }}",
                },
              },
            },
          },
        };

        replaceConfigWith(configWithSource);
        expect(() => getConfig()).not.toThrow();
      }
    });

    it("should reject scraper instance missing required source field", () => {
      replaceConfigWith(scraperInstanceMissingSourceConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("/leaderboard/scrapers/test");
        expect(message).toContain("source");
      }
    });

    it("should reject invalid source format", () => {
      replaceConfigWith(invalidSourceFormatConfig);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("/leaderboard/scrapers/test/source");
      }
    });

    it("should accept scraper without name (optional field)", () => {
      const configWithoutName = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              source: "testorg/scraper",
              config: {
                TOKEN: "${{ env.TOKEN }}",
              },
            },
          },
        },
      };

      replaceConfigWith(configWithoutName);
      const config = getConfig();

      expect(config.leaderboard.scrapers?.test?.name).toBeUndefined();
      expect(config.leaderboard.scrapers?.test?.source).toBe("testorg/scraper");
    });

    it("should accept scraper without config (optional field)", () => {
      const configWithoutConfig = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              name: "Test Scraper",
              source: "testorg/scraper",
            },
          },
        },
      };

      replaceConfigWith(configWithoutConfig);
      const config = getConfig();

      expect(config.leaderboard.scrapers?.test?.config).toBeUndefined();
    });
  });

  describe("Social Profiles Configuration Validation", () => {
    it("should accept valid social profiles configuration", () => {
      const configWithSocialProfiles = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          social_profiles: {
            github: { icon: "github" },
            linkedin: { icon: "linkedin" },
            twitter: { icon: "twitter" },
          },
        },
      };

      replaceConfigWith(configWithSocialProfiles);
      const config = getConfig();

      expect(config.leaderboard.social_profiles).toBeDefined();
      expect(config.leaderboard.social_profiles?.github?.icon).toBe("github");
      expect(config.leaderboard.social_profiles?.linkedin?.icon).toBe(
        "linkedin"
      );
      expect(config.leaderboard.social_profiles?.twitter?.icon).toBe("twitter");
    });

    it("should accept empty social profiles object", () => {
      const configWithEmptySocialProfiles = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          social_profiles: {},
        },
      };

      replaceConfigWith(configWithEmptySocialProfiles);
      const config = getConfig();

      expect(config.leaderboard.social_profiles).toBeDefined();
      expect(Object.keys(config.leaderboard.social_profiles!)).toHaveLength(0);
    });

    it("should accept social profiles with various icon names", () => {
      const configWithVariousIcons = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          social_profiles: {
            email: { icon: "mail" },
            website: { icon: "globe" },
            blog: { icon: "rss" },
          },
        },
      };

      replaceConfigWith(configWithVariousIcons);
      const config = getConfig();

      expect(config.leaderboard.social_profiles?.email?.icon).toBe("mail");
      expect(config.leaderboard.social_profiles?.website?.icon).toBe("globe");
      expect(config.leaderboard.social_profiles?.blog?.icon).toBe("rss");
    });

    it("should reject social profile with missing icon field", () => {
      const configWithMissingIcon = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          social_profiles: {
            github: {},
          },
        },
      };

      replaceConfigWith(configWithMissingIcon);

      expect(() => getConfig()).toThrow(/Configuration validation failed/);

      try {
        getConfig();
      } catch (error) {
        const message = (error as Error).message;
        expect(
          hasValidationError(
            message,
            "/leaderboard/social_profiles/github",
            "icon"
          )
        ).toBe(true);
      }
    });

    it("should reject social profile with invalid key format", () => {
      const configWithInvalidKey = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          social_profiles: {
            "Invalid-Key": { icon: "link" },
          },
        },
      };

      replaceConfigWith(configWithInvalidKey);

      // This should fail because social profile keys must match ^[a-z_]+$
      expect(() => getConfig()).toThrow(/Configuration validation failed/);
    });

    it("should accept social profiles with underscores in keys", () => {
      const configWithUnderscores = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          social_profiles: {
            stack_overflow: { icon: "layers" },
            dev_to: { icon: "code" },
          },
        },
      };

      replaceConfigWith(configWithUnderscores);
      const config = getConfig();

      expect(config.leaderboard.social_profiles?.stack_overflow?.icon).toBe(
        "layers"
      );
      expect(config.leaderboard.social_profiles?.dev_to?.icon).toBe("code");
    });
  });

  describe("Environment Variable Substitution", () => {
    it("should substitute environment variables in config", () => {
      process.env.TEST_TOKEN = "test-token-value";
      process.env.TEST_ORG = "test-org";

      const configWithEnvVars = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              name: "Test Scraper",
              source: "testorg/scraper",
              config: {
                token: "${{ env.TEST_TOKEN }}",
                org: "${{ env.TEST_ORG }}",
              },
            },
          },
        },
      };

      replaceConfigWith(configWithEnvVars);
      const config = getConfig();

      expect(config.leaderboard.scrapers?.test?.config?.token).toBe(
        "test-token-value"
      );
      expect(config.leaderboard.scrapers?.test?.config?.org).toBe("test-org");

      delete process.env.TEST_TOKEN;
      delete process.env.TEST_ORG;
    });

    it("should handle nested environment variable substitution", () => {
      process.env.NESTED_VAR = "nested-value";

      const configWithNestedEnvVars = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              name: "Test Scraper",
              source: "testorg/scraper",
              config: {
                nested: {
                  deep: {
                    value: "${{ env.NESTED_VAR }}",
                  },
                },
              },
            },
          },
        },
      };

      replaceConfigWith(configWithNestedEnvVars);
      const config = getConfig();

      expect(
        (config.leaderboard.scrapers?.test?.config?.nested as any)?.deep?.value
      ).toBe("nested-value");

      delete process.env.NESTED_VAR;
    });

    it("should handle environment variables in arrays", () => {
      process.env.ARRAY_VAR = "array-value";

      const configWithArrayEnvVars = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              name: "Test Scraper",
              source: "testorg/scraper",
              config: {
                items: ["static", "${{ env.ARRAY_VAR }}", "another"],
              },
            },
          },
        },
      };

      replaceConfigWith(configWithArrayEnvVars);
      const config = getConfig();

      expect(config.leaderboard.scrapers?.test?.config?.items).toEqual([
        "static",
        "array-value",
        "another",
      ]);

      delete process.env.ARRAY_VAR;
    });

    it("should keep placeholder when environment variable is not set", () => {
      const configWithMissingEnvVar = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              name: "Test Scraper",
              source: "testorg/scraper",
              config: {
                token: "${{ env.MISSING_VAR }}",
              },
            },
          },
        },
      };

      replaceConfigWith(configWithMissingEnvVar);
      const config = getConfig();

      expect(config.leaderboard.scrapers?.test?.config?.token).toBe(
        "${{ env.MISSING_VAR }}"
      );
    });

    it("should not modify non-env-var strings", () => {
      const configWithoutEnvVars = {
        ...minimalValidConfig,
        leaderboard: {
          ...minimalValidConfig.leaderboard,
          scrapers: {
            test: {
              name: "Test Scraper",
              source: "testorg/scraper",
              config: {
                normalString: "just a normal string",
                withBraces: "{{ not an env var }}",
                partial: "${{ secrets.TOKEN }}",
              },
            },
          },
        },
      };

      replaceConfigWith(configWithoutEnvVars);
      const config = getConfig();

      expect(config.leaderboard.scrapers?.test?.config?.normalString).toBe(
        "just a normal string"
      );
      expect(config.leaderboard.scrapers?.test?.config?.withBraces).toBe(
        "{{ not an env var }}"
      );
      expect(config.leaderboard.scrapers?.test?.config?.partial).toBe(
        "${{ secrets.TOKEN }}"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle configuration without scraper section", () => {
      replaceConfigWith(minimalValidConfig);
      const config = getConfig();

      expect(config.leaderboard.scrapers).toBeUndefined();
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

      expect(config.leaderboard.roles.user?.description).toBe("");
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

describe("Aggregates Configuration", () => {
  let originalConfig: string | null;

  beforeEach(() => {
    originalConfig = backupConfig();
    clearConfigCache();
  });

  afterEach(() => {
    restoreConfig(originalConfig);
    clearConfigCache();
  });

  it("should accept valid aggregates configuration", () => {
    const configWithAggregates: Config = {
      ...minimalValidConfig,
      leaderboard: {
        ...minimalValidConfig.leaderboard,
        aggregates: {
          global: ["total_activities", "count_contributors", "pr_avg_tat"],
          contributor: ["total_points", "total_activities", "eod_consistency"],
        },
      },
    };

    replaceConfigWith(configWithAggregates);
    expect(() => getConfig()).not.toThrow();
    const config = getConfig();
    expect(config.leaderboard.aggregates).toBeDefined();
    expect(config.leaderboard.aggregates?.global).toEqual([
      "total_activities",
      "count_contributors",
      "pr_avg_tat",
    ]);
    expect(config.leaderboard.aggregates?.contributor).toEqual([
      "total_points",
      "total_activities",
      "eod_consistency",
    ]);
  });

  it("should accept config without aggregates (optional)", () => {
    replaceConfigWith(minimalValidConfig);
    expect(() => getConfig()).not.toThrow();
    const config = getConfig();
    expect(config.leaderboard.aggregates).toBeUndefined();
  });

  it("should accept empty aggregates arrays", () => {
    const configWithEmptyAggregates: Config = {
      ...minimalValidConfig,
      leaderboard: {
        ...minimalValidConfig.leaderboard,
        aggregates: {
          global: [],
          contributor: [],
        },
      },
    };

    replaceConfigWith(configWithEmptyAggregates);
    expect(() => getConfig()).not.toThrow();
    const config = getConfig();
    expect(config.leaderboard.aggregates?.global).toEqual([]);
    expect(config.leaderboard.aggregates?.contributor).toEqual([]);
  });

  it("should enforce unique items in aggregate arrays", () => {
    const configWithDuplicates = {
      ...minimalValidConfig,
      leaderboard: {
        ...minimalValidConfig.leaderboard,
        aggregates: {
          global: ["total_activities", "total_activities", "pr_avg_tat"],
          contributor: ["total_points", "total_points"],
        },
      },
    };

    replaceConfigWith(configWithDuplicates);
    expect(() => getConfig()).toThrow();
  });

  it("should reject invalid aggregate types", () => {
    const configWithInvalidType = {
      ...minimalValidConfig,
      leaderboard: {
        ...minimalValidConfig.leaderboard,
        aggregates: {
          global: [123, "total_activities"], // number instead of string
        },
      },
    };

    replaceConfigWith(configWithInvalidType);
    expect(() => getConfig()).toThrow();
  });

  it("should accept only global aggregates", () => {
    const configWithOnlyGlobal: Config = {
      ...minimalValidConfig,
      leaderboard: {
        ...minimalValidConfig.leaderboard,
        aggregates: {
          global: ["total_activities", "pr_avg_tat"],
        },
      },
    };

    replaceConfigWith(configWithOnlyGlobal);
    expect(() => getConfig()).not.toThrow();
    const config = getConfig();
    expect(config.leaderboard.aggregates?.global).toEqual([
      "total_activities",
      "pr_avg_tat",
    ]);
    expect(config.leaderboard.aggregates?.contributor).toBeUndefined();
  });

  it("should accept only contributor aggregates", () => {
    const configWithOnlyContributor: Config = {
      ...minimalValidConfig,
      leaderboard: {
        ...minimalValidConfig.leaderboard,
        aggregates: {
          contributor: ["total_points", "eod_consistency"],
        },
      },
    };

    replaceConfigWith(configWithOnlyContributor);
    expect(() => getConfig()).not.toThrow();
    const config = getConfig();
    expect(config.leaderboard.aggregates?.global).toBeUndefined();
    expect(config.leaderboard.aggregates?.contributor).toEqual([
      "total_points",
      "eod_consistency",
    ]);
  });
});
