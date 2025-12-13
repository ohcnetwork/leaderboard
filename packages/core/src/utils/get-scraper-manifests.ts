import { getConfig } from "@/src/config";
import { ScraperManifest } from "@/src/types";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function getScraperManifests() {
  const scrapers = getConfig().leaderboard.scrapers;

  if (!scrapers) {
    console.warn("No scrapers configured.");
    return [];
  }

  const manifests: ScraperManifest<{}>[] = [];
  const tempDir = os.tmpdir();

  for (const [name, { source }] of Object.entries(scrapers)) {
    const filePath = join(tempDir, `${name}.mjs`);
    execFileSync("curl", ["-fsSL", source, "-o", filePath]);
    const manifest = await import(pathToFileURL(filePath).toString());
    manifests.push(manifest);
  }

  return manifests;
}
