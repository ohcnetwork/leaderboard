/**
 * Aggregation phase - calculates standard metrics after scraping
 */

import type { Database, Logger } from "@ohcnetwork/leaderboard-api";
import {
  contributorQueries,
  activityQueries,
  globalAggregateQueries,
  contributorAggregateDefinitionQueries,
  contributorAggregateQueries,
} from "@ohcnetwork/leaderboard-api";

/**
 * Run the aggregation phase
 * Calculates standard global and contributor aggregates
 */
export async function runAggregation(
  db: Database,
  logger: Logger
): Promise<void> {
  logger.info("Starting aggregation phase");

  // Calculate global aggregates
  await calculateGlobalAggregates(db, logger);

  // Calculate contributor aggregates
  await calculateContributorAggregates(db, logger);

  logger.info("Aggregation phase complete");
}

/**
 * Calculate standard global aggregates
 */
async function calculateGlobalAggregates(
  db: Database,
  logger: Logger
): Promise<void> {
  logger.info("Calculating global aggregates");

  // Define standard global aggregate definitions
  const definitions = [
    {
      slug: "total_contributors",
      name: "Total Contributors",
      description: "Total number of contributors",
    },
    {
      slug: "total_activities",
      name: "Total Activities",
      description: "Total number of activities",
    },
    {
      slug: "active_contributors_last_30d",
      name: "Active Contributors (Last 30 Days)",
      description: "Number of contributors with activity in the last 30 days",
    },
  ];

  // Calculate total contributors
  const totalContributors = await contributorQueries.count(db);
  await globalAggregateQueries.upsert(db, {
    slug: "total_contributors",
    name: "Total Contributors",
    description: "Total number of contributors",
    value: {
      type: "number",
      value: totalContributors,
      format: "integer",
    },
    hidden: false,
    meta: {
      calculated_at: new Date().toISOString(),
    },
  });
  logger.debug(`Total contributors: ${totalContributors}`);

  // Calculate total activities
  const totalActivities = await activityQueries.count(db);
  await globalAggregateQueries.upsert(db, {
    slug: "total_activities",
    name: "Total Activities",
    description: "Total number of activities",
    value: {
      type: "number",
      value: totalActivities,
      format: "integer",
    },
    hidden: false,
    meta: {
      calculated_at: new Date().toISOString(),
    },
  });
  logger.debug(`Total activities: ${totalActivities}`);

  // Calculate active contributors in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const recentActivities = await activityQueries.getByDateRange(
    db,
    thirtyDaysAgoStr,
    today
  );
  const activeContributors = new Set(recentActivities.map((a) => a.contributor))
    .size;

  await globalAggregateQueries.upsert(db, {
    slug: "active_contributors_last_30d",
    name: "Active Contributors (Last 30 Days)",
    description: "Number of contributors with activity in the last 30 days",
    value: {
      type: "number",
      value: activeContributors,
      format: "integer",
    },
    hidden: false,
    meta: {
      calculated_at: new Date().toISOString(),
      period_start: thirtyDaysAgoStr,
      period_end: today,
    },
  });
  logger.debug(`Active contributors (last 30d): ${activeContributors}`);

  logger.info("Global aggregates calculated", {
    total_contributors: totalContributors,
    total_activities: totalActivities,
    active_contributors_last_30d: activeContributors,
  });
}

/**
 * Calculate standard contributor aggregates
 */
async function calculateContributorAggregates(
  db: Database,
  logger: Logger
): Promise<void> {
  logger.info("Calculating contributor aggregates");

  // Define standard contributor aggregate definitions
  const definitions = [
    {
      slug: "total_activity_points",
      name: "Total Activity Points",
      description: "Sum of all activity points for the contributor",
      hidden: false,
    },
    {
      slug: "activity_count",
      name: "Activity Count",
      description: "Total number of activities by the contributor",
      hidden: false,
    },
    {
      slug: "first_activity_date",
      name: "First Activity Date",
      description: "Date of the contributor's first activity",
      hidden: false,
    },
    {
      slug: "last_activity_date",
      name: "Last Activity Date",
      description: "Date of the contributor's most recent activity",
      hidden: false,
    },
    {
      slug: "active_days",
      name: "Active Days",
      description: "Number of unique days with activity",
      hidden: false,
    },
    {
      slug: "avg_points_per_activity",
      name: "Average Points Per Activity",
      description: "Average points earned per activity",
      hidden: false,
    },
  ];

  // Upsert definitions
  for (const def of definitions) {
    await contributorAggregateDefinitionQueries.upsert(db, def);
  }

  // Get all contributors
  const contributors = await contributorQueries.getAll(db);
  logger.debug(`Processing ${contributors.length} contributors`);

  let processedCount = 0;

  for (const contributor of contributors) {
    const activities = await activityQueries.getByContributor(
      db,
      contributor.username
    );

    if (activities.length === 0) {
      // Skip contributors with no activities
      continue;
    }

    // Calculate total points
    const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
    await contributorAggregateQueries.upsert(db, {
      aggregate: "total_activity_points",
      contributor: contributor.username,
      value: {
        type: "number",
        value: totalPoints,
        format: "integer",
      },
      meta: {
        calculated_at: new Date().toISOString(),
      },
    });

    // Activity count
    await contributorAggregateQueries.upsert(db, {
      aggregate: "activity_count",
      contributor: contributor.username,
      value: {
        type: "number",
        value: activities.length,
        format: "integer",
      },
      meta: {
        calculated_at: new Date().toISOString(),
      },
    });

    // Sort activities by date
    const sortedActivities = [...activities].sort(
      (a, b) =>
        new Date(a.occured_at).getTime() - new Date(b.occured_at).getTime()
    );

    // First activity date
    const firstActivityDate = sortedActivities[0].occured_at.split("T")[0];
    await contributorAggregateQueries.upsert(db, {
      aggregate: "first_activity_date",
      contributor: contributor.username,
      value: {
        type: "string",
        value: firstActivityDate,
      },
      meta: {
        calculated_at: new Date().toISOString(),
      },
    });

    // Last activity date
    const lastActivityDate =
      sortedActivities[sortedActivities.length - 1].occured_at.split("T")[0];
    await contributorAggregateQueries.upsert(db, {
      aggregate: "last_activity_date",
      contributor: contributor.username,
      value: {
        type: "string",
        value: lastActivityDate,
      },
      meta: {
        calculated_at: new Date().toISOString(),
      },
    });

    // Active days (unique dates)
    const uniqueDates = new Set(
      activities.map((a) => a.occured_at.split("T")[0])
    );
    await contributorAggregateQueries.upsert(db, {
      aggregate: "active_days",
      contributor: contributor.username,
      value: {
        type: "number",
        value: uniqueDates.size,
        format: "integer",
        unit: "days",
      },
      meta: {
        calculated_at: new Date().toISOString(),
      },
    });

    // Average points per activity
    const avgPoints =
      activities.length > 0 ? totalPoints / activities.length : 0;
    await contributorAggregateQueries.upsert(db, {
      aggregate: "avg_points_per_activity",
      contributor: contributor.username,
      value: {
        type: "number",
        value: Math.round(avgPoints * 100) / 100, // Round to 2 decimals
        format: "decimal",
        decimals: 2,
      },
      meta: {
        calculated_at: new Date().toISOString(),
      },
    });

    processedCount++;
  }

  logger.info("Contributor aggregates calculated", {
    contributors_processed: processedCount,
  });
}
