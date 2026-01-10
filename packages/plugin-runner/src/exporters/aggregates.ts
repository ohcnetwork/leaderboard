/**
 * Export aggregates to data directory
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import {
  globalAggregateQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
} from "@ohcnetwork/leaderboard-api";

/**
 * Export global aggregates to aggregates/global.json
 */
export async function exportGlobalAggregates(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const aggregatesDir = join(dataDir, "aggregates");
  await mkdir(aggregatesDir, { recursive: true });

  const aggregates = await globalAggregateQueries.getAll(db);
  const content = JSON.stringify(aggregates, null, 2);

  await writeFile(join(aggregatesDir, "global.json"), content, "utf-8");
  logger.info(`Exported ${aggregates.length} global aggregates`);
}

/**
 * Export contributor aggregate definitions to aggregates/definitions.json
 */
export async function exportContributorAggregateDefinitions(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const aggregatesDir = join(dataDir, "aggregates");
  await mkdir(aggregatesDir, { recursive: true });

  const definitions = await contributorAggregateDefinitionQueries.getAll(db);
  const content = JSON.stringify(definitions, null, 2);

  await writeFile(join(aggregatesDir, "definitions.json"), content, "utf-8");
  logger.info(
    `Exported ${definitions.length} contributor aggregate definitions`
  );
}

/**
 * Export contributor aggregates to aggregates/contributors/*.jsonl
 */
export async function exportContributorAggregates(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  const contributorsDir = join(dataDir, "aggregates", "contributors");
  await mkdir(contributorsDir, { recursive: true });

  const aggregates = await contributorAggregateQueries.getAll(db);

  // Group by contributor
  const byContributor = new Map<string, typeof aggregates>();
  for (const aggregate of aggregates) {
    if (!byContributor.has(aggregate.contributor)) {
      byContributor.set(aggregate.contributor, []);
    }
    byContributor.get(aggregate.contributor)!.push(aggregate);
  }

  // Write one file per contributor
  for (const [username, contributorAggregates] of byContributor) {
    const lines = contributorAggregates
      .map((a) => JSON.stringify(a))
      .join("\n");
    await writeFile(
      join(contributorsDir, `${username}.jsonl`),
      lines + "\n",
      "utf-8"
    );
  }

  logger.info(
    `Exported ${aggregates.length} contributor aggregates for ${byContributor.size} contributors`
  );
}

/**
 * Export all aggregates
 */
export async function exportAggregates(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<void> {
  logger.info("Exporting aggregates");
  await exportGlobalAggregates(db, dataDir, logger);
  await exportContributorAggregateDefinitions(db, dataDir, logger);
  await exportContributorAggregates(db, dataDir, logger);
}
