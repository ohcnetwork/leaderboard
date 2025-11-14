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
 * Loads and parses the config.yaml file
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
 * Gets all role names that are marked as hidden
 */
export function getHiddenRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden === true)
    .map(([, roleConfig]) => roleConfig.name);
}

/**
 * Gets all role names that are not hidden
 */
export function getVisibleRoles(): string[] {
  const config = getConfig();
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden !== true)
    .map(([, roleConfig]) => roleConfig.name);
}
