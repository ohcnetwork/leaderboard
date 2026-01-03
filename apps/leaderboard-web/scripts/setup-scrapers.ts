import { execSync } from "child_process";
import { getConfig } from "../../../packages/core/src/config";
import * as fs from "fs";
import * as path from "path";

/**
 * Setup script to install all configured scrapers
 * Downloads scrapers from GitHub and extracts them to the scrapers folder
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

  // Create scrapers directory if it doesn't exist
  const scrapersDir = path.join(import.meta.dirname, "../../../scrapers");
  if (!fs.existsSync(scrapersDir)) {
    fs.mkdirSync(scrapersDir, { recursive: true });
    console.log(`Created scrapers directory: ${scrapersDir}\n`);
  }

  console.log(`Found ${scraperKeys.length} scraper(s) to install:\n`);

  for (const key of scraperKeys) {
    const scraper = scrapers[key];
    if (!scraper) {
      console.error(`Scraper configuration for ${key} is missing.`);
      process.exit(1);
    }
    const displayName = scraper.name || key;
    const source = scraper.source;

    console.log(`Installing ${displayName}...`);
    console.log(`   Source: ${source}`);

    try {
      const output = `${key}.tar.gz`;

      console.log(`Downloading tarball from: ${source}`);

      execSync(`curl -L ${source} -o ${output}`, { stdio: "inherit" });

      console.log(`Extracting tarball...`);

      execSync(`tar -xzf ${output} -C ${scrapersDir}`, { stdio: "inherit" });

      // Clean up the tarball
      fs.unlinkSync(output);
      console.log(`Cleaned up ${output}`);

      console.log(`Successfully installed ${displayName}\n`);
    } catch (error) {
      console.error(`Failed to install ${displayName}`);
      console.error(
        `   Error: ${error instanceof Error ? error.message : error}\n`
      );
      process.exit(1);
    }
  }

  console.log("All scrapers installed successfully!");
}

function main() {
  try {
    console.log("Setting up scrapers...\n");
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
