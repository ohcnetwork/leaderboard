/**
 * Activity query tools
 */

import { z } from "zod";
import {
  activityQueries,
  activityDefinitionQueries,
} from "@ohcnetwork/leaderboard-api";
import type { ServerContext, ToolResult } from "../types.js";
import {
  createSuccessResult,
  createErrorResult,
  validatePagination,
  parseDate,
} from "../utils.js";

/**
 * Schema for query_activities tool
 */
export const QueryActivitiesSchema = z.object({
  contributor: z
    .string()
    .optional()
    .describe("Filter by contributor username"),
  activity_type: z
    .string()
    .optional()
    .describe("Filter by activity definition slug"),
  start_date: z
    .string()
    .optional()
    .describe("Start date (ISO format: YYYY-MM-DD)"),
  end_date: z.string().optional().describe("End date (ISO format: YYYY-MM-DD)"),
  limit: z.number().optional().describe("Maximum number of results (1-1000)"),
  offset: z.number().optional().describe("Number of results to skip"),
});

/**
 * Query activities with flexible filtering options
 */
export async function queryActivities(
  args: z.infer<typeof QueryActivitiesSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const { limit, offset } = validatePagination(args.limit, args.offset);

    let activities;

    // Filter by date range
    if (args.start_date && args.end_date) {
      const startDate = parseDate(args.start_date);
      const endDate = parseDate(args.end_date);
      activities = await activityQueries.getByDateRange(
        context.db,
        startDate,
        endDate,
      );

      // Further filter by contributor if specified
      if (args.contributor) {
        activities = activities.filter(
          (a) => a.contributor === args.contributor,
        );
      }

      // Further filter by activity type if specified
      if (args.activity_type) {
        activities = activities.filter(
          (a) => a.activity_definition === args.activity_type,
        );
      }
    }
    // Filter by contributor
    else if (args.contributor) {
      activities = await activityQueries.getByContributor(
        context.db,
        args.contributor,
      );

      // Further filter by activity type if specified
      if (args.activity_type) {
        activities = activities.filter(
          (a) => a.activity_definition === args.activity_type,
        );
      }
    }
    // Filter by activity type only
    else if (args.activity_type) {
      activities = await activityQueries.getByDefinition(
        context.db,
        args.activity_type,
      );
    }
    // No filters - get all with pagination
    else {
      activities = await activityQueries.getAll(context.db, limit, offset);
      // Return early since pagination is already applied
      return createSuccessResult({
        activities,
        total: activities.length,
        limit,
        offset,
      });
    }

    // Apply pagination to filtered results
    const total = activities.length;
    const paginatedResults = activities.slice(offset, offset + limit);

    return createSuccessResult({
      activities: paginatedResults,
      total,
      limit,
      offset,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_activity tool
 */
export const GetActivitySchema = z.object({
  slug: z.string().describe("Activity slug"),
});

/**
 * Get a specific activity by slug
 */
export async function getActivity(
  args: z.infer<typeof GetActivitySchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    // Query for the specific activity
    const result = await context.db.execute(
      "SELECT * FROM activity WHERE slug = ?",
      [args.slug],
    );

    if (result.rows.length === 0) {
      return createErrorResult(`Activity not found: ${args.slug}`);
    }

    const activity = result.rows[0];

    return createSuccessResult(activity);
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_activity_definitions tool
 */
export const GetActivityDefinitionsSchema = z.object({
  slug: z.string().optional().describe("Filter by specific activity slug"),
});

/**
 * Get activity definitions (types of activities)
 */
export async function getActivityDefinitions(
  args: z.infer<typeof GetActivityDefinitionsSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    if (args.slug) {
      const definition = await activityDefinitionQueries.getBySlug(
        context.db,
        args.slug,
      );

      if (!definition) {
        return createErrorResult(
          `Activity definition not found: ${args.slug}`,
        );
      }

      return createSuccessResult(definition);
    }

    const definitions = await activityDefinitionQueries.getAll(context.db);

    return createSuccessResult({
      definitions,
      total: definitions.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for get_activity_timeline tool
 */
export const GetActivityTimelineSchema = z.object({
  username: z.string().describe("Contributor username"),
  group_by: z
    .enum(["day", "week", "month"])
    .optional()
    .default("day")
    .describe("Group activities by time period"),
});

/**
 * Get activity timeline for a contributor
 */
export async function getActivityTimeline(
  args: z.infer<typeof GetActivityTimelineSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const activityByDate = await activityQueries.getActivityCountByDate(
      context.db,
      args.username,
    );

    // If grouping by week or month, aggregate the data
    if (args.group_by === "week" || args.group_by === "month") {
      const grouped = new Map<string, number>();

      for (const entry of activityByDate) {
        const date = new Date(entry.date);
        let key: string;

        if (args.group_by === "week") {
          // Get week number
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          // Month
          key = date.toISOString().substring(0, 7); // YYYY-MM
        }

        grouped.set(key, (grouped.get(key) || 0) + entry.count);
      }

      const timeline = Array.from(grouped.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return createSuccessResult({
        username: args.username,
        group_by: args.group_by,
        timeline,
        total_periods: timeline.length,
      });
    }

    return createSuccessResult({
      username: args.username,
      group_by: args.group_by,
      timeline: activityByDate,
      total_periods: activityByDate.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}

/**
 * Schema for search_activities tool
 */
export const SearchActivitiesSchema = z.object({
  query: z.string().describe("Search query for activity title or text"),
  limit: z.number().optional().describe("Maximum number of results (1-1000)"),
});

/**
 * Search activities by title or text content
 */
export async function searchActivities(
  args: z.infer<typeof SearchActivitiesSchema>,
  context: ServerContext,
): Promise<ToolResult> {
  try {
    const { limit } = validatePagination(args.limit);

    const result = await context.db.execute(
      `
      SELECT a.*, COALESCE(a.points, ad.points, 0) as points
      FROM activity a
      LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
      WHERE a.title LIKE ? OR a.text LIKE ?
      ORDER BY a.occurred_at DESC
      LIMIT ?
    `,
      [`%${args.query}%`, `%${args.query}%`, limit],
    );

    return createSuccessResult({
      activities: result.rows,
      query: args.query,
      total: result.rows.length,
    });
  } catch (error) {
    return createErrorResult(error as Error);
  }
}
