import prepare from "@/scrapers/github/prepare";
import { PGlite } from "@electric-sql/pglite";

async function run(db: PGlite) {
  await prepare(db);
}

export default run;
