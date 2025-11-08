import { createTables, getDb } from "@/lib/db";
import runGitHub from "@/scrapers/github/run";

async function main() {
  await createTables();

  const db = getDb();
  runGitHub(db);
}

main();
