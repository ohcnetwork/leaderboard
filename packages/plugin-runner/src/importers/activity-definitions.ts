/**
 * Import activity definitions from data directory
 */

import { readFile } from "fs/promises";
import { join } from "path";
import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import { activityDefinitionQueries } from "@ohcnetwork/leaderboard-api";

/**
 * Import activity definitions from activities/definitions.json
 */
export async function importActivityDefinitions(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const definitionsPath = join(dataDir, "activities", "definitions.json");

  try {
    const content = await readFile(definitionsPath, "utf-8");
    const definitions = JSON.parse(content);

    if (!Array.isArray(definitions)) {
      logger.warn("Activity definitions file is not an array");
      return;
    }

    for (const definition of definitions) {
      await activityDefinitionQueries.upsert(db, definition);
    }

    logger.info(`Imported ${definitions.length} activity definitions`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.debug("No activity definitions file found, skipping");
    } else {
      logger.error("Failed to import activity definitions", error);
    }
  }
}
