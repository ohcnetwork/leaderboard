/**
 * Export activity definitions to data directory
 */

import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import { activityDefinitionQueries } from "@ohcnetwork/leaderboard-api";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

/**
 * Export activity definitions to activities/definitions.json
 */
export async function exportActivityDefinitions(
  db: Database,
  dataDir: string,
  logger: Logger,
): Promise<void> {
  const activitiesDir = join(dataDir, "activities");
  await mkdir(activitiesDir, { recursive: true });

  const definitions = await activityDefinitionQueries.getAll(db);
  const content = JSON.stringify(definitions, null, 2);

  await writeFile(join(activitiesDir, "definitions.json"), content, "utf-8");
  logger.info(`Exported ${definitions.length} activity definitions`);
}
