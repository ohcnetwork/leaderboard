import { getConfig } from "@/lib/config";
import { writeFile } from "fs/promises";
import { join } from "path";

async function main() {
  const outputPath = join(process.cwd(), "app", "overrides.css");

  try {
    const config = getConfig();
    const themeUrl = config.leaderboard.theme;

    if (!themeUrl) {
      console.log("No theme configured, creating empty overrides.css file.");
      await writeFile(outputPath, "", "utf8");
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
    await writeFile(outputPath, cssContent, "utf8");
    console.log(`Theme downloaded successfully to: ${outputPath}`);
  } catch (error) {
    console.error("Error downloading theme:", error);
    // Don't fail the build if theme download fails
    console.warn(
      "Creating empty overrides.css file to prevent build failure..."
    );
    await writeFile(outputPath, "", "utf8");
  }
}

main();
