import { createTables, getDb, upsertActivityDefinitions } from "@/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  // const restoredPG = getDb();
  // // ... and restore it using the dump
  // await restoredPG.exec(readFileSync(join(process.cwd(), "out.sql"), "utf8"));
  // console.log("Database restored successfully");

  await createTables();

  await upsertActivityDefinitions({
    slug: "comment_created",
    name: "Commented",
    description: "Commented on an Issue/PR",
    points: 0,
    icon: "message-circle",
  });
}

main();
