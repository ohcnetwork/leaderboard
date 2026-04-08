import { access, cp, mkdir, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "../../..");
const dataDir = process.env.LEADERBOARD_DATA_DIR || "./data";

const assetsSource = path.resolve(workspaceRoot, dataDir, "assets");
const assetsDestination = path.resolve(__dirname, "../public/assets");

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("📦 Setting up assets from data repository...");
  console.log(`   Data directory: ${dataDir}`);
  console.log(`   Assets source: ${assetsSource}`);
  console.log(`   Assets destination: ${assetsDestination}`);

  try {
    // Clean up existing assets directory if it exists
    if (await directoryExists(assetsDestination)) {
      await rm(assetsDestination, { recursive: true, force: true });
      console.log("   ✓ Cleaned existing assets directory");
    }

    // Check if assets directory exists in data repository
    if (await directoryExists(assetsSource)) {
      // Copy assets directory to public/assets
      await mkdir(path.dirname(assetsDestination), { recursive: true });
      await cp(assetsSource, assetsDestination, { recursive: true });
      console.log("   ✓ Assets copied successfully");
    } else {
      console.log("   ℹ No assets directory found in data repository");
      console.log(
        "   ℹ Create an 'assets' directory in your data repository to serve custom assets",
      );
    }
  } catch (error) {
    console.error("   ✗ Failed to copy assets:", error);
    process.exit(1);
  }

  console.log("   Done.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
