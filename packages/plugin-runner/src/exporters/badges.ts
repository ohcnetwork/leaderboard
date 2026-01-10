/**
 * Export badges to data directory
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import {
  badgeDefinitionQueries,
  contributorBadgeQueries,
} from "@ohcnetwork/leaderboard-api";

/**
 * Export badge definitions to badges/definitions.json
 */
export async function exportBadgeDefinitions(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const badgesDir = join(dataDir, "badges");
  await mkdir(badgesDir, { recursive: true });

  const definitions = await badgeDefinitionQueries.getAll(db);
  const content = JSON.stringify(definitions, null, 2);

  await writeFile(join(badgesDir, "definitions.json"), content, "utf-8");
  logger.info(`Exported ${definitions.length} badge definitions`);
}

/**
 * Export contributor badges to badges/contributors/*.jsonl
 */
export async function exportContributorBadges(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const contributorsDir = join(dataDir, "badges", "contributors");
  await mkdir(contributorsDir, { recursive: true });

  const badges = await contributorBadgeQueries.getAll(db);

  // Group by contributor
  const byContributor = new Map<string, typeof badges>();
  for (const badge of badges) {
    if (!byContributor.has(badge.contributor)) {
      byContributor.set(badge.contributor, []);
    }
    byContributor.get(badge.contributor)!.push(badge);
  }

  // Write one file per contributor
  for (const [username, contributorBadges] of byContributor) {
    const lines = contributorBadges.map((b) => JSON.stringify(b)).join("\n");
    await writeFile(
      join(contributorsDir, `${username}.jsonl`),
      lines + "\n",
      "utf-8"
    );
  }

  logger.info(
    `Exported ${badges.length} contributor badges for ${byContributor.size} contributors`
  );
}

/**
 * Export all badges
 */
export async function exportBadges(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  logger.info("Exporting badges");
  await exportBadgeDefinitions(db, dataDir, logger);
  await exportContributorBadges(db, dataDir, logger);
}
