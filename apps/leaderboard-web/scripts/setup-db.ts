import { access, copyFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getConfig } from "../lib/config/get-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../..");
const dataDir = process.env.LEADERBOARD_DATA_DIR || "./data";

const publicDir = path.resolve(__dirname, "../public");
const dbSource = path.resolve(workspaceRoot, dataDir, ".leaderboard.db");

const httpvfsDist = path.resolve(
  __dirname,
  "../node_modules/sql.js-httpvfs/dist",
);

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isExternalUrl(source: string): boolean {
  return source.startsWith("http://") || source.startsWith("https://");
}

async function main() {
  console.log("🗄️  Setting up SQL REPL assets...");
  console.log(`   Data directory: ${dataDir}`);

  const config = getConfig();
  const explorerConfig = config.leaderboard.data_explorer;
  const enabled = explorerConfig?.enabled !== false;

  if (!enabled) {
    console.log("   ℹ Data Explorer is disabled in config.yaml — skipping");
    return;
  }

  await mkdir(publicDir, { recursive: true });

  const externalSource =
    explorerConfig?.source && isExternalUrl(explorerConfig.source);

  if (externalSource) {
    console.log(`   ℹ External database source: ${explorerConfig.source}`);
    console.log("   ↳ Skipping local data.db copy");
  } else {
    if (await fileExists(dbSource)) {
      await copyFile(dbSource, path.join(publicDir, "data.db"));
      console.log("   ✓ Copied database → public/data.db");
    } else {
      console.warn(
        "   ⚠ No .leaderboard.db found — SQL REPL will be unavailable",
      );
      return;
    }
  }

  // Worker and WASM are always needed locally
  const assets = [
    { src: "sqlite.worker.js", dest: "sqlite.worker.js" },
    { src: "sql-wasm.wasm", dest: "sql-wasm.wasm" },
  ];

  for (const { src, dest } of assets) {
    const srcPath = path.join(httpvfsDist, src);
    if (await fileExists(srcPath)) {
      await copyFile(srcPath, path.join(publicDir, dest));
      console.log(`   ✓ Copied ${src} → public/${dest}`);
    } else {
      console.error(`   ✗ Missing ${srcPath}`);
      process.exit(1);
    }
  }

  console.log("   Done.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
