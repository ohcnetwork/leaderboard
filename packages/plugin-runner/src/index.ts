#!/usr/bin/env node
/**
 * Plugin runner CLI entry point
 */

import { getDataDir } from "@ohcnetwork/leaderboard-api";
import { parseArgs } from "util";
import { runAggregation } from "./aggregator";
import { loadConfig } from "./config";
import { initDatabase } from "./database";
import { exportActivities } from "./exporters/activities";
import { exportActivityDefinitions } from "./exporters/activity-definitions";
import { exportAggregates } from "./exporters/aggregates";
import { exportBadges } from "./exporters/badges";
import { exportContributors } from "./exporters/contributors";
import { importActivities } from "./importers/activities";
import { importActivityDefinitions } from "./importers/activity-definitions";
import { importAggregates } from "./importers/aggregates";
import { importBadges } from "./importers/badges";
import { importContributors } from "./importers/contributors";
import { createLogger } from "./logger";
import { evaluateBadgeRules } from "./rules/evaluator";
import {
  aggregatePlugins,
  loadAllPlugins,
  scrapePlugins,
  setupPlugins,
} from "./runner";

const PHASES = ["import", "setup", "scrape", "aggregate", "export"] as const;
type Phase = (typeof PHASES)[number];

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
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
    },
  });

  const logger = createLogger(values.debug);

  // Determine which phase to run
  const requestedPhase = positionals[0] as Phase | undefined;
  if (requestedPhase && !PHASES.includes(requestedPhase)) {
    logger.error(
      `Unknown phase: ${requestedPhase}. Valid phases: ${PHASES.join(", ")}`,
    );
    process.exit(1);
  }

  const runAll = !requestedPhase;
  const shouldRun = (phase: Phase) => runAll || requestedPhase === phase;

  // Resolve relative paths from the current working directory (where the command was run)
  const dataDir = getDataDir(values["data-dir"]);

  logger.info("Plugin Runner starting", {
    dataDir,
    phase: requestedPhase || "all",
  });

  try {
    // Load configuration
    logger.info("Loading configuration");
    const config = await loadConfig(dataDir);
    logger.info(`Loaded config for: ${config.org.name}`);

    // Initialize database
    logger.info("Initializing database");
    const db = await initDatabase(dataDir);
    logger.info("Database initialized");

    // Import phase
    if (shouldRun("import")) {
      logger.info("Importing existing data");
      await importContributors(db, dataDir, logger);
      await importActivityDefinitions(db, dataDir, logger);
      await importActivities(db, dataDir, logger);
      await importAggregates(db, dataDir, logger);
      await importBadges(db, dataDir, logger);
      logger.info("Import complete");
    }

    // Load plugins if any plugin phase is needed
    if (shouldRun("setup") || shouldRun("scrape") || shouldRun("aggregate")) {
      const loadedPlugins = await loadAllPlugins(config, logger);

      // Setup phase
      if (shouldRun("setup")) {
        logger.info("Running plugin setup");
        await setupPlugins(loadedPlugins, config, db, logger);
        logger.info("Setup complete");
      }

      // Scrape phase
      if (shouldRun("scrape")) {
        logger.info("Running plugin scrape");
        await scrapePlugins(loadedPlugins, config, db, logger);
        logger.info("Scrape complete");
      }

      // Aggregate phase
      if (shouldRun("aggregate")) {
        logger.info("Running aggregation phase");
        await runAggregation(db, logger);
        logger.info("Aggregation complete");

        logger.info("Running plugin aggregation phase");
        await aggregatePlugins(loadedPlugins, config, db, logger);
        logger.info("Plugin aggregation complete");

        logger.info("Evaluating badge rules");
        await evaluateBadgeRules(db, logger);
        logger.info("Badge evaluation complete");
      }
    }

    // Export phase
    if (shouldRun("export")) {
      logger.info("Exporting data");
      await exportContributors(db, dataDir, logger);
      await exportActivityDefinitions(db, dataDir, logger);
      await exportActivities(db, dataDir, logger);
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
