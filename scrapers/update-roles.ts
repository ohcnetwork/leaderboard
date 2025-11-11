import { getDb, listContributors } from "@/lib/db";

const CONTRIBUTOR_BASE_URL =
  "https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors";

interface FrontmatterData {
  role: string | null;
  slack: string | null;
}

/**
 * Extract role and slack from markdown frontmatter
 * @param markdown - The markdown content with frontmatter
 * @returns The role and slack extracted from frontmatter
 */
function extractFrontmatterData(markdown: string): FrontmatterData {
  // Match frontmatter between --- delimiters
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = markdown.match(frontmatterRegex);

  if (!match || !match[1]) {
    return { role: null, slack: null };
  }

  const frontmatter = match[1];

  // Extract role field from frontmatter
  const roleRegex = /^role:\s*(.+)$/m;
  const roleMatch = frontmatter.match(roleRegex);
  const role = roleMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || null;

  // Extract slack field from frontmatter
  const slackRegex = /^slack:\s*(.+)$/m;
  const slackMatch = frontmatter.match(slackRegex);
  let slack = slackMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || null;

  // If slack is empty string, treat it as null
  if (slack === "") {
    slack = null;
  }

  return { role, slack };
}

/**
 * Fetch contributor markdown from GitHub
 * @param username - The GitHub username
 * @returns The markdown content or null if not found
 */
async function fetchContributorMarkdown(
  username: string
): Promise<string | null> {
  const url = `${CONTRIBUTOR_BASE_URL}/${username}.md`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`  ⚠️  Markdown file not found for ${username}`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`  ❌ Error fetching markdown for ${username}:`, error);
    return null;
  }
}

/**
 * Update contributor role and slack in database
 * @param username - The GitHub username
 * @param role - The role to update
 * @param slackUserId - The Slack user ID to update (optional)
 */
async function updateContributor(
  username: string,
  role: string | null,
  slackUserId: string | null
): Promise<void> {
  const db = getDb();

  if (role && slackUserId) {
    // Update both role and slack_user_id in meta
    await db.query(
      `UPDATE contributor 
       SET role = $1, 
           meta = COALESCE(meta, '{}'::json)::jsonb || $2::jsonb 
       WHERE username = $3;`,
      [role, JSON.stringify({ slack_user_id: slackUserId }), username]
    );
  } else if (role) {
    // Update only role
    await db.query(`UPDATE contributor SET role = $1 WHERE username = $2;`, [
      role,
      username,
    ]);
  } else if (slackUserId) {
    // Update only slack_user_id in meta
    await db.query(
      `UPDATE contributor 
       SET meta = COALESCE(meta, '{}'::json)::jsonb || $1::jsonb 
       WHERE username = $2;`,
      [JSON.stringify({ slack_user_id: slackUserId }), username]
    );
  }
}

/**
 * Main function to update all contributor roles
 */
async function main() {
  console.log("🚀 Starting role update process...\n");

  // Get all contributors from database
  const contributors = await listContributors();
  console.log(`📊 Found ${contributors.length} contributors in database\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let noDataCount = 0;
  let errorCount = 0;

  // Process each contributor
  for (const contributor of contributors) {
    const username = contributor.username;
    console.log(`Processing: ${username}`);

    try {
      // Fetch markdown file
      const markdown = await fetchContributorMarkdown(username);

      if (!markdown) {
        notFoundCount++;
        continue;
      }

      // Extract role and slack from frontmatter
      const { role, slack } = extractFrontmatterData(markdown);

      if (!role && !slack) {
        console.log(
          `  ⚠️  No role or slack found in frontmatter for ${username}`
        );
        noDataCount++;
        continue;
      }

      // Update contributor in database
      await updateContributor(username, role, slack);

      const updates: string[] = [];
      if (role) updates.push(`role: ${role}`);
      if (slack) updates.push(`slack_user_id: ${slack}`);

      console.log(`  ✅ Updated ${updates.join(", ")}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error processing ${username}:`, error);
      errorCount++;
    }

    console.log(); // Empty line for readability
  }

  // Print summary
  console.log("=".repeat(50));
  console.log("📈 Summary:");
  console.log(`  ✅ Successfully updated: ${successCount}`);
  console.log(`  ⚠️  Markdown not found: ${notFoundCount}`);
  console.log(`  ⚠️  No role or slack in frontmatter: ${noDataCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📊 Total processed: ${contributors.length}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
