import { getDb } from "@/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const restoredPG = getDb();
  // ... and restore it using the dump
  await restoredPG.exec(readFileSync(join(process.cwd(), "out.sql"), "utf8"));
  console.log("Database restored successfully");
}

main();
