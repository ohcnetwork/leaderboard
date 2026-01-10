#!/usr/bin/env node
/**
 * Plugin runner CLI entry point
 */

import { parseArgs } from "util";
import { join } from "path";
import { createLogger } from "./logger";
import { initDatabase } from "./database";
import { loadConfig } from "./config";
import { importContributors } from "./importers/contributors";
import { importActivities } from "./importers/activities";
import { importAggregates } from "./importers/aggregates";
import { importBadges } from "./importers/badges";
import { exportContributors } from "./exporters/contributors";
import { exportActivities } from "./exporters/activities";
import { exportAggregates } from "./exporters/aggregates";
import { exportBadges } from "./exporters/badges";
import { runPlugins } from "./runner";
import { runAggregation } from "./aggregator";
import { evaluateBadgeRules } from "./rules/evaluator";
import { getDataDir } from "@ohcnetwork/leaderboard-api";

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

  // Resolve relative paths from the current working directory (where the command was run)
  const dataDir = getDataDir(values["data-dir"]);

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
      await importAggregates(db, dataDir, logger);
      await importBadges(db, dataDir, logger);
      logger.info("Import complete");
    }

    // Run plugins
    if (!values["skip-scrape"]) {
      logger.info("Running plugins");
      await runPlugins(config, db, logger);
      logger.info("Plugins complete");

      // Run aggregation phase
      logger.info("Running aggregation phase");
      await runAggregation(db, logger);
      logger.info("Aggregation complete");

      // Evaluate badge rules
      logger.info("Evaluating badge rules");
      await evaluateBadgeRules(db, logger);
      logger.info("Badge evaluation complete");
    }

    // Export data
    if (!values["skip-export"]) {
      logger.info("Exporting data");
      await exportContributors(db, dataDir, logger);
      await exportActivities(db, join(dataDir, "data"), logger);
      await exportAggregates(db, dataDir, logger);
      await exportBadges(db, dataDir, logger);
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
