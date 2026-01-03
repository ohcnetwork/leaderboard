import { getConfig } from "@/src/config";
import { getScraperManifests } from "@/src/utils/get-scraper-manifests";

export async function getAdditionallyRequiredIconNames() {
  const config = getConfig();

  const iconNames = new Set<string>();

  // Get icons from social profiles config
  if (config.leaderboard.social_profiles) {
    for (const profile of Object.values(config.leaderboard.social_profiles)) {
      iconNames.add(profile.icon);
    }
  }

  // Get icons from manifests of each scraper
  for (const manifest of await getScraperManifests()) {
    // Get icons from activity definitions
    if (manifest.activityDefinitions) {
      for (const definition of Object.values(manifest.activityDefinitions)) {
        if (definition.icon) {
          iconNames.add(definition.icon);
        }
      }
    }

    // Get icons from contributor aggregate definitions
    if (manifest.contributorAggregateDefinitions) {
      for (const definition of Object.values(
        manifest.contributorAggregateDefinitions
      )) {
        if (definition.icon) {
          iconNames.add(definition.icon);
        }
      }
    }

    // Get icons from global aggregate definitions
    // TODO: get from db
  }

  return Array.from(iconNames);
}
