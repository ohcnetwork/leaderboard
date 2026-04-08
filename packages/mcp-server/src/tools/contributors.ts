/**
 * Contributor query tools
 */

import { z } from "zod";
import {
  contributorQueries,
  activityQueries,
  contributorAggregateQueries,
  contributorBadgeQueries,
} from "@ohcnetwork/leaderboard-api";
import type { ServerContext, ToolResult } from "../types.js";
import {
  createSuccessResult,
  createErrorResult,
  validatePagination,
} from "../utils.js";

/**
 * Schema for query_contributors tool
 */
export const QueryContributorsSchema = z.object({
  role: z.string().optional().describe("Filter by contributor role"),
  limit: z.number().optional().describe("Maximum number of results (1-1000)"),
  offset: z.number().optional().describe("Number of results to skip"),
});

/**
 * Query contributors with optional filters
 */
export async function queryContributors(
  args: z.infer<typeof QueryContributorsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const { limit, offset } = validatePagination(args.limit, args.offset);

    let contributors;
    if (args.role) {
      contributors = await contributorQueries.getByRole(context.db, args.role);
    } else {
      contributors = await contributorQueries.getAll(context.db);
    }

    // Apply pagination
    const paginatedResults = contributors.slice(offset, offset + limit);

    return createSuccessResult({
      contributors: paginatedResults,
      total: contributors.length,
      limit,
      offset,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_contributor tool
 */
export const GetContributorSchema = z.object({
  username: z.string().describe("Contributor username"),
});

/**
 * Get detailed information about a specific contributor
 */
export async function getContributor(
  args: z.infer<typeof GetContributorSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const contributor = await contributorQueries.getByUsername(
      context.db,
      args.username,
    );

    if (!contributor) {
      return createErrorResult(`Contributor not found: ${args.username}`);
    }

    return createSuccessResult(contributor);
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_contributor_stats tool
 */
export const GetContributorStatsSchema = z.object({
  username: z.string().describe("Contributor username"),
});

/**
 * Get comprehensive statistics for a contributor
 */
export async function getContributorStats(
  args: z.infer<typeof GetContributorStatsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const contributor = await contributorQueries.getByUsername(
      context.db,
      args.username,
    );

    if (!contributor) {
      return createErrorResult(`Contributor not found: ${args.username}`);
    }

    // Get activities
    const activities = await activityQueries.getByContributor(
      context.db,
      args.username,
    );

    // Get total points
    const totalPoints = await activityQueries.getTotalPointsByContributor(
      context.db,
      args.username,
    );

    // Get aggregates
    const aggregates = await contributorAggregateQueries.getByContributor(
      context.db,
      args.username,
    );

    // Get badges
    const badges = await contributorBadgeQueries.getByContributor(
      context.db,
      args.username,
    );

    // Get activity count by date
    const activityByDate = await activityQueries.getActivityCountByDate(
      context.db,
      args.username,
    );

    return createSuccessResult({
      contributor,
      stats: {
        totalPoints,
        activityCount: activities.length,
        badgeCount: badges.length,
      },
      recentActivities: activities.slice(0, 10),
      aggregates,
      badges,
      activityByDate: activityByDate.slice(-90), // Last 90 days
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for batch_get_contributors tool
 */
export const BatchGetContributorsSchema = z.object({
  usernames: z.array(z.string()).describe("List of contributor usernames"),
});

/**
 * Get multiple contributors in a single batch request
 */
export async function batchGetContributors(
  args: z.infer<typeof BatchGetContributorsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const results = await Promise.all(
      args.usernames.map(async (username) => {
        const contributor = await contributorQueries.getByUsername(
          context.db,
          username,
        );
        return {
          username,
          found: !!contributor,
          data: contributor,
        };
      }),
    );

    return createSuccessResult({
      results,
      total: results.length,
      found: results.filter((r) => r.found).length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}
