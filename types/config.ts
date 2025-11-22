export interface OrgConfig {
  name: string;
  description: string;
  url: string;
  logo_url: string;
  start_date?: string;
  socials?: {
    github?: string;
    slack?: string;
    linkedin?: string;
    youtube?: string;
    email?: string;
  };
}

export interface MetaConfig {
  title: string;
  description: string;
  image_url: string;
  site_url: string;
  favicon_url: string;
}

export interface RoleConfig {
  name: string;
  description?: string;
  hidden?: boolean;
}

export interface SocialProfileConfig {
  icon: string;
}

export interface ScraperInstanceConfig {
  name?: string; // Optional display name
  source: string; // Git URL, GitHub org/repo, file URL, or tarball URL
  config?: Record<string, unknown>; // Optional scraper-specific config
}

export interface LeaderboardConfig {
  data_source: string;
  roles: Record<string, RoleConfig>;
  top_contributors?: string[];
  social_profiles?: Record<string, SocialProfileConfig>;
  theme?: string;
  aggregates?: {
    global?: string[];
    contributor?: string[];
  };
  scrapers?: Record<string, ScraperInstanceConfig>;
}

export interface Config {
  org: OrgConfig;
  meta: MetaConfig;
  leaderboard: LeaderboardConfig;
}
