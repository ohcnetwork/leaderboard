import { getDb } from "@/lib/db";
import path from "path";
import yaml from "js-yaml";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { format } from "date-fns";
import { Contributor } from "@leaderboard/core";

async function main() {
  const db = getDb();

  // Check for LEADERBOARD_DATA_PATH environment variable
  const flatDataPath = process.env.LEADERBOARD_DATA_PATH;
  if (!flatDataPath) {
    throw new Error("LEADERBOARD_DATA_PATH environment variable is not set");
  }

  // Create contributors directory
  const contributorsDir = path.join(flatDataPath, "contributors");
  if (!existsSync(contributorsDir)) {
    await mkdir(contributorsDir, { recursive: true });
  }

  // Get all contributors
  const { rows: contributors } = await db.query<Contributor>(`
    SELECT username, name, role, title, avatar_url, joining_date, meta, social_profiles, bio FROM contributor;
  `);
  console.log(`Exporting ${contributors.length} contributors...`);

  // Export each contributor to a markdown file
  for (const contributor of contributors) {
    const filename = `${contributor.username}.md`;
    const filepath = path.join(contributorsDir, filename);

    // Build frontmatter object
    const frontmatter: Record<
      string,
      string | Record<string, string> | null | undefined
    > = {
      name: contributor.name ?? undefined,
      role: contributor.role ?? undefined,
      title: contributor.title ?? undefined,
      avatar_url: contributor.avatar_url ?? undefined,
      joining_date: contributor.joining_date
        ? format(contributor.joining_date, "yyyy-MM-dd")
        : undefined,
    };

    // Add meta as YAML if present
    if (contributor.meta) {
      frontmatter.meta = contributor.meta;
    }

    // Add social_profiles if present
    if (contributor.social_profiles) {
      frontmatter.social_profiles = contributor.social_profiles;
    }

    // Generate markdown content
    const yamlFrontmatter = yaml.dump(frontmatter, {
      lineWidth: -1, // Don't wrap lines
      noRefs: true, // Don't use references
    });

    const content = `---
${yamlFrontmatter.trim()}
---

${contributor.bio || ""}
`;

    // Write to file
    await writeFile(filepath, content, "utf-8");
    console.log(`Exported: ${filename}`);
  }

  console.log("Export complete!");
}

main();
