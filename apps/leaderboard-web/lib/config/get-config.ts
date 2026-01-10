import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { Config, ConfigSchema } from "@/lib/config/schema";
import { dataDir } from "@ohcnetwork/leaderboard-api";

let cachedConfig: Config | null = null;

/**
 * Substitutes environment variables in the format ${{ env.VAR_NAME }}
 * with their actual values from process.env
 */
function substituteEnvVars(value: unknown): unknown {
  if (typeof value === "string") {
    // Match pattern: ${{ env.VAR_NAME }}
    const envPattern = /\$\{\{\s*env\.([A-Z_][A-Z0-9_]*)\s*\}\}/g;
    return value.replace(envPattern, (match, varName) => {
      const envValue = process.env[varName];
      if (envValue === undefined) {
        // Keep the original placeholder if env var is not set
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
 * Loads and parses the config.yaml file
 */
export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = join(dataDir, "config.yaml");
  const fileContents = readFileSync(configPath, "utf8");
  let rawConfig = yaml.load(fileContents, {
    schema: yaml.JSON_SCHEMA,
  }) as Config;

  // Substitute environment variables before validation
  rawConfig = substituteEnvVars(rawConfig) as Config;

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

  cachedConfig = result.data;

  return cachedConfig;
}

/**
 * Clears the cached configuration (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}
