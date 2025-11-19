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
  aggregates?: {
    global?: string[];
    contributor?: string[];
  };
}

export interface ScraperInstanceConfig {
  name: string;
  repository: string; // GitHub repository in format 'owner/repo'
  envs: Record<string, string>; // Environment variables
}

export interface ScraperConfig {
  schedule: string; // Cron expression
  scrapers: ScraperInstanceConfig[]; // List of scrapers
}

export interface Config {
  org: OrgConfig;
  meta: MetaConfig;
  leaderboard: LeaderboardConfig;
  scraper?: ScraperConfig;
}
