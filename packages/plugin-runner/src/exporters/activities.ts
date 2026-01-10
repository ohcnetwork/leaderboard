/**
 * Export activities to sharded JSONL files
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import type { Database } from "@ohcnetwork/leaderboard-api";
import {
  activityQueries,
  contributorQueries,
} from "@ohcnetwork/leaderboard-api";
import type { Logger } from "@ohcnetwork/leaderboard-api";

/**
 * Export all activities to sharded JSONL files (one per contributor)
 */
export async function exportActivities(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<number> {
  const activitiesDir = join(dataDir, "activities");
  await mkdir(activitiesDir, { recursive: true });

  const contributors = await contributorQueries.getAll(db);
  logger.info(`Exporting activities for ${contributors.length} contributors`);

  let totalExported = 0;

  for (const contributor of contributors) {
    const activities = await activityQueries.getByContributor(
      db,
      contributor.username
    );

    if (activities.length === 0) {
      logger.debug(`No activities for ${contributor.username}, skipping`);
      continue;
    }

    const content = activities.map((a) => JSON.stringify(a)).join("\n") + "\n";
    const filePath = join(activitiesDir, `${contributor.username}.jsonl`);
    await writeFile(filePath, content, "utf-8");

    logger.debug(
      `Exported ${activities.length} activities for ${contributor.username}`
    );
    totalExported += activities.length;
  }

  logger.info(`Exported ${totalExported} activities`);
  return totalExported;
}
