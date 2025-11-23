import { getConfig } from "@leaderboard/core";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

async function main() {
  const outputPath = join(process.cwd(), "app", "overrides.gen.css");

  try {
    const config = getConfig();
    const themeUrl = config.leaderboard.theme;

    if (!themeUrl) {
      console.log("No theme configured.");

      // Check if file already exists
      if (existsSync(outputPath)) {
        console.log(
          `File already exists: ${outputPath}. Skipping theme download.`
        );
        return;
      }

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
      "Creating empty overrides.gen.css file to prevent build failure..."
    );
    await writeFile(outputPath, "", "utf8");
  }
}

main();
