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
import { initObservability } from "./observability";
import {
  aggregatePlugins,
  evaluateAllBadges,
  loadAllPlugins,
  scrapePlugins,
  setFailFast,
  setupPlugins,
} from "./runner";

const PHASES = [
  "import",
  "setup",
  "scrape",
  "aggregate",
  "evaluate",
  "export",
] as const;
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

  let flush: () => Promise<void> = async () => {};

  try {
    // Load configuration
    logger.info("Loading configuration");
    const config = await loadConfig(dataDir);
    logger.info(`Loaded config for: ${config.org.name}`);

    const observability = await initObservability(config.observability, logger);
    const log = observability.logger;
    flush = observability.flush;
    setFailFast(observability.failFast);

    // Initialize database
    log.info("Initializing database");
    const db = await initDatabase(dataDir);
    log.info("Database initialized");

    // Import phase
    if (shouldRun("import")) {
      log.info("Importing existing data");
      await importContributors(db, dataDir, log);
      await importActivityDefinitions(db, dataDir, log);
      await importActivities(db, dataDir, log);
      await importAggregates(db, dataDir, log);
      await importBadges(db, dataDir, log);
      log.info("Import complete");
    }

    // Load plugins if any plugin phase is needed
    if (
      shouldRun("setup") ||
      shouldRun("scrape") ||
      shouldRun("aggregate") ||
      shouldRun("evaluate")
    ) {
      const loadedPlugins = await loadAllPlugins(config, log);

      // Setup phase
      if (shouldRun("setup")) {
        log.info("Running plugin setup");
        await setupPlugins(loadedPlugins, config, db, log);
        log.info("Setup complete");
      }

      // Scrape phase
      if (shouldRun("scrape")) {
        log.info("Running plugin scrape");
        await scrapePlugins(loadedPlugins, config, db, log);
        log.info("Scrape complete");
      }

      // Aggregate phase
      if (shouldRun("aggregate")) {
        log.info("Running aggregation phase");
        await runAggregation(db, log);
        log.info("Aggregation complete");

        log.info("Running plugin aggregation phase");
        await aggregatePlugins(loadedPlugins, config, db, log);
        log.info("Plugin aggregation complete");
      }

      // Evaluate phase
      if (shouldRun("evaluate")) {
        log.info("Running badge evaluation phase");
        await evaluateAllBadges(loadedPlugins, config, db, log);
        log.info("Badge evaluation complete");
      }
    }

    // Export phase
    if (shouldRun("export")) {
      log.info("Exporting data");
      await exportContributors(db, dataDir, log);
      await exportActivityDefinitions(db, dataDir, log);
      await exportActivities(db, dataDir, log);
      await exportAggregates(db, dataDir, log);
      await exportBadges(db, dataDir, log);
      log.info("Export complete");
    }

    // Close database
    await db.close();

    log.info("✅ Plugin runner completed successfully");
    await flush();
    process.exit(0);
  } catch (error) {
    logger.error("Fatal error in plugin runner", error as Error);
    await flush();
    process.exit(1);
  }
}

main();
