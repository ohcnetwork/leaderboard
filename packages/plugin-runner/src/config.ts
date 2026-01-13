/**
 * Configuration loading and validation
 */

import { readFile } from "fs/promises";
import { join, resolve } from "path";
import yaml from "js-yaml";
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
    const envPattern = /\$\{\{\s*env\.([A-Z_][A-Z0-9_]*)\s*\}\}/g;
    return value.replace(envPattern, (match, varName) => {
      const envValue = process.env[varName];
      if (envValue === undefined) {
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
      `Configuration validation failed:\n${errors}\n\nPlease check your config.yaml file.`
    );
  }

  return result.data;
}
