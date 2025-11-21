import { prisma } from "@/lib/db";
import path from "path";
import yaml from "js-yaml";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { format } from "date-fns";

async function main() {
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
  const contributors = await prisma.contributor.findMany({
    select: {
      username: true,
      name: true,
      role: true,
      title: true,
      avatarUrl: true,
      joiningDate: true,
      meta: true,
      socialProfiles: true,
      bio: true,
    },
  });

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
      avatar_url: contributor.avatarUrl ?? undefined,
      joining_date: contributor.joiningDate
        ? format(contributor.joiningDate, "yyyy-MM-dd")
        : undefined,
    };

    // Add meta as YAML if present
    if (contributor.meta) {
      frontmatter.meta = contributor.meta as Record<string, string>;
    }

    // Add social_profiles if present
    if (contributor.socialProfiles) {
      frontmatter.social_profiles = contributor.socialProfiles as Record<
        string,
        string
      >;
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

  // Disconnect Prisma client
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  prisma.$disconnect();
  process.exit(1);
});
