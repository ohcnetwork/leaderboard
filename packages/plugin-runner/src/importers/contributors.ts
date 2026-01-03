/**
 * Import contributors from markdown files
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import type { Database, Contributor } from "@leaderboard/plugin-api";
import { contributorQueries } from "@leaderboard/db";
import type { Logger } from "@leaderboard/plugin-api";

/**
 * Import all contributors from markdown files
 */
export async function importContributors(
  db: Database,
  dataDir: string,
  logger: Logger
): Promise<number> {
  const contributorsDir = join(dataDir, "contributors");
  
  try {
    const files = await readdir(contributorsDir);
    const markdownFiles = files.filter((f) => f.endsWith(".md"));
    
    logger.info(`Found ${markdownFiles.length} contributor files`);
    
    let imported = 0;
    
    for (const file of markdownFiles) {
      try {
        const filePath = join(contributorsDir, file);
        const content = await readFile(filePath, "utf-8");
        const contributor = parseContributorMarkdown(content);
        
        await contributorQueries.upsert(db, contributor);
        imported++;
        logger.debug(`Imported contributor: ${contributor.username}`);
      } catch (error) {
        logger.warn(`Failed to import contributor from ${file}`, { error: (error as Error).message });
      }
    }
    
    logger.info(`Imported ${imported} contributors`);
    return imported;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      logger.warn("Contributors directory not found, skipping import");
      return 0;
    }
    throw error;
  }
}

/**
 * Parse contributor markdown file with frontmatter
 */
function parseContributorMarkdown(content: string): Contributor {
  const { data, content: bio } = matter(content);
  
  if (!data.username) {
    throw new Error("Contributor must have a username in frontmatter");
  }
  
  return {
    username: data.username,
    name: data.name || null,
    role: data.role || null,
    title: data.title || null,
    avatar_url: data.avatar_url || null,
    bio: bio.trim() || null,
    social_profiles: data.social_profiles || null,
    joining_date: data.joining_date || null,
    meta: data.meta || null,
  };
}

