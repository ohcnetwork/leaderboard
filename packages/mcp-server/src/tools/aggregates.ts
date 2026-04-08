/**
 * Badge and aggregate query tools
 */

import { z } from "zod";
import {
  badgeDefinitionQueries,
  contributorBadgeQueries,
  globalAggregateQueries,
  contributorAggregateQueries,
  contributorAggregateDefinitionQueries,
  activityQueries,
} from "@ohcnetwork/leaderboard-api";
import type { ServerContext, ToolResult } from "../types.js";
import {
  createSuccessResult,
  createErrorResult,
  validatePagination,
} from "../utils.js";

/**
 * Schema for get_badges tool
 */
export const GetBadgesSchema = z.object({
  username: z
    .string()
    .optional()
    .describe("Get badges for a specific contributor"),
  badge_slug: z
    .string()
    .optional()
    .describe("Get specific badge definition"),
});

/**
 * Get badge definitions or contributor badges
 */
export async function getBadges(
  args: z.infer<typeof GetBadgesSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    // Get badges for a specific contributor
    if (args.username) {
      const badges = await contributorBadgeQueries.getByContributor(
        context.db,
        args.username,
      );

      return createSuccessResult({
        username: args.username,
        badges,
        total: badges.length,
      });
    }

    // Get specific badge definition
    if (args.badge_slug) {
      const badge = await badgeDefinitionQueries.getBySlug(
        context.db,
        args.badge_slug,
      );

      if (!badge) {
        return createErrorResult(`Badge not found: ${args.badge_slug}`);
      }

      return createSuccessResult(badge);
    }

    // Get all badge definitions
    const badges = await badgeDefinitionQueries.getAll(context.db);

    return createSuccessResult({
      badges,
      total: badges.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_recent_badges tool
 */
export const GetRecentBadgesSchema = z.object({
  limit: z.number().optional().describe("Maximum number of results (1-100)"),
});

/**
 * Get recently awarded badges
 */
export async function getRecentBadges(
  args: z.infer<typeof GetRecentBadgesSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const limit = Math.min(args.limit || 20, 100);

    const recentBadges = await contributorBadgeQueries.getRecentEnriched(
      context.db,
      limit,
    );

    return createSuccessResult({
      recent_badges: recentBadges,
      total: recentBadges.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_top_badge_earners tool
 */
export const GetTopBadgeEarnersSchema = z.object({
  limit: z.number().optional().describe("Maximum number of results (1-100)"),
});

/**
 * Get contributors with the most badges
 */
export async function getTopBadgeEarners(
  args: z.infer<typeof GetTopBadgeEarnersSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const limit = Math.min(args.limit || 10, 100);

    const topEarners = await contributorBadgeQueries.getTopEarnersEnriched(
      context.db,
      limit,
    );

    // Add rank to each entry
    const rankedEarners = topEarners.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return createSuccessResult({
      top_earners: rankedEarners,
      total: rankedEarners.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_global_aggregates tool
 */
export const GetGlobalAggregatesSchema = z.object({
  slugs: z
    .array(z.string())
    .optional()
    .describe("Filter by specific aggregate slugs"),
});

/**
 * Get organization-level aggregates
 */
export async function getGlobalAggregates(
  args: z.infer<typeof GetGlobalAggregatesSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    if (args.slugs && args.slugs.length > 0) {
      const aggregates = await globalAggregateQueries.getBySlugs(
        context.db,
        args.slugs,
      );

      return createSuccessResult({
        aggregates,
        total: aggregates.length,
      });
    }

    const aggregates = await globalAggregateQueries.getAllVisible(context.db);

    return createSuccessResult({
      aggregates,
      total: aggregates.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_contributor_aggregates tool
 */
export const GetContributorAggregatesSchema = z.object({
  username: z.string().describe("Contributor username"),
  slugs: z
    .array(z.string())
    .optional()
    .describe("Filter by specific aggregate slugs"),
});

/**
 * Get aggregates for a specific contributor
 */
export async function getContributorAggregates(
  args: z.infer<typeof GetContributorAggregatesSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    if (args.slugs && args.slugs.length > 0) {
      const aggregates =
        await contributorAggregateQueries.getByContributorEnriched(
          context.db,
          args.username,
          args.slugs,
        );

      return createSuccessResult({
        username: args.username,
        aggregates,
        total: aggregates.length,
      });
    }

    const aggregates = await contributorAggregateQueries.getByContributor(
      context.db,
      args.username,
    );

    return createSuccessResult({
      username: args.username,
      aggregates,
      total: aggregates.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_aggregate_definitions tool
 */
export const GetAggregateDefinitionsSchema = z.object({
  visible_only: z
    .boolean()
    .optional()
    .default(true)
    .describe("Only return visible aggregate definitions"),
});

/**
 * Get contributor aggregate definitions
 */
export async function getAggregateDefinitions(
  args: z.infer<typeof GetAggregateDefinitionsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const definitions = args.visible_only
      ? await contributorAggregateDefinitionQueries.getAllVisible(context.db)
      : await contributorAggregateDefinitionQueries.getAll(context.db);

    return createSuccessResult({
      definitions,
      total: definitions.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for batch_get_contributor_stats tool
 */
export const BatchGetContributorStatsSchema = z.object({
  usernames: z.array(z.string()).describe("List of contributor usernames"),
  include_aggregates: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include contributor aggregates"),
  include_badges: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include contributor badges"),
});

/**
 * Get statistics for multiple contributors in batch
 */
export async function batchGetContributorStats(
  args: z.infer<typeof BatchGetContributorStatsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const results = await Promise.all(
      args.usernames.map(async (username) => {
        const totalPoints = await activityQueries.getTotalPointsByContributor(
          context.db,
          username,
        );

        const activityCount = await context.db.execute(
          "SELECT COUNT(*) as count FROM activity WHERE contributor = ?",
          [username],
        );

        const stats: any = {
          username,
          totalPoints,
          activityCount: (activityCount.rows[0] as any).count,
        };

        if (args.include_aggregates) {
          stats.aggregates = await contributorAggregateQueries.getByContributor(
            context.db,
            username,
          );
        }

        if (args.include_badges) {
          stats.badges = await contributorBadgeQueries.getByContributor(
            context.db,
            username,
          );
        }

        return stats;
      }),
    );

    return createSuccessResult({
      results,
      total: results.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}
