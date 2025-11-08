import { PGlite } from "@electric-sql/pglite";
import type {
  LeaderboardEntry,
  ActivityBreakdown,
  TimeFilter,
  ContributorStats,
  TimeRange,
} from "@/types";
import {
  getContributorsWithStats,
  getActivities,
  timeFilterToRange,
} from "./db";

/**
 * Get activity breakdown for a contributor
 */
async function getActivityBreakdown(
  db: PGlite,
  username: string,
  timeRange?: TimeRange
): Promise<ActivityBreakdown[]> {
  const conditions: string[] = [`a.contributor = $1`];
  const params: (string | number)[] = [username];
  let paramIndex = 2;

  if (timeRange?.since) {
    conditions.push(`a.occured_at >= $${paramIndex++}`);
    params.push(timeRange.since.toISOString());
  }

  if (timeRange?.till) {
    conditions.push(`a.occured_at <= $${paramIndex++}`);
    params.push(timeRange.till.toISOString());
  }

  const query = `
    SELECT 
      a.activity_definition,
      ad.name as activity_name,
      COUNT(a.slug) as count,
      COALESCE(SUM(COALESCE(a.points, ad.points, 0)), 0) as total_points
    FROM activity a
    LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${conditions.join(" AND ")}
    GROUP BY a.activity_definition, ad.name
    ORDER BY total_points DESC, count DESC
  `;

  const result = await db.query(query, params);

  return (result.rows as Record<string, string | number | null>[]).map(
    (row) => ({
      activity_definition: row.activity_definition as string,
      activity_name: row.activity_name as string,
      count: parseInt(row.count as string, 10),
      total_points: parseInt(row.total_points as string, 10),
    })
  );
}

/**
 * Calculate leaderboard with rankings
 */
export async function getLeaderboard(
  db: PGlite,
  filter: TimeFilter = { type: "all-time" }
): Promise<LeaderboardEntry[]> {
  const timeRange = timeFilterToRange(filter);
  const contributorsWithStats = await getContributorsWithStats(db, timeRange);

  const leaderboard: LeaderboardEntry[] = [];
  let currentRank = 1;
  let previousPoints = -1;
  let skipCount = 0;

  for (const stat of contributorsWithStats) {
    // Skip contributors with no activity
    if (stat.activity_count === 0) {
      continue;
    }

    // Handle ties - same points get same rank
    if (stat.total_points !== previousPoints) {
      currentRank += skipCount;
      skipCount = 1;
    } else {
      skipCount++;
    }

    const activityBreakdown = await getActivityBreakdown(
      db,
      stat.contributor.username,
      timeRange
    );

    leaderboard.push({
      rank: currentRank,
      contributor: stat.contributor,
      total_points: stat.total_points,
      activity_count: stat.activity_count,
      activity_breakdown: activityBreakdown,
    });

    previousPoints = stat.total_points;
  }

  return leaderboard;
}

/**
 * Get contributor rank for a specific time filter
 */
export async function getContributorRank(
  db: PGlite,
  username: string,
  filter: TimeFilter
): Promise<number> {
  const leaderboard = await getLeaderboard(db, filter);
  const entry = leaderboard.find((e) => e.contributor.username === username);
  return entry?.rank || 0;
}

/**
 * Get detailed stats for a single contributor
 */
export async function getContributorStats(
  db: PGlite,
  username: string
): Promise<ContributorStats | null> {
  const timeRange = timeFilterToRange({ type: "all-time" });
  const stats = await getContributorsWithStats(db, timeRange);
  const contributorStat = stats.find(
    (s) => s.contributor.username === username
  );

  if (!contributorStat) {
    return null;
  }

  // Get activity breakdown
  const activityBreakdown = await getActivityBreakdown(db, username);

  // Get recent activities
  const recentActivities = await getActivities(db, {
    contributor: username,
    limit: 50,
  });

  // Get ranks for different time periods
  const [allTimeRank, yearlyRank, monthlyRank, weeklyRank] = await Promise.all([
    getContributorRank(db, username, { type: "all-time" }),
    getContributorRank(db, username, { type: "yearly", years: 1 }),
    getContributorRank(db, username, { type: "monthly", months: 1 }),
    getContributorRank(db, username, { type: "weekly", weeks: 1 }),
  ]);

  return {
    contributor: contributorStat.contributor,
    total_points: contributorStat.total_points,
    activity_count: contributorStat.activity_count,
    activity_breakdown: activityBreakdown,
    recent_activities: recentActivities,
    ranks: {
      all_time: allTimeRank,
      yearly: yearlyRank,
      monthly: monthlyRank,
      weekly: weeklyRank,
    },
  };
}

/**
 * Get top N contributors for a time filter
 */
export async function getTopContributors(
  db: PGlite,
  limit: number = 10,
  filter: TimeFilter = { type: "all-time" }
): Promise<LeaderboardEntry[]> {
  const leaderboard = await getLeaderboard(db, filter);
  return leaderboard.slice(0, limit);
}
