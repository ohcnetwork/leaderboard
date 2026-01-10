/**
 * Configuration types for dummy plugin
 */

export interface DummyPluginConfig {
  contributors?: {
    count?: number;
    minActivitiesPerContributor?: number;
    maxActivitiesPerContributor?: number;
  };
  activities?: {
    daysBack?: number;
    seed?: number;
  };
  organization?: {
    name?: string;
    repoNames?: string[];
  };
}

export const DEFAULT_CONFIG = {
  contributors: {
    count: 50,
    minActivitiesPerContributor: 5,
    maxActivitiesPerContributor: 100,
  },
  activities: {
    daysBack: 90,
    seed: undefined as number | undefined,
  },
  organization: {
    name: "Example Org",
    repoNames: ["main-app", "docs", "api", "cli", "website"],
  },
};

export function mergeConfig(config?: Partial<DummyPluginConfig>) {
  return {
    contributors: {
      ...DEFAULT_CONFIG.contributors,
      ...config?.contributors,
    },
    activities: {
      ...DEFAULT_CONFIG.activities,
      ...config?.activities,
    },
    organization: {
      ...DEFAULT_CONFIG.organization,
      ...config?.organization,
    },
  };
}

