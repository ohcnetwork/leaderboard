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
  type Contributor,
  type Activity,
  type ActivityDefinition,
  type BadgeDefinition,
  type ContributorBadge,
} from "@leaderboard/api";
import { LeaderboardEntry } from "./types";

/**
 * Get all contributors
 */
export async function getAllContributors(): Promise<Contributor[]> {
  const db = getDatabase();
  return await contributorQueries.getAll(db);
}

/**
 * Get contributor by username
 */
export async function getContributor(
  username: string
): Promise<Contributor | null> {
  const db = getDatabase();
  return await contributorQueries.getByUsername(db, username);
}

/**
 * Get contributors by role
 */
export async function getContributorsByRole(
  role: string
): Promise<Contributor[]> {
  const db = getDatabase();
  return await contributorQueries.getByRole(db, role);
}

/**
 * Get all activity definitions
 */
export async function getAllActivityDefinitions(): Promise<
  ActivityDefinition[]
> {
  const db = getDatabase();
  return await activityDefinitionQueries.getAll(db);
}

/**
 * Get activity definition by slug
 */
export async function getActivityDefinition(
  slug: string
): Promise<ActivityDefinition | null> {
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
): Promise<Activity[]> {
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
 * Get total points for a contributor
 */
export async function getContributorTotalPoints(
  username: string
): Promise<number> {
  const db = getDatabase();
  return await activityQueries.getTotalPointsByContributor(db, username);
}

/**
 * Get contributor stats
 */
export async function getContributorStats(username: string): Promise<{
  totalPoints: number;
  activityCount: number;
  activities: Activity[];
}> {
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
 * Get aggregate statistics
 */
export async function getAggregateStats(): Promise<{
  totalContributors: number;
  totalActivities: number;
  totalActivityDefinitions: number;
}> {
  const db = getDatabase();

  const [totalContributors, totalActivities, totalActivityDefinitions] =
    await Promise.all([
      contributorQueries.count(db),
      activityQueries.count(db),
      activityDefinitionQueries.count(db),
    ]);

  return {
    totalContributors,
    totalActivities,
    totalActivityDefinitions,
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

  const activities = await activityQueries.getByDateRange(
    db,
    startDate.toISOString(),
    endDate.toISOString()
  );

  const activityDefinitions = await activityDefinitionQueries.getAll(db);
  const contributors = await contributorQueries.getAll(db);

  // Create maps for quick lookup
  const defMap = new Map(activityDefinitions.map((d) => [d.slug, d]));
  const contribMap = new Map(contributors.map((c) => [c.username, c]));

  // Group activities by definition
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
    const def = defMap.get(activity.activity_definition);
    const contrib = contribMap.get(activity.contributor);

    if (!def) continue;

    if (!grouped.has(activity.activity_definition)) {
      grouped.set(activity.activity_definition, {
        activity_definition: activity.activity_definition,
        activity_name: def.name,
        activity_description: def.description,
        activities: [],
      });
    }

    grouped.get(activity.activity_definition)!.activities.push({
      slug: activity.slug,
      contributor: activity.contributor,
      contributor_name: contrib?.name || null,
      contributor_avatar_url: contrib?.avatar_url || null,
      contributor_role: contrib?.role || null,
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
 * Get global aggregates (stub for custom aggregates)
 */
export async function getGlobalAggregates(
  slugs: string[]
): Promise<
  Array<{ slug: string; name: string; value: any; description: string | null }>
> {
  // This is a placeholder for custom aggregates
  // In a real implementation, these would be computed by plugins
  // or stored in a separate aggregates table
  return [];
}

/**
 * Get all contributor usernames
 */
export async function getAllContributorUsernames(): Promise<string[]> {
  const db = getDatabase();
  const contributors = await contributorQueries.getAll(db);
  return contributors.map((c) => c.username);
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

  // Group activities by date
  const activityByDate: Record<string, number> = {};
  for (const activity of activities) {
    const date = activity.occured_at.split("T")[0];
    if (date) {
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    }
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
 * Get contributor aggregates (stub for custom aggregates)
 */
export async function getContributorAggregates(
  username: string,
  slugs: string[]
): Promise<Array<{ aggregate: string; value: any }>> {
  // This is a placeholder for custom aggregates
  // In a real implementation, these would be computed by plugins
  return [];
}

/**
 * Get all contributors with avatars (excluding hidden roles)
 */
export async function getAllContributorsWithAvatars(hiddenRoles: string[]) {
  const db = getDatabase();
  const allContributors = await contributorQueries.getAll(db);

  // Filter out hidden roles
  const visibleContributors = allContributors.filter(
    (c) => !c.role || !hiddenRoles.includes(c.role)
  );

  // Get total points for each contributor
  const contributorsWithPoints = await Promise.all(
    visibleContributors.map(async (contributor) => {
      const totalPoints = await activityQueries.getTotalPointsByContributor(
        db,
        contributor.username
      );
      return {
        username: contributor.username,
        name: contributor.name,
        avatar_url: contributor.avatar_url,
        role: contributor.role,
        totalPoints,
      };
    })
  );

  // Sort by total points descending
  contributorsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

  return contributorsWithPoints;
}

/**
 * Get leaderboard for a date range
 */
export async function getLeaderboard(
  startDate?: string | Date,
  endDate?: string | Date
): Promise<LeaderboardEntry[]> {
  const db = getDatabase();

  // Convert Date to string if needed
  const startDateStr =
    startDate instanceof Date ? startDate.toISOString() : startDate;
  const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

  const leaderboardData = await activityQueries.getLeaderboard(
    db,
    undefined,
    startDateStr,
    endDateStr
  );

  const contributors = await contributorQueries.getAll(db);
  const contribMap = new Map(contributors.map((c) => [c.username, c]));

  return leaderboardData.map((entry) => {
    const contrib = contribMap.get(entry.contributor);
    return {
      username: entry.contributor,
      name: contrib?.name || null,
      avatar_url: contrib?.avatar_url || null,
      role: contrib?.role || null,
      total_points: entry.total_points,
      activity_count: entry.activity_count,
    };
  });
}

/**
 * Get top contributors by activity type
 */
export async function getTopContributorsByActivity(
  startDate?: string | Date,
  endDate?: string | Date,
  activitySlugs?: string[]
): Promise<
  Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  >
> {
  if (!activitySlugs || activitySlugs.length === 0) {
    return {};
  }

  const db = getDatabase();
  const result: Record<string, any[]> = {};

  // Convert Date to string if needed
  const startDateStr =
    startDate instanceof Date ? startDate.toISOString() : startDate;
  const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

  const contributors = await contributorQueries.getAll(db);
  const contribMap = new Map(contributors.map((c) => [c.username, c]));

  for (const activitySlug of activitySlugs) {
    const activities = await activityQueries.getByDateRange(
      db,
      startDateStr || "",
      endDateStr || ""
    );

    // Filter by activity definition
    const filtered = activities.filter(
      (a) => a.activity_definition === activitySlug
    );

    // Group by contributor and calculate totals
    const grouped = new Map<
      string,
      { total_points: number; activity_count: number }
    >();

    for (const activity of filtered) {
      if (!grouped.has(activity.contributor)) {
        grouped.set(activity.contributor, {
          total_points: 0,
          activity_count: 0,
        });
      }
      const entry = grouped.get(activity.contributor)!;
      entry.total_points += activity.points || 0;
      entry.activity_count += 1;
    }

    // Convert to array and add contributor info
    const topContributors = Array.from(grouped.entries())
      .map(([username, data]) => {
        const contrib = contribMap.get(username);
        return {
          username: username,
          name: contrib?.name || null,
          avatar_url: contrib?.avatar_url || null,
          points: data.total_points,
          count: data.activity_count,
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 10); // Top 10

    result[activitySlug] = topContributors;
  }

  return result;
}

/**
 * Get all badge definitions
 */
export async function getAllBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const db = getDatabase();
  return await badgeDefinitionQueries.getAll(db);
}

/**
 * Get a specific badge definition by slug
 */
export async function getBadgeDefinition(
  slug: string
): Promise<BadgeDefinition | null> {
  const db = getDatabase();
  return await badgeDefinitionQueries.getBySlug(db, slug);
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

  // Get all badges sorted by achieved_on date
  const allBadges = await contributorBadgeQueries.getAll(db);

  // Sort by achieved_on descending and take limit
  const recentBadges = allBadges
    .sort(
      (a, b) =>
        new Date(b.achieved_on).getTime() - new Date(a.achieved_on).getTime()
    )
    .slice(0, limit);

  // Enrich with contributor and badge definition data
  const enrichedBadges = await Promise.all(
    recentBadges.map(async (badge) => {
      const contributor = await contributorQueries.getByUsername(
        db,
        badge.contributor
      );
      const badgeDefinition = await badgeDefinitionQueries.getBySlug(
        db,
        badge.badge
      );

      return {
        ...badge,
        contributor_name: contributor?.name || null,
        contributor_avatar_url: contributor?.avatar_url || null,
        badge_name: badgeDefinition?.name || badge.badge,
        badge_description: badgeDefinition?.description || "",
        badge_variants: badgeDefinition?.variants || {},
      };
    })
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

  const allBadges = await contributorBadgeQueries.getAll(db);

  // Count badges per contributor
  const badgeCounts = allBadges.reduce((acc, badge) => {
    acc[badge.contributor] = (acc[badge.contributor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top contributors
  const topContributors = Object.entries(badgeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  // Enrich with contributor data
  const enrichedTopContributors = await Promise.all(
    topContributors.map(async ([username, badge_count]) => {
      const contributor = await contributorQueries.getByUsername(db, username);
      return {
        username,
        name: contributor?.name || null,
        avatar_url: contributor?.avatar_url || null,
        badge_count,
      };
    })
  );

  return enrichedTopContributors;
}
