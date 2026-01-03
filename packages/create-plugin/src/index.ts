#!/usr/bin/env node
/**
 * Create Leaderboard Plugin CLI Tool
 * 
 * Generates a new leaderboard plugin project structure
 */

import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import prompts from "prompts";
import { generatePackageJson } from "./templates/package-json.js";
import { generateTsConfig } from "./templates/tsconfig.js";
import { generateVitestConfig } from "./templates/vitest-config.js";
import { generateIndexTs } from "./templates/index-ts.js";
import { generateTestTs } from "./templates/test-ts.js";
import { generateReadme } from "./templates/readme.js";
import type { PluginOptions } from "./types.js";

/**
 * Validate plugin name format (alphanumeric + hyphens, no spaces)
 */
function validatePluginName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name) && name.length > 0;
}

/**
 * Get default author from root package.json or environment
 */
async function getDefaultAuthor(): Promise<string> {
  try {
    const rootPackageJsonPath = resolve(process.cwd(), "package.json");
    if (existsSync(rootPackageJsonPath)) {
      const content = await readFile(rootPackageJsonPath, "utf-8");
      const pkg = JSON.parse(content);
      if (pkg.author) {
        return pkg.author;
      }
    }
  } catch {
    // Ignore errors
  }
  return "Open Healthcare Network";
}

/**
 * Prompt user for plugin information
 */
async function promptUser(): Promise<PluginOptions> {
  const defaultAuthor = await getDefaultAuthor();

  const response = await prompts([
    {
      type: "text",
      name: "pluginName",
      message: "Plugin name (e.g., 'github', 'slack'):",
      validate: (value: string) => {
        if (!value) return "Plugin name is required";
        if (!validatePluginName(value)) {
          return "Plugin name must contain only lowercase letters, numbers, and hyphens";
        }
        return true;
      },
    },
    {
      type: "text",
      name: "description",
      message: "Plugin description:",
      validate: (value: string) => {
        if (!value) return "Description is required";
        return true;
      },
    },
    {
      type: "text",
      name: "author",
      message: "Author:",
      initial: defaultAuthor,
      validate: (value: string) => {
        if (!value) return "Author is required";
        return true;
      },
    },
  ]);

  if (!response.pluginName || !response.description || !response.author) {
    console.error("Creation cancelled.");
    process.exit(1);
  }

  return {
    pluginName: response.pluginName,
    description: response.description,
    author: response.author,
    packageName: `@leaderboard/plugin-${response.pluginName}`,
  };
}

/**
 * Create directory structure
 */
function createDirectoryStructure(pluginDir: string): void {
  const dirs = [
    pluginDir,
    join(pluginDir, "src"),
    join(pluginDir, "src", "__tests__"),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Generate plugin files
 */
function generateFiles(pluginDir: string, options: PluginOptions): void {
  // package.json
  writeFileSync(
    join(pluginDir, "package.json"),
    generatePackageJson(options),
    "utf-8"
  );

  // tsconfig.json
  writeFileSync(
    join(pluginDir, "tsconfig.json"),
    generateTsConfig(),
    "utf-8"
  );

  // vitest.config.ts
  writeFileSync(
    join(pluginDir, "vitest.config.ts"),
    generateVitestConfig(),
    "utf-8"
  );

  // src/index.ts
  writeFileSync(
    join(pluginDir, "src", "index.ts"),
    generateIndexTs(options),
    "utf-8"
  );

  // src/__tests__/plugin.test.ts
  writeFileSync(
    join(pluginDir, "src", "__tests__", "plugin.test.ts"),
    generateTestTs(options),
    "utf-8"
  );

  // README.md
  writeFileSync(
    join(pluginDir, "README.md"),
    generateReadme(options),
    "utf-8"
  );
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("Create Leaderboard Plugin\n");

  // Prompt for information
  const options = await promptUser();

  // Determine plugin directory (current working directory)
  const pluginDir = resolve(process.cwd(), options.pluginName);

  // Check if directory already exists
  if (existsSync(pluginDir)) {
    console.error(`Error: Directory "${options.pluginName}" already exists.`);
    process.exit(1);
  }

  try {
    // Create directory structure
    console.log(`Creating plugin directory: ${pluginDir}`);
    createDirectoryStructure(pluginDir);

    // Generate files
    console.log("Generating plugin files...");
    generateFiles(pluginDir, options);

    console.log(`\n✓ Plugin "${options.packageName}" created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  1. cd ${options.pluginName}`);
    console.log(`  2. pnpm install`);
    console.log(`  3. Implement your plugin logic in src/index.ts`);
    console.log(`  4. pnpm build`);
    console.log(`  5. Add the plugin to your config.yaml`);
  } catch (error) {
    console.error("Error creating plugin:", error);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

