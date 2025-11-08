import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import type { Config } from "@/types";

let cachedConfig: Config | null = null;

/**
 * Substitutes environment variables in the format ${{ VAR_NAME }}
 */
function substituteEnvVars(obj: any): any {
  if (typeof obj === "string") {
    // Match ${{ VAR_NAME }} pattern
    const match = obj.match(/^\$\{\{\s*([A-Z_]+)\s*\}\}$/);
    if (match) {
      const envVar = match[1];
      return process.env[envVar] || obj;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars);
  }

  if (obj !== null && typeof obj === "object") {
    const result: any = {};
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
export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = join(process.cwd(), "config.yaml");
  const fileContents = readFileSync(configPath, "utf8");
  const rawConfig = yaml.load(fileContents) as Config;

  // Substitute environment variables
  cachedConfig = substituteEnvVars(rawConfig) as Config;

  return cachedConfig;
}

/**
 * Gets the configuration (alias for loadConfig)
 */
export function getConfig(): Config {
  return loadConfig();
}

/**
 * Clears the cached configuration (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

