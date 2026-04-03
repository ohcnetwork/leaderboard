/**
 * Import activities from sharded JSONL files
 */

import type { Activity, Database, Logger } from "@ohcnetwork/leaderboard-api";
import { activityQueries } from "@ohcnetwork/leaderboard-api";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

/**
 * Import all activities from JSONL files
 */
export async function importActivities(
  db: Database,
  dataDir: string,
  logger: Logger,
): Promise<number> {
  const activitiesDir = join(dataDir, "activities", "contributors");

  try {
    const files = await readdir(activitiesDir);
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"));

    logger.info(`Found ${jsonlFiles.length} activity files`);

    let imported = 0;

    for (const file of jsonlFiles) {
      try {
        const filePath = join(activitiesDir, file);
        const activities = await importActivitiesFromFile(filePath);
        await activityQueries.upsertMany(db, activities);
        imported += activities.length;
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
      logger.warn(
        "Activities contributors directory not found, skipping import",
      );
      return 0;
    }
    throw error;
  }
}

/**
 * Get activities from a single JSONL file
 */
async function importActivitiesFromFile(filePath: string): Promise<Activity[]> {
  const content = await readFile(filePath, "utf-8");
  const activities = content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as Activity);
  return activities;
}
