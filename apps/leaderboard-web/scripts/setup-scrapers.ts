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
      // Parse the source to extract repo path and branch
      // Expected format: git@github.com/owner/repo.git branch
      const parts = source.split(/\s+/);
      const gitUrl = parts[0];
      const branch = parts[1];

      if (!gitUrl) {
        throw new Error(`Git URL not found in source: ${source}`);
      }

      // Extract owner/repo from git URL
      // Supports formats like: git@github.com/owner/repo.git or git@github.com:owner/repo.git
      const repoMatch = gitUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);

      if (!repoMatch) {
        throw new Error(`Invalid GitHub URL format: ${gitUrl}`);
      }

      const repoPath = repoMatch[1];

      if (!branch) {
        throw new Error(`Branch not specified in source: ${source}`);
      }

      const url = `https://github.com/${repoPath}/archive/refs/heads/${branch}.tar.gz`;
      const output = `${key}.tar.gz`;

      console.log(`Downloading tarball from: ${url}`);

      execSync(`curl -L ${url} -o ${output}`, { stdio: "inherit" });

      console.log(`Extracting tarball...`);

      execSync(`tar -xzf ${output} -C scrapers`, { stdio: "inherit" });

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
