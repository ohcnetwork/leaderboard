import { existsSync, copyFileSync } from "fs";
import { writeFile } from "fs/promises";
import { join, resolve } from "path";

async function main() {
  const configPath = join(process.cwd(), "config.yaml");

  // Skip if config.yaml already exists
  if (existsSync(configPath)) {
    console.log(
      `config.yaml already exists at ${configPath}. Skipping config import.`
    );
    return;
  }

  const leaderboardConfig = process.env.LEADERBOARD_CONFIG;

  // If LEADERBOARD_CONFIG is not set, skip silently
  if (!leaderboardConfig) {
    console.log(
      "LEADERBOARD_CONFIG not set. Skipping config import. Using existing config.yaml if available."
    );
    return;
  }

  try {
    // Check if it's a URL (starts with http:// or https://)
    const isUrl = leaderboardConfig.startsWith("http://") || leaderboardConfig.startsWith("https://");

    if (isUrl) {
      console.log(`Downloading config from URL: ${leaderboardConfig}`);
      const response = await fetch(leaderboardConfig);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch config from URL: ${response.status} ${response.statusText}`
        );
      }

      const configContent = await response.text();
      await writeFile(configPath, configContent, "utf8");
      console.log(`Config downloaded successfully to: ${configPath}`);
    } else {
      // Treat as local file path
      const sourcePath = resolve(process.cwd(), leaderboardConfig);

      if (!existsSync(sourcePath)) {
        throw new Error(`Config file not found at path: ${sourcePath}`);
      }

      console.log(`Copying config from local path: ${sourcePath}`);
      copyFileSync(sourcePath, configPath);
      console.log(`Config copied successfully to: ${configPath}`);
    }
  } catch (error) {
    console.error("Error importing config:", error);
    throw error; // Fail the build if config import fails
  }
}

main();

