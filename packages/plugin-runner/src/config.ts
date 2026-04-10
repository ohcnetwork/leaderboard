/**
 * Configuration loading and validation
 */

import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { join, resolve } from "path";
import { z } from "zod";

/**
 * Plugin configuration schema
 */
const PluginConfigSchema = z.object({
  name: z.string().optional(),
  source: z.string(), // Can be URL, file://, or package name like @leaderboard/plugin-dummy
  config: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Badge variant schema
 */
const BadgeVariantSchema = z.object({
  description: z.string(),
  svg_url: z.string(),
  order: z.number().optional(),
});

/**
 * Badge definition schema
 */
const BadgeDefinitionSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  variants: z.record(z.string(), BadgeVariantSchema),
});

/**
 * Badge rule schemas (snake_case keys for YAML convention)
 */
const ThresholdBadgeRuleConfigSchema = z.object({
  type: z.literal("threshold"),
  badge_slug: z.string(),
  enabled: z.boolean().default(true),
  aggregate_slug: z.string(),
  thresholds: z.array(
    z.object({
      variant: z.string(),
      value: z.number(),
    }),
  ),
});

const StreakBadgeRuleConfigSchema = z.object({
  type: z.literal("streak"),
  badge_slug: z.string(),
  enabled: z.boolean().default(true),
  streak_type: z.enum(["daily", "weekly", "monthly"]),
  activity_definitions: z.array(z.string()).optional(),
  thresholds: z.array(
    z.object({
      variant: z.string(),
      days: z.number(),
    }),
  ),
});

const GrowthBadgeRuleConfigSchema = z.object({
  type: z.literal("growth"),
  badge_slug: z.string(),
  enabled: z.boolean().default(true),
  aggregate_slug: z.string(),
  period: z.enum(["week", "month", "year"]),
  thresholds: z.array(
    z.object({
      variant: z.string(),
      percentage_increase: z.number(),
    }),
  ),
});

const CompositeBadgeRuleConfigSchema = z.object({
  type: z.literal("composite"),
  badge_slug: z.string(),
  enabled: z.boolean().default(true),
  operator: z.enum(["AND", "OR"]),
  conditions: z.array(
    z.object({
      aggregate_slug: z.string(),
      operator: z.enum([">", "<", ">=", "<=", "==", "!="]),
      value: z.number(),
    }),
  ),
  variant: z.string(),
});

const BadgeRuleConfigSchema = z.discriminatedUnion("type", [
  ThresholdBadgeRuleConfigSchema,
  StreakBadgeRuleConfigSchema,
  GrowthBadgeRuleConfigSchema,
  CompositeBadgeRuleConfigSchema,
]);

/**
 * Badges configuration schema
 */
const BadgesConfigSchema = z.object({
  definitions: z.array(BadgeDefinitionSchema).default([]),
  rules: z.array(BadgeRuleConfigSchema).default([]),
});

/**
 * Config schema
 */
export const ConfigSchema = z.object({
  org: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    logo_url: z.string().url(),
    start_date: z.string().optional(),
    socials: z.record(z.string(), z.string()).optional(),
  }),
  leaderboard: z.object({
    data_source: z.string().optional(),
    plugins: z.record(z.string(), PluginConfigSchema).optional(),
    badges: BadgesConfigSchema.optional(),
    leaderboard: z
      .object({
        all_contributors: z
          .object({
            activity_definitions: z.array(z.string()).optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;

/**
 * Substitute environment variables in config
 */
function substituteEnvVars(value: unknown): unknown {
  if (typeof value === "string") {
    // Match pattern: ${{ env.VAR_NAME }}
    const envPattern = /\$\{\{\s*env\.([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;
    return value.replace(envPattern, (match, varName) => {
      const envValue = process.env[varName];
      if (envValue === undefined) {
        console.warn(
          `Warning: Environment variable "${String(
            varName,
          )}" is not set; leaving placeholder "${match}" unchanged.`,
        );
        return match;
      }
      return envValue;
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => substituteEnvVars(item));
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = substituteEnvVars(val);
    }
    return result;
  }

  return value;
}

/**
 * Load and validate config.yaml
 */
export async function loadConfig(dataDir: string): Promise<Config> {
  // Resolve to absolute path
  const absoluteDataDir = resolve(dataDir);
  const configPath = join(absoluteDataDir, "config.yaml");
  const fileContents = await readFile(configPath, "utf8");

  let rawConfig = yaml.load(fileContents, {
    schema: yaml.JSON_SCHEMA,
  }) as unknown;

  // Substitute environment variables
  rawConfig = substituteEnvVars(rawConfig);

  // Validate with Zod
  const result = ConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.issues
      .map((err) => {
        const path = err.path.join(".") || "root";
        const message = err.message;
        return `  - ${path}: ${message}`;
      })
      .join("\n");
    throw new Error(
      `Configuration validation failed:\n${errors}\n\nPlease check your config.yaml file.`,
    );
  }

  return result.data;
}
