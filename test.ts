import { getDb } from "@/lib/db";

async function main() {
  const db = getDb();

  const result = await db.query(`
    SELECT * FROM contributor_aggregate;
  `);
  console.log(result.rows);
}

main();
