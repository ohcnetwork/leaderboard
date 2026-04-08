/**
 * MCP Server implementation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createDatabase } from "@ohcnetwork/leaderboard-api";
import type { ServerConfig, ServerContext } from "./types.js";
import { getDatabaseUrl } from "./utils.js";

// Import all tools
import {
  queryContributors,
  QueryContributorsSchema,
  getContributor,
  GetContributorSchema,
  getContributorStats,
  GetContributorStatsSchema,
  batchGetContributors,
  BatchGetContributorsSchema,
  queryActivities,
  QueryActivitiesSchema,
  getActivity,
  GetActivitySchema,
  getActivityDefinitions,
  GetActivityDefinitionsSchema,
  getActivityTimeline,
  GetActivityTimelineSchema,
  searchActivities,
  SearchActivitiesSchema,
  getLeaderboard,
  GetLeaderboardSchema,
  getContributorRanking,
  GetContributorRankingSchema,
  getTopByActivity,
  GetTopByActivitySchema,
  getActiveContributors,
  GetActiveContributorsSchema,
  getBadges,
  GetBadgesSchema,
  getRecentBadges,
  GetRecentBadgesSchema,
  getTopBadgeEarners,
  GetTopBadgeEarnersSchema,
  getGlobalAggregates,
  GetGlobalAggregatesSchema,
  getContributorAggregates,
  GetContributorAggregatesSchema,
  getAggregateDefinitions,
  GetAggregateDefinitionsSchema,
  batchGetContributorStats,
  BatchGetContributorStatsSchema,
} from "./tools/index.js";

/**
 * Create and configure the MCP server
 */
export function createMCPServer(config: ServerConfig): Server {
  const server = new Server(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  // Initialize database connection
  const dbUrl = config.dbUrl || getDatabaseUrl(config.dataDir);
  const db = createDatabase(dbUrl);

  const context: ServerContext = {
    db,
    config,
  };

  // Register tool handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "query_contributors",
        description:
          "Query contributors with optional filtering by role and pagination",
        inputSchema: {
          type: "object",
          properties: {
            role: { type: "string", description: "Filter by contributor role" },
            limit: {
              type: "number",
              description: "Maximum number of results (1-1000)",
            },
            offset: { type: "number", description: "Number of results to skip" },
          },
        },
      },
      {
        name: "get_contributor",
        description: "Get detailed information about a specific contributor",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "Contributor username" },
          },
          required: ["username"],
        },
      },
      {
        name: "get_contributor_stats",
        description:
          "Get comprehensive statistics for a contributor including activities, badges, and aggregates",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "Contributor username" },
          },
          required: ["username"],
        },
      },
      {
        name: "batch_get_contributors",
        description: "Get multiple contributors in a single batch request",
        inputSchema: {
          type: "object",
          properties: {
            usernames: {
              type: "array",
              items: { type: "string" },
              description: "List of contributor usernames",
            },
          },
          required: ["usernames"],
        },
      },
      {
        name: "query_activities",
        description:
          "Query activities with flexible filtering by contributor, activity type, and date range",
        inputSchema: {
          type: "object",
          properties: {
            contributor: {
              type: "string",
              description: "Filter by contributor username",
            },
            activity_type: {
              type: "string",
              description: "Filter by activity definition slug",
            },
            start_date: {
              type: "string",
              description: "Start date (ISO format: YYYY-MM-DD)",
            },
            end_date: {
              type: "string",
              description: "End date (ISO format: YYYY-MM-DD)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (1-1000)",
            },
            offset: { type: "number", description: "Number of results to skip" },
          },
        },
      },
      {
        name: "get_activity",
        description: "Get a specific activity by slug",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Activity slug" },
          },
          required: ["slug"],
        },
      },
      {
        name: "get_activity_definitions",
        description: "Get activity definitions (types of activities tracked)",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Filter by specific activity slug",
            },
          },
        },
      },
      {
        name: "get_activity_timeline",
        description: "Get activity timeline for a contributor grouped by time period",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "Contributor username" },
            group_by: {
              type: "string",
              enum: ["day", "week", "month"],
              description: "Group activities by time period",
            },
          },
          required: ["username"],
        },
      },
      {
        name: "search_activities",
        description: "Search activities by title or text content",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for activity title or text",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (1-1000)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_leaderboard",
        description: "Get leaderboard rankings with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            exclude_roles: {
              type: "array",
              items: { type: "string" },
              description: "Roles to exclude from leaderboard",
            },
            start_date: {
              type: "string",
              description: "Start date for filtering (ISO format: YYYY-MM-DD)",
            },
            end_date: {
              type: "string",
              description: "End date for filtering (ISO format: YYYY-MM-DD)",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (1-1000)",
            },
          },
        },
      },
      {
        name: "get_contributor_ranking",
        description: "Get a contributor's ranking position and percentile",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "Contributor username" },
            exclude_roles: {
              type: "array",
              items: { type: "string" },
              description: "Roles to exclude when calculating rank",
            },
          },
          required: ["username"],
        },
      },
      {
        name: "get_top_by_activity",
        description: "Get top contributors for a specific activity type",
        inputSchema: {
          type: "object",
          properties: {
            activity_type: {
              type: "string",
              description: "Activity definition slug",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (1-100)",
            },
            start_date: {
              type: "string",
              description: "Start date for filtering (ISO format: YYYY-MM-DD)",
            },
            end_date: {
              type: "string",
              description: "End date for filtering (ISO format: YYYY-MM-DD)",
            },
          },
          required: ["activity_type"],
        },
      },
      {
        name: "get_active_contributors",
        description:
          "Get contributors who were active in a specific time period",
        inputSchema: {
          type: "object",
          properties: {
            start_date: {
              type: "string",
              description: "Start date (ISO format: YYYY-MM-DD)",
            },
            end_date: {
              type: "string",
              description: "End date (ISO format: YYYY-MM-DD)",
            },
            exclude_roles: {
              type: "array",
              items: { type: "string" },
              description: "Roles to exclude from results",
            },
            limit: {
              type: "number",
              description: "Maximum number of results (1-1000)",
            },
          },
          required: ["start_date", "end_date"],
        },
      },
      {
        name: "get_badges",
        description:
          "Get badge definitions or contributor badges",
        inputSchema: {
          type: "object",
          properties: {
            username: {
              type: "string",
              description: "Get badges for a specific contributor",
            },
            badge_slug: {
              type: "string",
              description: "Get specific badge definition",
            },
          },
        },
      },
      {
        name: "get_recent_badges",
        description: "Get recently awarded badges",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of results (1-100)",
            },
          },
        },
      },
      {
        name: "get_top_badge_earners",
        description: "Get contributors with the most badges",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of results (1-100)",
            },
          },
        },
      },
      {
        name: "get_global_aggregates",
        description: "Get organization-level aggregate metrics",
        inputSchema: {
          type: "object",
          properties: {
            slugs: {
              type: "array",
              items: { type: "string" },
              description: "Filter by specific aggregate slugs",
            },
          },
        },
      },
      {
        name: "get_contributor_aggregates",
        description: "Get aggregates for a specific contributor",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "Contributor username" },
            slugs: {
              type: "array",
              items: { type: "string" },
              description: "Filter by specific aggregate slugs",
            },
          },
          required: ["username"],
        },
      },
      {
        name: "get_aggregate_definitions",
        description: "Get contributor aggregate definitions",
        inputSchema: {
          type: "object",
          properties: {
            visible_only: {
              type: "boolean",
              description: "Only return visible aggregate definitions",
            },
          },
        },
      },
      {
        name: "batch_get_contributor_stats",
        description: "Get statistics for multiple contributors in batch",
        inputSchema: {
          type: "object",
          properties: {
            usernames: {
              type: "array",
              items: { type: "string" },
              description: "List of contributor usernames",
            },
            include_aggregates: {
              type: "boolean",
              description: "Include contributor aggregates",
            },
            include_badges: {
              type: "boolean",
              description: "Include contributor badges",
            },
          },
          required: ["usernames"],
        },
      },
    ],
  }));

  // Register call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "query_contributors":
          return await queryContributors(
            QueryContributorsSchema.parse(args),
            context,
          );
        case "get_contributor":
          return await getContributor(GetContributorSchema.parse(args), context);
        case "get_contributor_stats":
          return await getContributorStats(
            GetContributorStatsSchema.parse(args),
            context,
          );
        case "batch_get_contributors":
          return await batchGetContributors(
            BatchGetContributorsSchema.parse(args),
            context,
          );
        case "query_activities":
          return await queryActivities(
            QueryActivitiesSchema.parse(args),
            context,
          );
        case "get_activity":
          return await getActivity(GetActivitySchema.parse(args), context);
        case "get_activity_definitions":
          return await getActivityDefinitions(
            GetActivityDefinitionsSchema.parse(args),
            context,
          );
        case "get_activity_timeline":
          return await getActivityTimeline(
            GetActivityTimelineSchema.parse(args),
            context,
          );
        case "search_activities":
          return await searchActivities(
            SearchActivitiesSchema.parse(args),
            context,
          );
        case "get_leaderboard":
          return await getLeaderboard(GetLeaderboardSchema.parse(args), context);
        case "get_contributor_ranking":
          return await getContributorRanking(
            GetContributorRankingSchema.parse(args),
            context,
          );
        case "get_top_by_activity":
          return await getTopByActivity(
            GetTopByActivitySchema.parse(args),
            context,
          );
        case "get_active_contributors":
          return await getActiveContributors(
            GetActiveContributorsSchema.parse(args),
            context,
          );
        case "get_badges":
          return await getBadges(GetBadgesSchema.parse(args), context);
        case "get_recent_badges":
          return await getRecentBadges(
            GetRecentBadgesSchema.parse(args),
            context,
          );
        case "get_top_badge_earners":
          return await getTopBadgeEarners(
            GetTopBadgeEarnersSchema.parse(args),
            context,
          );
        case "get_global_aggregates":
          return await getGlobalAggregates(
            GetGlobalAggregatesSchema.parse(args),
            context,
          );
        case "get_contributor_aggregates":
          return await getContributorAggregates(
            GetContributorAggregatesSchema.parse(args),
            context,
          );
        case "get_aggregate_definitions":
          return await getAggregateDefinitions(
            GetAggregateDefinitionsSchema.parse(args),
            context,
          );
        case "batch_get_contributor_stats":
          return await batchGetContributorStats(
            BatchGetContributorStatsSchema.parse(args),
            context,
          );
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error.message,
                code: "TOOL_ERROR",
              }),
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  });

  // Register resource handlers (optional - for resource URIs)
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async () => {
    throw new Error("Resources not yet implemented");
  });

  return server;
}

/**
 * Run the server with the specified transport
 */
export async function runServer(config: ServerConfig): Promise<void> {
  const server = createMCPServer(config);

  if (config.transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Leaderboard MCP Server running on stdio");
  } else if (config.transport === "http") {
    const port = config.httpPort || 3001;
    const transport = new SSEServerTransport("/message", {
      endpoint: `/sse`,
    });

    // This would require an HTTP server wrapper - simplified version
    console.error(`Leaderboard MCP Server running on HTTP port ${port}`);
    await server.connect(transport);
  }
}
