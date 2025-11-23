import { upsertContributor } from "@leaderboard/core";
import path from "path";
import yaml from "js-yaml";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { Contributor } from "@/src/types/db";

interface FrontmatterData {
  name?: string | null;
  role?: string | null;
  title?: string | null;
  avatar_url?: string | null;
  joining_date?: string | null;
  meta?: Record<string, string> | null;
  social_profiles?: Record<string, string> | null;
}

/**
 * Parse markdown file with YAML frontmatter
 * @param content - The markdown file content
 * @returns Parsed frontmatter and body content
 */
function parseMarkdownWithFrontmatter(content: string): {
  frontmatter: FrontmatterData;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error("Invalid markdown format: missing frontmatter");
  }

  const frontmatterYaml = match[1] ?? "";
  const body = match[2]?.trim() ?? "";

  const frontmatter = (yaml.load(frontmatterYaml) as FrontmatterData) ?? {};

  return { frontmatter, body };
}

async function main() {
  // Check for LEADERBOARD_DATA_PATH environment variable
  const flatDataPath = process.env.LEADERBOARD_DATA_PATH;
  if (!flatDataPath) {
    throw new Error("LEADERBOARD_DATA_PATH environment variable is not set");
  }

  // Check if contributors directory exists
  const contributorsDir = path.join(flatDataPath, "contributors");
  if (!existsSync(contributorsDir)) {
    console.log(
      `Contributors directory does not exist: ${contributorsDir}. Skipping import.`
    );
    return;
  }

  // Read all markdown files from contributors directory
  const files = await readdir(contributorsDir);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  console.log(`Found ${markdownFiles.length} contributor files to import...`);

  const contributors: Contributor[] = [];

  // Parse each markdown file
  for (const filename of markdownFiles) {
    const filepath = path.join(contributorsDir, filename);
    const content = await readFile(filepath, "utf-8");

    try {
      const { frontmatter, body } = parseMarkdownWithFrontmatter(content);

      // Extract username from filename (remove .md extension)
      const username = path.basename(filename, ".md");

      // Build contributor object
      const contributor: Contributor = {
        username,
        name: frontmatter.name ?? null,
        role: frontmatter.role ?? null,
        title: frontmatter.title ?? null,
        avatar_url: frontmatter.avatar_url ?? null,
        bio: body || null,
        social_profiles: frontmatter.social_profiles ?? null,
        joining_date: frontmatter.joining_date
          ? new Date(frontmatter.joining_date)
          : null,
        meta: frontmatter.meta ?? null,
      };

      contributors.push(contributor);
      console.log(`Parsed: ${filename}`);
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
      throw error;
    }
  }

  // Upsert all contributors to database
  console.log(`Importing ${contributors.length} contributors to database...`);
  await upsertContributor(...contributors);

  console.log("Import complete!");
}

main();
