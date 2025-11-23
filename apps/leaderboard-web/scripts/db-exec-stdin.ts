import { getDb } from "@/lib/db";

const getStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
};

async function main() {
  const db = getDb();
  const sql = await getStdin();

  console.log("⚙️ Executing SQL...");
  await db.exec(sql);
  console.log("✅ SQL executed successfully");
}

main();
