import { getDb } from "../src/db";
import { pgDump } from "@electric-sql/pglite-tools/pg_dump";

async function main() {
  const db = getDb();
  const dump = await pgDump({ pg: db });
  console.log(await dump.text());
}

main();
