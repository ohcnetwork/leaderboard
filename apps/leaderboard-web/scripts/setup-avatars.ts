import { createClient } from "@libsql/client";
import { access, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../..");
const dataDir = process.env.LEADERBOARD_DATA_DIR || "./data";

const publicDir = path.resolve(__dirname, "../public");
const avatarsDir = path.resolve(publicDir, "avatars");
const dbSource = path.resolve(workspaceRoot, dataDir, ".leaderboard.db");

const AVATAR_SIZE = 256;
const CONCURRENCY = 10;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadAndOptimize(
  url: string,
  destPath: string,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  await sharp(buffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(destPath);
}

/** Process items with limited concurrency */
async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift()!;
        await fn(item);
      }
    },
  );
  await Promise.all(workers);
}

async function main() {
  console.log("🖼️  Setting up contributor avatars...");
  console.log(`   Database: ${dbSource}`);
  console.log(`   Output: ${avatarsDir}`);

  if (!(await fileExists(dbSource))) {
    console.warn("   ⚠ No .leaderboard.db found — skipping avatar setup");
    return;
  }

  await mkdir(avatarsDir, { recursive: true });

  const db = createClient({ url: `file:${dbSource}` });

  try {
    const result = await db.execute(
      "SELECT username, avatar_url FROM contributor WHERE avatar_url IS NOT NULL AND avatar_url != ''",
    );

    const contributors = result.rows as unknown as Array<{
      username: string;
      avatar_url: string;
    }>;

    console.log(`   Found ${contributors.length} contributors with avatars`);

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    await processWithConcurrency(
      contributors,
      CONCURRENCY,
      async (contributor) => {
        const destPath = path.join(avatarsDir, `${contributor.username}.webp`);

        if (await fileExists(destPath)) {
          skipped++;
          return;
        }

        try {
          await downloadAndOptimize(contributor.avatar_url, destPath);
          downloaded++;
        } catch (error) {
          failed++;
          console.warn(
            `   ⚠ Failed to download avatar for ${contributor.username}: ${error instanceof Error ? error.message : error}`,
          );
        }
      },
    );

    console.log(
      `   ✓ Avatars: ${downloaded} downloaded, ${skipped} cached, ${failed} failed`,
    );
  } finally {
    db.close();
  }

  console.log("   Done.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
