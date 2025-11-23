interface OrgConfig {
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

interface MetaConfig {
  title: string;
  description: string;
  image_url: string;
  site_url: string;
  favicon_url: string;
}

interface RoleConfig {
  name: string;
  description?: string;
  hidden?: boolean;
}

interface SocialProfileConfig {
  icon: string;
}

interface ScraperInstanceConfig {
  name?: string; // Optional display name
  source: string; // npm package.json dependency format (e.g., 'owner/repo', 'git+https://...', 'https://...tar.gz', 'file:../path', version ranges, etc.)
  config?: Record<string, unknown>; // Optional scraper-specific config
}

interface LeaderboardConfig {
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
