#!/usr/bin/env node
/**
 * Create Leaderboard Plugin CLI Tool
 *
 * Generates a new leaderboard plugin project structure
 */

import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import prompts from "prompts";
import { generatePackageJson } from "./templates/package-json";
import { generateTsConfig } from "./templates/tsconfig";
import { generateVitestConfig } from "./templates/vitest-config";
import { generateIndexTs } from "./templates/index-ts";
import { generateTestTs } from "./templates/test-ts";
import { generateReadme } from "./templates/readme";
import type { PluginOptions } from "./types";

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
  writeFileSync(join(pluginDir, "tsconfig.json"), generateTsConfig(), "utf-8");

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
  writeFileSync(join(pluginDir, "README.md"), generateReadme(options), "utf-8");
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("Create Leaderboard Plugin\n");

  // Show usage if help flag is provided
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: pnpm create-leaderboard-plugin [target-directory]");
    console.log("\nArguments:");
    console.log(
      "  target-directory  Directory where the plugin will be created (default: current directory)"
    );
    console.log("\nExamples:");
    console.log("  pnpm create-leaderboard-plugin .");
    console.log("  pnpm create-leaderboard-plugin ../../plugins/slack");
    console.log("  pnpm create-leaderboard-plugin my-plugin");
    process.exit(0);
  }

  // Get target directory from command line args (default to current directory)
  const targetArg = process.argv[2] || ".";
  const targetDir = resolve(process.cwd(), targetArg);

  // Check if target directory exists and is not empty
  if (existsSync(targetDir)) {
    const files = readdirSync(targetDir);
    if (files.length > 0) {
      console.error(`Error: Directory "${targetArg}" is not empty.`);
      console.error(
        "Please specify an empty directory or a new directory path."
      );
      process.exit(1);
    }
  }

  // Prompt for information
  const options = await promptUser();

  try {
    // Create directory structure
    console.log(`Creating plugin in: ${targetDir}`);
    createDirectoryStructure(targetDir);

    // Generate files
    console.log("Generating plugin files...");
    generateFiles(targetDir, options);

    console.log(`\n✓ Plugin "${options.packageName}" created successfully!`);
    console.log(`\nNext steps:`);
    if (targetArg !== ".") {
      console.log(`  1. cd ${targetArg}`);
      console.log(`  2. pnpm install`);
    } else {
      console.log(`  1. pnpm install`);
    }
    console.log(
      `  ${
        targetArg !== "." ? "3" : "2"
      }. Implement your plugin logic in src/index.ts`
    );
    console.log(`  ${targetArg !== "." ? "4" : "3"}. pnpm build`);
    console.log(
      `  ${targetArg !== "." ? "5" : "4"}. Add the plugin to your config.yaml`
    );
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
