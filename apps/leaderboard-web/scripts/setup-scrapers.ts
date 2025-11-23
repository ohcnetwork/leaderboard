import { execSync } from "child_process";
import { getConfig } from "@leaderboard/core";

/**
 * Setup script to install all configured scrapers
 * Installs scrapers using npm with --no-save flag
 */
function setupScrapers(): void {
  const config = getConfig();

  if (!config.leaderboard.scrapers) {
    console.log("No scrapers configured. Skipping scraper setup.");
    return;
  }

  const scrapers = config.leaderboard.scrapers;
  const scraperKeys = Object.keys(scrapers);

  if (scraperKeys.length === 0) {
    console.log("No scrapers configured. Skipping scraper setup.");
    return;
  }

  console.log(`Found ${scraperKeys.length} scraper(s) to install:\n`);

  for (const key of scraperKeys) {
    const scraper = scrapers[key];
    if (!scraper) {
      console.error(`❌ Scraper configuration for ${key} is missing.`);
      process.exit(1);
    }
    const displayName = scraper.name || key;
    const source = scraper.source;

    console.log(`📦 Installing ${displayName}...`);
    console.log(`   Source: ${source}`);

    try {
      // Install the scraper using npm with --no-save flag
      // This installs the package without adding it to package.json
      const command = `pnpm install ${source}`;

      console.log(`   Running: ${command}`);

      execSync(command, {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      console.log(`✅ Successfully installed ${displayName}\n`);
    } catch (error) {
      console.error(`❌ Failed to install ${displayName}`);
      console.error(
        `   Error: ${error instanceof Error ? error.message : error}\n`
      );
      process.exit(1);
    }
  }

  console.log("🎉 All scrapers installed successfully!");
}

function main() {
  try {
    console.log("🚀 Setting up scrapers...\n");
    setupScrapers();
  } catch (error) {
    console.error(
      "Error setting up scrapers:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

main();
