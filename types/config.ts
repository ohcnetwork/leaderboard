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

export interface LeaderboardConfig {
  data_source: string;
  roles: Record<string, RoleConfig>;
  top_contributors?: string[];
  social_profiles?: Record<string, SocialProfileConfig>;
  theme?: string;
}

export interface ScraperInstanceConfig {
  source: string; // Git URL or relative local path
  cron?: string; // Cron expression (optional - if not specified, manually triggered)
  [key: string]: string | undefined; // Additional scraper-specific attributes
}

export type ScraperConfig = Record<string, ScraperInstanceConfig>;

export interface Config {
  org: OrgConfig;
  meta: MetaConfig;
  leaderboard: LeaderboardConfig;
  scrapers?: ScraperConfig;
}
