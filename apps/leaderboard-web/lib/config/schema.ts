import z from "zod";

export const OrgConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.url(),
  logo_url: z.url(),
  start_date: z.string().optional(),
  socials: z
    .object({
      github: z.string().optional(),
      slack: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
      email: z.email().optional(),
    })
    .optional(),
});

export const MetaConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.url(),
  site_url: z.url(),
  favicon_url: z.url(),
});

export const RoleConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  hidden: z.boolean().optional(),
});

export const SocialProfileConfigSchema = z.object({
  icon: z.string(),
});

export const ScraperInstanceConfigSchema = z.object({
  name: z.string().optional(),
  source: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const LeaderboardConfigSchema = z.object({
  data_source: z.string(),
  roles: z.record(z.string(), RoleConfigSchema),
  top_contributors: z.array(z.string()).optional(),
  social_profiles: z.record(z.string(), SocialProfileConfigSchema).optional(),
  theme: z.string().optional(),
  aggregates: z
    .object({
      global: z.array(z.string()).optional(),
      contributor: z.array(z.string()).optional(),
    })
    .optional(),
  scrapers: z.record(z.string(), ScraperInstanceConfigSchema).optional(),
});

export const ConfigSchema = z.object({
  org: OrgConfigSchema,
  meta: MetaConfigSchema,
  leaderboard: LeaderboardConfigSchema,
});

// Export inferred types
export type OrgConfig = z.infer<typeof OrgConfigSchema>;
export type MetaConfig = z.infer<typeof MetaConfigSchema>;
export type RoleConfig = z.infer<typeof RoleConfigSchema>;
export type SocialProfileConfig = z.infer<typeof SocialProfileConfigSchema>;
export type ScraperInstanceConfig = z.infer<typeof ScraperInstanceConfigSchema>;
export type LeaderboardConfig = z.infer<typeof LeaderboardConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;
