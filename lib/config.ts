import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { Config } from "@/types/config";
import configSchema from "@/config.schema.json";

let cachedConfig: Config | null = null;

// Load and compile schema
function getValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(configSchema);
}

/**
 * Substitutes environment variables in the format ${{ VAR_NAME }}
 */
function substituteEnvVars(obj: string | object): string | object {
  if (typeof obj === "string") {
    // Match ${{ VAR_NAME }} pattern (supports uppercase letters, numbers, and underscores)
    const match = obj.match(/^\$\{\{\s*([A-Z0-9_]+)\s*\}\}$/);
    if (match) {
      const envVar = match[1]!;
      return process.env[envVar] || obj;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars);
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, string | object> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteEnvVars(value);
    }
    return result;
  }

  return obj;
}

/**
 * Loads and parses the config.yaml file with environment variable substitution
 */
export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = join(process.cwd(), "config.yaml");
  const fileContents = readFileSync(configPath, "utf8");
  const rawConfig = yaml.load(fileContents, {
    schema: yaml.JSON_SCHEMA,
  }) as Config;

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

  // Substitute environment variables
  cachedConfig = substituteEnvVars(rawConfig) as Config;

  return cachedConfig;
}

/**
 * Clears the cached configuration (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Gets all role names that are marked as hidden
 */
export function getHiddenRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden === true)
    .map(([slug]) => slug);
}

/**
 * Gets all role names that are not hidden
 */
export function getVisibleRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden !== true)
    .map(([slug]) => slug);
}
