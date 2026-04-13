/**
 * Configuration types for dummy plugin
 */

import { z } from "zod";

export const DummyPluginConfigSchema = z
  .object({
    contributors: z
      .object({
        count: z.number().int().positive().optional(),
        minActivitiesPerContributor: z.number().int().nonnegative().optional(),
        maxActivitiesPerContributor: z.number().int().positive().optional(),
      })
      .optional(),
    activities: z
      .object({
        daysBack: z.number().int().positive().optional(),
        seed: z.number().int().optional(),
      })
      .optional(),
    organization: z
      .object({
        name: z.string().min(1).optional(),
        repoNames: z.array(z.string().min(1)).optional(),
      })
      .optional(),
  })
  .optional()
  .default({});

export type DummyPluginConfig = z.infer<typeof DummyPluginConfigSchema>;

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
