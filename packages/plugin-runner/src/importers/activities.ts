/**
 * Import activities from sharded JSONL files
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { Database, Activity } from "@ohcnetwork/leaderboard-api";
import { activityQueries } from "@ohcnetwork/leaderboard-api";
import type { Logger } from "@ohcnetwork/leaderboard-api";

/**
 * Import all activities from JSONL files
 */
export async function importActivities(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<number> {
  const activitiesDir = join(dataDir, "activities");

  try {
    const files = await readdir(activitiesDir);
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"));

    logger.info(`Found ${jsonlFiles.length} activity files`);

    let imported = 0;

    for (const file of jsonlFiles) {
      try {
        const filePath = join(activitiesDir, file);
        const count = await importActivitiesFromFile(db, filePath, logger);
        imported += count;
      } catch (error) {
        logger.warn(`Failed to import activities from ${file}`, {
          error: (error as Error).message,
        });
      }
    }

    logger.info(`Imported ${imported} activities`);
    return imported;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      logger.warn("Activities directory not found, skipping import");
      return 0;
    }
    throw error;
  }
}

/**
 * Import activities from a single JSONL file
 */
async function importActivitiesFromFile(
  db: Database,
  filePath: string,
  logger: Logger
): Promise<number> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  let imported = 0;

  for (const line of lines) {
    try {
      const activity = JSON.parse(line) as Activity;
      await activityQueries.upsert(db, activity);
      imported++;
    } catch (error) {
      logger.debug(`Failed to parse activity line in ${filePath}`, {
        error: (error as Error).message,
      });
    }
  }

  logger.debug(`Imported ${imported} activities from ${filePath}`);
  return imported;
}
