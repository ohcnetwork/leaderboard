import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import configSchema from "../config.schema.json";

import type { Config } from "@/types/config";

let cachedConfig: Config | null = null;

// Load and compile schema
function getValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(configSchema);
}

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

  const configPath = join(process.cwd(), "config.yaml");
  const fileContents = readFileSync(configPath, "utf8");
  let rawConfig = yaml.load(fileContents, {
    schema: yaml.JSON_SCHEMA,
  }) as Config;

  // Substitute environment variables before validation
  rawConfig = substituteEnvVars(rawConfig) as Config;

  const validate = getValidator();

  // Validate against JSON schema
  const isValid = validate(rawConfig);
  if (!isValid) {
    const errors = validate.errors
      ?.map((err) => {
        const path = err.instancePath || "root";
        const message = err.message || "validation failed";
        return `  - ${path}: ${message}`;
      })
      .join("\n");
    throw new Error(
      `Configuration validation failed:\n${errors}\n\nPlease check your config.yaml file.`
    );
  }

  cachedConfig = rawConfig;

  return cachedConfig;
}

/**
 * Clears the cached configuration (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Get list of hidden role keys from the configuration
 * @returns Array of role keys that have hidden: true
 */
export function getHiddenRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([_, role]) => role.hidden === true)
    .map(([key]) => key);
}

/**
 * Get list of visible role keys from the configuration
 * @returns Array of role keys that are not hidden
 */
export function getVisibleRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([_, role]) => role.hidden !== true)
    .map(([key]) => key);
}
