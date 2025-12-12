// lib/db.ts — temporary stub (no DB)

export interface Activity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title?: string;
  occured_at: Date;
  link?: string;
  text?: string;
  points?: number | null;
  meta?: Record<string, unknown>;
}

export interface ActivityGroup {
  activity_definition: string;
  activity_name: string;
  activity_description: string | null;
  activity_points: number | null;
  activities: Array<
    Activity & {
      contributor_name: string | null;
      contributor_avatar_url: string | null;
      contributor_role: string | null;
    }
  >;
}

// Used by app/page.tsx
export async function getRecentActivitiesGroupedByType(_days: number): Promise<ActivityGroup[]> {
  return [];
}

// (Optional) stubs for other imports; add as you see “module not found” errors:

export async function getLeaderboard() {
  return [];
}

export async function getTopContributorsByActivity() {
  return {};
}

export async function getAllContributorsWithAvatars() {
  return [];
}

export async function getAllContributorUsernames() {
  return [];
}

export async function getContributor(_username: string) {
  return null;
}

export async function getContributorProfile(_username: string) {
  return { contributor: null, activities: [], totalPoints: 0, activityByDate: {} };
}
