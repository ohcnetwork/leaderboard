import { createTables } from "@/lib/db";

async function main() {
  await createTables();
}

main();
