import { getConfig } from "@/src/config";
import { ScraperManifest } from "@/src/types";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let manifestsCache: ScraperManifest<{}>[] | null = null;

export async function getScraperManifests() {
  if (manifestsCache) {
    return manifestsCache;
  }

  const scrapers = getConfig().leaderboard.scrapers;

  if (!scrapers) {
    console.warn("No scrapers configured.");
    return [];
  }

  const manifests: ScraperManifest<{}>[] = [];
  const tempDir = os.tmpdir();

  for (const [name, { source }] of Object.entries(scrapers)) {
    const path = join(tempDir, `${name}.mjs`);
    execFileSync("curl", ["-fsSL", source, "-o", path]);
    manifests.push(await import(pathToFileURL(path).toString()));
  }

  manifestsCache = manifests;

  return manifests;
}
