import {
  getDb,
  listContributorAggregateDefinitions,
  listGlobalAggregates,
} from "@/lib/db";

async function main() {
  console.log(await listGlobalAggregates());
  console.log(await listContributorAggregateDefinitions());

  const db = getDb();

  const result = await db.query(`
    SELECT * FROM contributor_aggregate;
  `);
  console.log(result.rows);
}

main();
