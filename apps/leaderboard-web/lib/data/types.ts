/**
 * Type definitions for data loader
 */

export interface LeaderboardEntry {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role: string | null;
  total_points: number;
  activity_count: number;
  activity_breakdown?: Record<string, { count: number; points: number }>;
  daily_activity?: Array<{ date: string; count: number; points: number }>;
}

export interface ContributorActivity {
  slug: string;
  contributor: string;
  activity_definition: string;
  activity_name: string;
  activity_description: string | null;
  activity_icon: string | null;
  title: string | null;
  occured_at: string;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, unknown> | null;
}

