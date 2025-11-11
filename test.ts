import { getDb } from "@/lib/db";
import { pgDump } from "@electric-sql/pglite-tools/pg_dump";

async function main() {
  const db = getDb();

  const dump = await pgDump({ pg: db });

  const dumpContent = await dump.text();

  console.log(dumpContent);
}

main();
