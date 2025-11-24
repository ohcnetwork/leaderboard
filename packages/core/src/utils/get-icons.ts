import { getConfig } from "@/src/config";
import { ScraperManifest } from "@/src/types";

async function getScraperManifests(): Promise<ScraperManifest<{}>[]> {
  // TODO: implement this
  return [];
}

export async function getAdditionallyRequiredIconNames() {
  const config = getConfig();
  const manifests = await getScraperManifests();

  const iconNames = [];

  // Get icons from social profiles config
  if (config.leaderboard.social_profiles) {
    iconNames.push(
      ...Object.values(config.leaderboard.social_profiles).map(
        (profile) => profile.icon
      )
    );
  }

  // Get icons from manifests of each scraper
  for (const manifest of manifests) {
    iconNames.push(
      ...[
        ...Object.values(manifest.activityDefinitions ?? {}).map(
          (activity) => activity.icon
        ),
        ...Object.values(manifest.globalAggregateDefinitions ?? {}).map(
          (aggregate) => aggregate.icon
        ),
      ].filter((k): k is string => k !== null)
    );
  }

  return Array.from(new Set(iconNames));
}
