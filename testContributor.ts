import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createTables, upsertContributor } from "./lib/db";
import { Contributor } from "./types/db";

/**
 * Interface for frontmatter data extracted from markdown files
 */
interface FrontmatterData {
  name: string | null;
  title: string | null;
  role: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  slack: string | null;
  joining_date: string | null;
}

/**
 * Extract frontmatter and bio from markdown content
 */
function parseMarkdown(content: string): {
  frontmatter: FrontmatterData;
  bio: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match || !match[1] || !match[2]) {
    return {
      frontmatter: {
        name: null,
        title: null,
        role: null,
        github: null,
        twitter: null,
        linkedin: null,
        slack: null,
        joining_date: null,
      },
      bio: "",
    };
  }

  const frontmatterText = match[1];
  const bio = match[2].trim();

  // Parse frontmatter fields
  const extractField = (fieldName: string): string | null => {
    const regex = new RegExp(`^${fieldName}:\\s*(.*)$`, "m");
    const fieldMatch = frontmatterText.match(regex);
    if (!fieldMatch || !fieldMatch[1]) return null;

    // Remove quotes and trim
    let value = fieldMatch[1].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    return value === "" ? null : value;
  };

  return {
    frontmatter: {
      name: extractField("name"),
      title: extractField("title"),
      role: extractField("role"),
      github: extractField("github"),
      twitter: extractField("twitter"),
      linkedin: extractField("linkedin"),
      slack: extractField("slack"),
      joining_date: extractField("joining_date"),
    },
    bio,
  };
}

/**
 * Parse date in MM/DD/YYYY format
 */
function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null;

  // Try to parse MM/DD/YYYY format
  const parts = dateString.split("/");
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }

  return null;
}

/**
 * Build social profiles object from frontmatter data
 */
function buildSocialProfiles(
  frontmatter: FrontmatterData
): Record<string, string> | null {
  const profiles: Record<string, string> = {};

  if (frontmatter.github && frontmatter.github.trim()) {
    profiles.github = `https://github.com/${frontmatter.github.trim()}`;
  }

  if (frontmatter.twitter && frontmatter.twitter.trim()) {
    profiles.twitter = `https://twitter.com/${frontmatter.twitter.trim()}`;
  }

  if (frontmatter.linkedin && frontmatter.linkedin.trim()) {
    profiles.linkedin = `https://linkedin.com/in/${frontmatter.linkedin.trim()}`;
  }

  if (frontmatter.slack && frontmatter.slack.trim()) {
    profiles.slack = `https://rebuildearth.slack.com/team/${frontmatter.slack.trim()}`;
  }

  return Object.keys(profiles).length > 0 ? profiles : null;
}

/**
 * Main function to import contributors from markdown files
 */
async function main() {
  const contributorsDir = "/home/nikhila-c/leaderboard-data/contributors";

  console.log("Starting contributor import...");
  console.log(`Reading from: ${contributorsDir}`);

  // Ensure database tables exist
  await createTables();
  console.log("Database tables ready.");

  // Read all markdown files
  const files = readdirSync(contributorsDir).filter((file) =>
    file.endsWith(".md")
  );

  console.log(`Found ${files.length} markdown files.`);

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const contributors: Contributor[] = [];

  for (const file of files) {
    try {
      // Extract username from filename
      const username = file.replace(/\.md$/, "");

      // Skip files with username length < 2
      if (username.length < 2) {
        console.log(`⏭️  Skipping ${file} (username too short)`);
        skippedCount++;
        continue;
      }

      // Read file content
      const filePath = join(contributorsDir, file);
      const content = readFileSync(filePath, "utf-8");

      // Parse markdown
      const { frontmatter, bio } = parseMarkdown(content);

      // Build social profiles
      const socialProfiles = buildSocialProfiles(frontmatter);

      // Parse joining date
      const joiningDate = parseDate(frontmatter.joining_date);

      // Create contributor object
      const contributor: Contributor = {
        username,
        name: frontmatter.name,
        role: frontmatter.role,
        title: frontmatter.title,
        avatar_url: `https://avatars.githubusercontent.com/${username}`,
        bio: bio || null,
        social_profiles: socialProfiles,
        joining_date: joiningDate,
        meta: null, // Do not update meta column
      };

      contributors.push(contributor);
      processedCount++;

      console.log(`✅ Processed: ${username}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      errorCount++;
    }
  }

  // Insert contributors into database in batches
  if (contributors.length > 0) {
    console.log(
      `\nInserting ${contributors.length} contributors into database...`
    );

    // Process in batches of 50 to avoid too large SQL queries
    const batchSize = 50;
    for (let i = 0; i < contributors.length; i += batchSize) {
      const batch = contributors.slice(i, i + batchSize);
      try {
        await upsertContributor(...batch);
        console.log(
          `  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            contributors.length / batchSize
          )}`
        );
      } catch (error) {
        console.error(`  Error inserting batch:`, error);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📈 Summary:");
  console.log(`  ✅ Successfully processed: ${processedCount}`);
  console.log(`  ⏭️  Skipped (username < 2): ${skippedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📊 Total files: ${files.length}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
