#!/usr/bin/env node
/**
 * Plugin runner CLI entry point
 */

import { parseArgs } from "util";
import { join, resolve, isAbsolute } from "path";
import { createLogger } from "./logger.js";
import { initDatabase } from "./database.js";
import { loadConfig } from "./config.js";
import { importContributors } from "./importers/contributors.js";
import { importActivities } from "./importers/activities.js";
import { exportContributors } from "./exporters/contributors.js";
import { exportActivities } from "./exporters/activities.js";
import { runPlugins } from "./runner.js";

async function main() {
  const { values } = parseArgs({
    allowPositionals: false,
    strict: true,
    options: {
      "data-dir": {
        type: "string",
        short: "d",
      },
      debug: {
        type: "boolean",
        default: false,
      },
      "skip-import": {
        type: "boolean",
        default: false,
      },
      "skip-scrape": {
        type: "boolean",
        default: false,
      },
      "skip-export": {
        type: "boolean",
        default: false,
      },
    },
  });

  const logger = createLogger(values.debug);
  
  // Determine data directory and resolve to absolute path
  const rawDataDir =
    values["data-dir"] ||
    process.env.LEADERBOARD_DATA_DIR ||
    "./data";
  
  // Resolve relative paths from the current working directory (where the command was run)
  const dataDir = isAbsolute(rawDataDir) 
    ? rawDataDir 
    : resolve(process.cwd(), rawDataDir);

  logger.info("Plugin Runner starting", { dataDir });

  try {
    // Load configuration
    logger.info("Loading configuration");
    const config = await loadConfig(dataDir);
    logger.info(`Loaded config for: ${config.org.name}`);

    // Initialize database
    logger.info("Initializing database");
    const db = await initDatabase(dataDir);
    logger.info("Database initialized");

    // Import existing data
    if (!values["skip-import"]) {
      logger.info("Importing existing data");
      await importContributors(db, dataDir, logger);
      await importActivities(db, dataDir, logger);
      logger.info("Import complete");
    }

    // Run plugins
    if (!values["skip-scrape"]) {
      logger.info("Running plugins");
      await runPlugins(config, db, logger);
      logger.info("Plugins complete");
    }

    // Export data
    if (!values["skip-export"]) {
      logger.info("Exporting data");
      await exportContributors(db, dataDir, logger);
      await exportActivities(db, join(dataDir, "data"), logger);
      logger.info("Export complete");
    }

    // Close database
    await db.close();
    
    logger.info("✅ Plugin runner completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Fatal error in plugin runner", error as Error);
    process.exit(1);
  }
}

main();

