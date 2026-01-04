/**
 * Export contributors to markdown files
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import type { Database } from "@leaderboard/api";
import { contributorQueries } from "@leaderboard/api";
import type { Logger } from "@leaderboard/api";

/**
 * Export all contributors to markdown files
 */
export async function exportContributors(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<number> {
  const contributorsDir = join(dataDir, "contributors");
  await mkdir(contributorsDir, { recursive: true });
  
  const contributors = await contributorQueries.getAll(db);
  logger.info(`Exporting ${contributors.length} contributors`);
  
  for (const contributor of contributors) {
    const content = serializeContributorToMarkdown(contributor);
    const filePath = join(contributorsDir, `${contributor.username}.md`);
    await writeFile(filePath, content, "utf-8");
    logger.debug(`Exported contributor: ${contributor.username}`);
  }
  
  logger.info(`Exported ${contributors.length} contributors`);
  return contributors.length;
}

/**
 * Serialize contributor to markdown with frontmatter
 */
function serializeContributorToMarkdown(contributor: any): string {
  const { username, bio, ...frontmatter } = contributor;
  
  // Remove null values from frontmatter
  const cleanFrontmatter: Record<string, unknown> = { username };
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== null) {
      cleanFrontmatter[key] = value;
    }
  }
  
  return matter.stringify(bio || "", cleanFrontmatter);
}

