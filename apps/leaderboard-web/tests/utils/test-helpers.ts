import { writeFileSync, unlinkSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

/**
 * Creates a temporary config file for testing
 */
export function createTempConfig(
  config: unknown,
  filename = "config.test.yaml"
): string {
  const path = join(process.cwd(), filename);
  const yamlContent = yaml.dump(config);
  writeFileSync(path, yamlContent, "utf8");
  return path;
}

/**
 * Removes a temporary config file
 */
export function removeTempConfig(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

/**
 * Backs up the original config.yaml file
 */
export function backupConfig(): string | null {
  const configPath = join(process.cwd(), "config.yaml");
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, "utf8");
    return content;
  }
  return null;
}

/**
 * Restores the original config.yaml file
 */
export function restoreConfig(content: string | null): void {
  const configPath = join(process.cwd(), "config.yaml");
  if (content) {
    writeFileSync(configPath, content, "utf8");
  } else if (existsSync(configPath)) {
    unlinkSync(configPath);
  }
}

/**
 * Replaces config.yaml with test config temporarily
 */
export function replaceConfigWith(config: unknown): void {
  const configPath = join(process.cwd(), "config.yaml");
  const yamlContent = yaml.dump(config);
  writeFileSync(configPath, yamlContent, "utf8");
}

/**
 * Sets environment variables for testing
 */
export function setTestEnvVars(vars: Record<string, string>): void {
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value;
  }
}

/**
 * Clears test environment variables
 */
export function clearTestEnvVars(keys: string[]): void {
  for (const key of keys) {
    delete process.env[key];
  }
}

/**
 * Extracts error paths from validation error message
 */
export function extractErrorPaths(errorMessage: string): string[] {
  const lines = errorMessage.split("\n");
  const paths: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*-\s*([^:]+):/);
    if (match) {
      paths.push(match[1]!.trim());
    }
  }

  return paths;
}

/**
 * Checks if error message contains specific validation error
 */
export function hasValidationError(
  errorMessage: string,
  path: string,
  message?: string
): boolean {
  const lines = errorMessage.split("\n");

  for (const line of lines) {
    if (line.includes(path)) {
      if (message) {
        return line.includes(message);
      }
      return true;
    }
  }

  return false;
}
