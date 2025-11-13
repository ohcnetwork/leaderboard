import { getConfig } from "@/lib/config";
import { writeFile } from "fs/promises";
import { join } from "path";

async function main() {
  try {
    const config = getConfig();
    const themeUrl = config.leaderboard.theme;

    if (!themeUrl) {
      console.log("No theme configured, skipping theme download.");
      return;
    }

    console.log(`Fetching theme from: ${themeUrl}`);

    const response = await fetch(themeUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch theme: ${response.status} ${response.statusText}`
      );
    }

    const cssContent = await response.text();
    const outputPath = join(process.cwd(), "app", "overrides.css");

    await writeFile(outputPath, cssContent, "utf8");
    console.log(`Theme downloaded successfully to: ${outputPath}`);
  } catch (error) {
    console.error("Error downloading theme:", error);
    // Don't fail the build if theme download fails
    console.warn("Continuing build without custom theme...");
  }
}

main();
