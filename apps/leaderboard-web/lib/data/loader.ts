/**
 * Data loading utilities for Next.js SSG
 * Uses LibSQL to query the database during build time
 */

import { getDatabase } from "@/lib/db/client";
import {
  contributorQueries,
  activityQueries,
  activityDefinitionQueries,
  badgeDefinitionQueries,
  contributorBadgeQueries,
  globalAggregateQueries,
  contributorAggregateQueries,
  type Contributor,
  type Activity,
  type ActivityDefinition,
  type BadgeDefinition,
  type ContributorBadge,
} from "@ohcnetwork/leaderboard-api";
import { LeaderboardEntry } from "./types";

/**
 * Get all contributors
 */
export async function getAllContributors() {
  const db = getDatabase();
  return await contributorQueries.getAll(db);
}

/**
 * Get contributor by username
 */
export async function getContributor(username: string) {
  const db = getDatabase();
  return await contributorQueries.getByUsername(db, username);
}

/**
 * Get contributors by role
 */
export async function getContributorsByRole(role: string) {
  const db = getDatabase();
  return await contributorQueries.getByRole(db, role);
}

/**
 * Get all activity definitions
 */
export async function getAllActivityDefinitions() {
  const db = getDatabase();
  return await activityDefinitionQueries.getAll(db);
}

/**
 * Get activity definition by slug
 */
export async function getActivityDefinition(slug: string) {
  const db = getDatabase();
  return await activityDefinitionQueries.getBySlug(db, slug);
}

/**
 * Get activities with optional filters
 */
export async function getActivities(
  options: {
    limit?: number;
    offset?: number;
    contributor?: string;
    startDate?: string;
    endDate?: string;
    definition?: string;
  } = {}
) {
  const db = getDatabase();

  if (options.contributor) {
    return await activityQueries.getByContributor(
      db,
      options.contributor,
      options.limit
    );
  }

  if (options.startDate && options.endDate) {
    return await activityQueries.getByDateRange(
      db,
      options.startDate,
      options.endDate
    );
  }

  if (options.definition) {
    return await activityQueries.getByDefinition(db, options.definition);
  }

  return await activityQueries.getAll(db, options.limit, options.offset);
}

/**
 * Get contributor stats
 */
export async function getContributorStats(username: string) {
  const db = getDatabase();

  const totalPoints = await activityQueries.getTotalPointsByContributor(
    db,
    username
  );
  const activities = await activityQueries.getByContributor(db, username);

  return {
    totalPoints,
    activityCount: activities.length,
    activities,
  };
}

/**
 * Get recent activities grouped by type
 */
export async function getRecentActivitiesGroupedByType(days: number = 7) {
  const db = getDatabase();
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  // Use optimized query with JOINs to get enriched activities
  const activities = await activityQueries.getRecentActivitiesEnriched(
    db,
    startDate.toISOString(),
    endDate.toISOString()
  );

  // Group activities by definition (still need JS grouping for nested structure)
  const grouped = new Map<
    string,
    {
      activity_definition: string;
      activity_name: string;
      activity_description: string | null;
      activities: Array<{
        slug: string;
        contributor: string;
        contributor_name: string | null;
        contributor_avatar_url: string | null;
        contributor_role: string | null;
        title: string | null;
        occured_at: string;
        link: string | null;
        text: string | null;
        points: number | null;
      }>;
    }
  >();

  for (const activity of activities) {
    if (!grouped.has(activity.activity_definition)) {
      grouped.set(activity.activity_definition, {
        activity_definition: activity.activity_definition,
        activity_name: activity.activity_name,
        activity_description: activity.activity_description,
        activities: [],
      });
    }

    grouped.get(activity.activity_definition)!.activities.push({
      slug: activity.slug,
      contributor: activity.contributor,
      contributor_name: activity.contributor_name,
      contributor_avatar_url: activity.contributor_avatar_url,
      contributor_role: activity.contributor_role,
      title: activity.title,
      occured_at: activity.occured_at,
      link: activity.link,
      text: activity.text,
      points: activity.points,
    });
  }

  return Array.from(grouped.values());
}

/**
 * Get global aggregates filtered by slugs and visibility
 */
export async function getGlobalAggregates(slugs: string[]) {
  const db = getDatabase();

  // Use optimized query with WHERE IN clause and hidden filtering
  return await globalAggregateQueries.getBySlugs(db, slugs);
}

/**
 * Get all contributor usernames
 */
export async function getAllContributorUsernames() {
  const db = getDatabase();
  // Use optimized query that only selects username column
  return await contributorQueries.getAllUsernames(db);
}

/**
 * Get contributor profile with activities
 */
export async function getContributorProfile(username: string) {
  const db = getDatabase();

  const contributor = await contributorQueries.getByUsername(db, username);
  if (!contributor) {
    return {
      contributor: null,
      activities: [],
      totalPoints: 0,
      activityByDate: {},
    };
  }

  const activities = await activityQueries.getByContributor(db, username);
  const totalPoints = await activityQueries.getTotalPointsByContributor(
    db,
    username
  );

  const activityDefinitions = await activityDefinitionQueries.getAll(db);
  const defMap = new Map(activityDefinitions.map((d) => [d.slug, d]));

  // Use optimized query to group activities by date
  const activityCountsByDate = await activityQueries.getActivityCountByDate(
    db,
    username
  );
  const activityByDate: Record<string, number> = {};
  for (const { date, count } of activityCountsByDate) {
    activityByDate[date] = count;
  }

  // Enrich activities with definition names
  const enrichedActivities = activities.map((activity) => {
    const def = defMap.get(activity.activity_definition);
    return {
      ...activity,
      activity_name: def?.name || activity.activity_definition,
      activity_description: def?.description || null,
      activity_icon: def?.icon || null,
    };
  });

  return {
    contributor,
    activities: enrichedActivities,
    totalPoints,
    activityByDate,
  };
}

/**
 * List all activity definitions
 */
export async function listActivityDefinitions() {
  const db = getDatabase();
  return await activityDefinitionQueries.getAll(db);
}

/**
 * Get contributor aggregates filtered by slugs and visibility
 */
export async function getContributorAggregates(
  username: string,
  slugs: string[]
) {
  const db = getDatabase();

  // Use optimized query with JOIN and filtering
  return await contributorAggregateQueries.getByContributorEnriched(
    db,
    username,
    slugs
  );
}

/**
 * Get all contributors with avatars (excluding hidden roles)
 */
export async function getAllContributorsWithAvatars(hiddenRoles: string[]) {
  const db = getDatabase();

  // Use optimized query with single JOIN to get points
  const contributorsWithPoints =
    await contributorQueries.getLeaderboardWithPoints(db, hiddenRoles);

  return contributorsWithPoints;
}

/**
 * Get leaderboard for a date range
 */
export async function getLeaderboard(
  startDate?: string | Date,
  endDate?: string | Date
) {
  const db = getDatabase();

  // Convert Date to string if needed
  const startDateStr =
    startDate instanceof Date ? startDate.toISOString() : startDate;
  const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

  // Use optimized query with JOIN to get enriched leaderboard
  return await activityQueries.getLeaderboardEnriched(
    db,
    undefined,
    startDateStr,
    endDateStr
  );
}

/**
 * Get top contributors by activity type
 */
export async function getTopContributorsByActivity(
  startDate?: string | Date,
  endDate?: string | Date,
  activitySlugs?: string[]
) {
  if (!activitySlugs || activitySlugs.length === 0) {
    return {};
  }

  const db = getDatabase();
  const result: Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  > = {};

  // Convert Date to string if needed
  const startDateStr =
    startDate instanceof Date ? startDate.toISOString() : startDate;
  const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

  // Use optimized query for each activity slug
  for (const activitySlug of activitySlugs) {
    const topContributors = await activityQueries.getTopByActivityEnriched(
      db,
      activitySlug,
      startDateStr,
      endDateStr,
      10 // Top 10
    );

    result[activitySlug] = topContributors;
  }

  return result;
}

/**
 * Get all badge definitions
 */
export async function getAllBadgeDefinitions() {
  const db = getDatabase();
  return await badgeDefinitionQueries.getAll(db);
}

/**
 * Get all badges earned by a contributor
 */
export async function getContributorBadges(
  username: string
): Promise<ContributorBadge[]> {
  const db = getDatabase();
  return await contributorBadgeQueries.getByContributor(db, username);
}

/**
 * Get recent badge achievements across all contributors
 * Returns badges with contributor and badge definition details
 */
export async function getRecentBadgeAchievements(limit: number = 20): Promise<
  Array<
    ContributorBadge & {
      contributor_name: string | null;
      contributor_avatar_url: string | null;
      badge_name: string;
      badge_description: string;
      badge_variants: Record<string, { description: string; svg_url: string }>;
    }
  >
> {
  const db = getDatabase();

  // Use optimized query with JOINs to get all data in one query
  const enrichedBadges = await contributorBadgeQueries.getRecentEnriched(
    db,
    limit
  );

  return enrichedBadges;
}

/**
 * Get top badge earners (contributors with most badges)
 */
export async function getTopBadgeEarners(limit: number = 10): Promise<
  Array<{
    username: string;
    name: string | null;
    avatar_url: string | null;
    badge_count: number;
  }>
> {
  const db = getDatabase();

  // Use optimized query with GROUP BY and JOIN
  const enrichedTopContributors =
    await contributorBadgeQueries.getTopEarnersEnriched(db, limit);

  return enrichedTopContributors;
}
