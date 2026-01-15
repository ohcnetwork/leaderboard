#!/usr/bin/env node
/**
 * Create Leaderboard Data Repository CLI Tool
 *
 * Generates a new leaderboard data repository structure
 */

import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { collectConfig } from "./prompts";
import { generateConfigYaml } from "./generators/config";
import { generateReadme } from "./generators/readme";
import { generateGitignore } from "./generators/gitignore";

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  console.log("🎯 Create Leaderboard Data Repository\n");

  // Show help
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: pnpm create-data-repo [target-directory]");
    console.log("\nArguments:");
    console.log(
      "  target-directory  Directory where the data repo will be created"
    );
    console.log(
      "                    Default: ../data (relative to current directory)"
    );
    console.log("\nExamples:");
    console.log("  pnpm create-data-repo");
    console.log("  pnpm create-data-repo .");
    console.log("  pnpm create-data-repo ../my-org-data");
    console.log("  pnpm create-data-repo /absolute/path/to/data");
    console.log("\nWhat gets created:");
    console.log("  - config.yaml         Configuration file");
    console.log("  - README.md           Repository documentation");
    console.log("  - .gitignore          Git ignore rules");
    console.log(
      "  - contributors/       Contributor profiles directory (empty)"
    );
    console.log("  - activities/         Activity records directory (empty)");
    console.log("  - Git repository      Initialized with initial commit");
    process.exit(0);
  }

  // Get target directory
  const targetArg = process.argv[2] || "../data";
  const targetDir = resolve(process.cwd(), targetArg);

  // Check if directory exists and is not empty
  if (existsSync(targetDir)) {
    const files = readdirSync(targetDir).filter((f) => !f.startsWith("."));
    if (files.length > 0) {
      console.error(`❌ Error: Directory "${targetArg}" is not empty.`);
      console.error("Please specify an empty directory or a new path.");
      process.exit(1);
    }
  }

  // Collect configuration through interactive prompts
  console.log("Let's set up your leaderboard data repository.\n");
  const config = await collectConfig();

  try {
    // Create directory structure
    console.log(`\n📁 Creating data repository in: ${targetDir}`);
    mkdirSync(targetDir, { recursive: true });
    mkdirSync(resolve(targetDir, "contributors"), { recursive: true });
    mkdirSync(resolve(targetDir, "activities"), { recursive: true });

    // Generate files
    console.log("📝 Generating configuration files...");

    writeFileSync(
      resolve(targetDir, "config.yaml"),
      generateConfigYaml(config),
      "utf-8"
    );

    writeFileSync(
      resolve(targetDir, "README.md"),
      generateReadme(config),
      "utf-8"
    );

    writeFileSync(
      resolve(targetDir, ".gitignore"),
      generateGitignore(),
      "utf-8"
    );

    // Initialize git repository
    console.log("🔧 Initializing git repository...");
    try {
      execSync("git init", { cwd: targetDir, stdio: "ignore" });
      execSync("git add .", { cwd: targetDir, stdio: "ignore" });
      execSync(
        'git commit -m "Initial commit: Initialize leaderboard data repository"',
        {
          cwd: targetDir,
          stdio: "ignore",
        }
      );
    } catch (error) {
      console.warn(
        "⚠️  Warning: Git initialization failed. You may need to initialize git manually."
      );
      console.warn("   Make sure git is installed and configured.");
    }

    // Success message
    console.log(`\n✅ Data repository created successfully!\n`);
    console.log("📋 Next steps:");
    if (targetArg !== "." && targetArg !== "../data") {
      console.log(`  1. cd ${targetArg}`);
      console.log(`  2. Review and edit config.yaml`);
      console.log(
        `  3. Configure plugin settings (uncomment and set API tokens)`
      );
      console.log(
        `  4. Run: pnpm --filter @leaderboard/plugin-runner scrape --data-dir .`
      );
      console.log(`  5. Commit and push your changes\n`);
    } else {
      console.log(`  1. Review and edit config.yaml`);
      console.log(
        `  2. Configure plugin settings (uncomment and set API tokens)`
      );
      console.log(
        `  3. Run: pnpm --filter @leaderboard/plugin-runner scrape --data-dir ${targetArg}`
      );
      console.log(`  4. Commit and push your changes\n`);
    }

    console.log("📚 For more information:");
    console.log("   https://github.com/ohcnetwork/leaderboard\n");
  } catch (error) {
    console.error("❌ Error creating data repository:", error);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
