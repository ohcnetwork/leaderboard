// Database Models
export interface Contributor {
  username: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  email: string | null;
  bio: string | null;
}

export interface ActivityDefinition {
  slug: string;
  name: string;
  description: string | null;
  points: number | null;
}

export interface Activity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title: string | null;
  occured_at: Date;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, any> | null;
}

// Configuration Types
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
}

export interface LeaderboardConfig {
  data_source: string;
  roles: Record<string, RoleConfig>;
}

export interface ScraperConfig {
  github?: {
    org?: string;
    token?: string;
  };
  slack?: {
    api_key?: string;
  };
}

export interface Config {
  org: OrgConfig;
  meta: MetaConfig;
  leaderboard: LeaderboardConfig;
  scrapers?: ScraperConfig;
}

// Leaderboard Data Types
export interface ActivityBreakdown {
  activity_definition: string;
  activity_name: string;
  count: number;
  total_points: number;
}

export interface LeaderboardEntry {
  rank: number;
  contributor: Contributor;
  total_points: number;
  activity_count: number;
  activity_breakdown: ActivityBreakdown[];
}

export interface ContributorStats {
  contributor: Contributor;
  total_points: number;
  activity_count: number;
  activity_breakdown: ActivityBreakdown[];
  recent_activities: Activity[];
  ranks: {
    all_time: number;
    yearly: number;
    monthly: number;
    weekly: number;
  };
}

// Time Filter Types
export type TimeFilter = 
  | { type: 'all-time' }
  | { type: 'weekly'; weeks?: number }
  | { type: 'monthly'; months?: number }
  | { type: 'yearly'; years?: number }
  | { type: 'custom'; since: string; till: string };

export interface TimeRange {
  since?: Date;
  till?: Date;
}

// Activity with enriched data
export interface EnrichedActivity extends Activity {
  contributor_info: Contributor;
  activity_definition_info: ActivityDefinition;
  calculated_points: number;
}

