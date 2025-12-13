import { getConfig } from "@/src/config";
import { ScraperManifest } from "@/src/types";

export async function getScraperManifests(): Promise<ScraperManifest<{}>[]> {
  const scrapers = getConfig().leaderboard.scrapers;

  if (!scrapers) {
    console.warn("No scrapers configured.");
    return [];
  }

  // TODO: implement this

  // step 1: get scrapers from config

  // step 2: for each scraper, fetch its manifest (e.g., from a URL or local file)

  // step 3: import and parse the manifest for each scraper and return them
  return [];
}
