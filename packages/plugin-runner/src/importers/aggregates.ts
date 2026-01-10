/**
 * Import aggregates from data directory
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import {
  globalAggregateQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
} from "@ohcnetwork/leaderboard-api";

/**
 * Import global aggregates from aggregates/global.json
 */
export async function importGlobalAggregates(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const globalPath = join(dataDir, "aggregates", "global.json");

  try {
    const content = await readFile(globalPath, "utf-8");
    const aggregates = JSON.parse(content);

    if (!Array.isArray(aggregates)) {
      logger.warn("Global aggregates file is not an array");
      return;
    }

    for (const aggregate of aggregates) {
      await globalAggregateQueries.upsert(db, aggregate);
    }

    logger.info(`Imported ${aggregates.length} global aggregates`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.debug("No global aggregates file found, skipping");
    } else {
      logger.error("Failed to import global aggregates", error);
    }
  }
}

/**
 * Import contributor aggregate definitions from aggregates/definitions.json
 */
export async function importContributorAggregateDefinitions(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const definitionsPath = join(dataDir, "aggregates", "definitions.json");

  try {
    const content = await readFile(definitionsPath, "utf-8");
    const definitions = JSON.parse(content);

    if (!Array.isArray(definitions)) {
      logger.warn("Contributor aggregate definitions file is not an array");
      return;
    }

    for (const definition of definitions) {
      await contributorAggregateDefinitionQueries.upsert(db, definition);
    }

    logger.info(
      `Imported ${definitions.length} contributor aggregate definitions`
    );
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.debug("No contributor aggregate definitions file found, skipping");
    } else {
      logger.error("Failed to import contributor aggregate definitions", error);
    }
  }
}

/**
 * Import contributor aggregates from aggregates/contributors/*.jsonl
 */
export async function importContributorAggregates(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const contributorsDir = join(dataDir, "aggregates", "contributors");

  try {
    const files = await readdir(contributorsDir);
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"));

    let totalImported = 0;

    for (const file of jsonlFiles) {
      const filePath = join(contributorsDir, file);
      const content = await readFile(filePath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const aggregate = JSON.parse(line);
          await contributorAggregateQueries.upsert(db, aggregate);
          totalImported++;
        } catch (error) {
          logger.warn(`Failed to parse aggregate line in ${file}`, { error });
        }
      }
    }

    logger.info(
      `Imported ${totalImported} contributor aggregates from ${jsonlFiles.length} files`
    );
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.debug("No contributor aggregates directory found, skipping");
    } else {
      logger.error("Failed to import contributor aggregates", error);
    }
  }
}

/**
 * Import all aggregates
 */
export async function importAggregates(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  logger.info("Importing aggregates");
  await importGlobalAggregates(db, dataDir, logger);
  await importContributorAggregateDefinitions(db, dataDir, logger);
  await importContributorAggregates(db, dataDir, logger);
}
