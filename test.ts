import { getDb } from "@/lib/db";

async function main() {
  const db = getDb();

  // Show sample of contributors and their current roles and slack IDs
  const result = await db.query<{
    username: string;
    name: string | null;
    role: string | null;
    slack_user_id: string | null;
  }>(
    "SELECT username, name, role, meta->>'slack_user_id' as slack_user_id FROM contributor LIMIT 10;"
  );

  console.log("Sample contributors from database:");
  console.log("=".repeat(70));
  result.rows.forEach((row) => {
    console.log(`Username: ${row.username}`);
    console.log(`Name: ${row.name || "N/A"}`);
    console.log(`Role: ${row.role || "Not set"}`);
    console.log(`Slack User ID: ${row.slack_user_id || "Not set"}`);
    console.log("-".repeat(70));
  });

  console.log("\nTo update all roles and Slack IDs, run:");
  console.log("  pnpm update-roles");
}

main();
