/**
 * Import badges from data directory
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import {
  badgeDefinitionQueries,
  contributorBadgeQueries,
} from "@ohcnetwork/leaderboard-api";

/**
 * Import badge definitions from badges/definitions.json
 */
export async function importBadgeDefinitions(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const definitionsPath = join(dataDir, "badges", "definitions.json");

  try {
    const content = await readFile(definitionsPath, "utf-8");
    const definitions = JSON.parse(content);

    if (!Array.isArray(definitions)) {
      logger.warn("Badge definitions file is not an array");
      return;
    }

    for (const definition of definitions) {
      await badgeDefinitionQueries.upsert(db, definition);
    }

    logger.info(`Imported ${definitions.length} badge definitions`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.debug("No badge definitions file found, skipping");
    } else {
      logger.error("Failed to import badge definitions", error);
    }
  }
}

/**
 * Import contributor badges from badges/contributors/*.jsonl
 */
export async function importContributorBadges(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const contributorsDir = join(dataDir, "badges", "contributors");

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
          const badge = JSON.parse(line);
          await contributorBadgeQueries.award(db, badge);
          totalImported++;
        } catch (error) {
          logger.warn(`Failed to parse badge line in ${file}`, { error });
        }
      }
    }

    logger.info(
      `Imported ${totalImported} contributor badges from ${jsonlFiles.length} files`
    );
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.debug("No contributor badges directory found, skipping");
    } else {
      logger.error("Failed to import contributor badges", error);
    }
  }
}

/**
 * Import all badges
 */
export async function importBadges(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  logger.info("Importing badges");
  await importBadgeDefinitions(db, dataDir, logger);
  await importContributorBadges(db, dataDir, logger);
}
