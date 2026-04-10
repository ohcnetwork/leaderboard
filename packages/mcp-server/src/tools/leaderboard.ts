/**
 * Leaderboard query tools
 */

import { z } from "zod";
import { activityQueries, contributorQueries } from "@ohcnetwork/leaderboard-api";
import type { ServerContext, ToolResult } from "../types.js";
import {
  createSuccessResult,
  createErrorResult,
  validatePagination,
  parseDate,
} from "../utils.js";

/**
 * Schema for get_leaderboard tool
 */
export const GetLeaderboardSchema = z.object({
  exclude_roles: z
    .array(z.string())
    .optional()
    .describe("Roles to exclude from leaderboard"),
  start_date: z
    .string()
    .optional()
    .describe("Start date for filtering (ISO format: YYYY-MM-DD)"),
  end_date: z
    .string()
    .optional()
    .describe("End date for filtering (ISO format: YYYY-MM-DD)"),
  limit: z.number().optional().describe("Maximum number of results (1-1000)"),
});

/**
 * Get leaderboard rankings
 */
export async function getLeaderboard(
  args: z.infer<typeof GetLeaderboardSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const { limit } = validatePagination(args.limit);

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (args.start_date && args.end_date) {
      startDate = parseDate(args.start_date);
      endDate = parseDate(args.end_date);
    }

    const leaderboard = await activityQueries.getLeaderboardEnriched(
      context.db,
      limit,
      startDate,
      endDate,
    );

    // Filter out excluded roles if specified
    let filteredLeaderboard = leaderboard;
    if (args.exclude_roles && args.exclude_roles.length > 0) {
      filteredLeaderboard = leaderboard.filter(
        (entry) => !args.exclude_roles!.includes(entry.role),
      );
    }

    // Add rank to each entry
    const rankedLeaderboard = filteredLeaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return createSuccessResult({
      leaderboard: rankedLeaderboard,
      total: rankedLeaderboard.length,
      filters: {
        exclude_roles: args.exclude_roles || [],
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_contributor_ranking tool
 */
export const GetContributorRankingSchema = z.object({
  username: z.string().describe("Contributor username"),
  exclude_roles: z
    .array(z.string())
    .optional()
    .describe("Roles to exclude when calculating rank"),
});

/**
 * Get a contributor's ranking position
 */
export async function getContributorRanking(
  args: z.infer<typeof GetContributorRankingSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    // Check if contributor exists
    const contributor = await contributorQueries.getByUsername(
      context.db,
      args.username,
    );

    if (!contributor) {
      return createErrorResult(`Contributor not found: ${args.username}`);
    }

    // Get full leaderboard
    const leaderboard = await contributorQueries.getLeaderboardWithPoints(
      context.db,
      args.exclude_roles || [],
    );

    // Find contributor's position
    const position = leaderboard.findIndex(
      (entry) => entry.username === args.username,
    );

    if (position === -1) {
      return createSuccessResult({
        username: args.username,
        rank: null,
        totalPoints: 0,
        totalContributors: leaderboard.length,
        percentile: 0,
        message: "Contributor has no recorded activities",
      });
    }

    const contributorData = leaderboard[position];
    const percentile =
      leaderboard.length > 1
        ? ((leaderboard.length - position) / leaderboard.length) * 100
        : 100;

    return createSuccessResult({
      username: args.username,
      rank: position + 1,
      totalPoints: contributorData.totalPoints,
      totalContributors: leaderboard.length,
      percentile: Math.round(percentile * 100) / 100,
      role: contributorData.role,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_top_by_activity tool
 */
export const GetTopByActivitySchema = z.object({
  activity_type: z.string().describe("Activity definition slug"),
  limit: z.number().optional().describe("Maximum number of results (1-100)"),
  start_date: z
    .string()
    .optional()
    .describe("Start date for filtering (ISO format: YYYY-MM-DD)"),
  end_date: z
    .string()
    .optional()
    .describe("End date for filtering (ISO format: YYYY-MM-DD)"),
});

/**
 * Get top contributors for a specific activity type
 */
export async function getTopByActivity(
  args: z.infer<typeof GetTopByActivitySchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const limit = Math.min(args.limit || 10, 100);

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (args.start_date && args.end_date) {
      startDate = parseDate(args.start_date);
      endDate = parseDate(args.end_date);
    }

    const topContributors = await activityQueries.getTopByActivityEnriched(
      context.db,
      args.activity_type,
      startDate,
      endDate,
      limit,
    );

    // Add rank to each entry
    const rankedContributors = topContributors.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return createSuccessResult({
      activity_type: args.activity_type,
      top_contributors: rankedContributors,
      total: rankedContributors.length,
      filters: {
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_active_contributors tool
 */
export const GetActiveContributorsSchema = z.object({
  start_date: z.string().describe("Start date (ISO format: YYYY-MM-DD)"),
  end_date: z.string().describe("End date (ISO format: YYYY-MM-DD)"),
  exclude_roles: z
    .array(z.string())
    .optional()
    .describe("Roles to exclude from results"),
  limit: z.number().optional().describe("Maximum number of results (1-1000)"),
});

/**
 * Get contributors who were active in a specific time period
 */
export async function getActiveContributors(
  args: z.infer<typeof GetActiveContributorsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const startDate = parseDate(args.start_date);
    const endDate = parseDate(args.end_date);
    const { limit } = validatePagination(args.limit);

    const activeContributors = await contributorQueries.getActiveContributors(
      context.db,
      startDate,
      endDate,
      args.exclude_roles || [],
    );

    // Apply limit
    const limitedResults = activeContributors.slice(0, limit);

    // Add rank to each entry
    const rankedContributors = limitedResults.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return createSuccessResult({
      active_contributors: rankedContributors,
      total: activeContributors.length,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      filters: {
        exclude_roles: args.exclude_roles || [],
      },
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}
