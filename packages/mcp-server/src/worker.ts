/**
 * Cloudflare Workers entry point for the Leaderboard MCP Server
 * Uses createMcpHandler (stateless) with D1 database binding
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler } from "agents/mcp";

import { createD1Database } from "./d1-client.js";
import type { ServerContext } from "./types.js";

// Import all tool functions and schemas
import {
  batchGetContributors,
  BatchGetContributorsSchema,
  batchGetContributorStats,
  BatchGetContributorStatsSchema,
  getActiveContributors,
  GetActiveContributorsSchema,
  getActivity,
  getActivityDefinitions,
  GetActivityDefinitionsSchema,
  GetActivitySchema,
  getActivityTimeline,
  GetActivityTimelineSchema,
  getAggregateDefinitions,
  GetAggregateDefinitionsSchema,
  getBadges,
  GetBadgesSchema,
  getContributor,
  getContributorAggregates,
  GetContributorAggregatesSchema,
  getContributorRanking,
  GetContributorRankingSchema,
  GetContributorSchema,
  getContributorStats,
  GetContributorStatsSchema,
  getGlobalAggregates,
  GetGlobalAggregatesSchema,
  getLeaderboard,
  GetLeaderboardSchema,
  getRecentBadges,
  GetRecentBadgesSchema,
  getTopBadgeEarners,
  GetTopBadgeEarnersSchema,
  getTopByActivity,
  GetTopByActivitySchema,
  queryActivities,
  QueryActivitiesSchema,
  queryContributors,
  QueryContributorsSchema,
  searchActivities,
  SearchActivitiesSchema,
} from "./tools/index.js";

export interface Env {
  DB: D1Database;
}

function createServer(env: Env) {
  const server = new McpServer({
    name: "ohc-leaderboard-mcp",
    version: "0.2.0",
  });

  const db = createD1Database(env.DB);
  const context: ServerContext = {
    db,
    config: {
      name: "ohc-leaderboard-mcp",
      version: "0.2.0",
      transport: "http",
    },
  };

  // --- Contributor tools ---

  server.tool(
    "query_contributors",
    "Query contributors with optional filtering by role and pagination",
    QueryContributorsSchema.shape,
    async (args) => queryContributors(args, context),
  );

  server.tool(
    "get_contributor",
    "Get detailed information about a specific contributor",
    GetContributorSchema.shape,
    async (args) => getContributor(args, context),
  );

  server.tool(
    "get_contributor_stats",
    "Get comprehensive statistics for a contributor including activities, badges, and aggregates",
    GetContributorStatsSchema.shape,
    async (args) => getContributorStats(args, context),
  );

  server.tool(
    "batch_get_contributors",
    "Get multiple contributors in a single batch request",
    BatchGetContributorsSchema.shape,
    async (args) => batchGetContributors(args, context),
  );

  // --- Activity tools ---

  server.tool(
    "query_activities",
    "Query activities with flexible filtering by contributor, activity type, and date range",
    QueryActivitiesSchema.shape,
    async (args) => queryActivities(args, context),
  );

  server.tool(
    "get_activity",
    "Get a specific activity by slug",
    GetActivitySchema.shape,
    async (args) => getActivity(args, context),
  );

  server.tool(
    "get_activity_definitions",
    "Get activity definitions (types of activities tracked)",
    GetActivityDefinitionsSchema.shape,
    async (args) => getActivityDefinitions(args, context),
  );

  server.tool(
    "get_activity_timeline",
    "Get activity timeline for a contributor grouped by time period",
    GetActivityTimelineSchema.shape,
    async (args) => getActivityTimeline(args, context),
  );

  server.tool(
    "search_activities",
    "Search activities by title or text content",
    SearchActivitiesSchema.shape,
    async (args) => searchActivities(args, context),
  );

  // --- Leaderboard tools ---

  server.tool(
    "get_leaderboard",
    "Get leaderboard rankings with optional filtering",
    GetLeaderboardSchema.shape,
    async (args) => getLeaderboard(args, context),
  );

  server.tool(
    "get_contributor_ranking",
    "Get a contributor's ranking position and percentile",
    GetContributorRankingSchema.shape,
    async (args) => getContributorRanking(args, context),
  );

  server.tool(
    "get_top_by_activity",
    "Get top contributors for a specific activity type",
    GetTopByActivitySchema.shape,
    async (args) => getTopByActivity(args, context),
  );

  server.tool(
    "get_active_contributors",
    "Get contributors who were active in a specific time period",
    GetActiveContributorsSchema.shape,
    async (args) => getActiveContributors(args, context),
  );

  // --- Badge tools ---

  server.tool(
    "get_badges",
    "Get badge definitions or contributor badges",
    GetBadgesSchema.shape,
    async (args) => getBadges(args, context),
  );

  server.tool(
    "get_recent_badges",
    "Get recently awarded badges",
    GetRecentBadgesSchema.shape,
    async (args) => getRecentBadges(args, context),
  );

  server.tool(
    "get_top_badge_earners",
    "Get contributors with the most badges",
    GetTopBadgeEarnersSchema.shape,
    async (args) => getTopBadgeEarners(args, context),
  );

  // --- Aggregate tools ---

  server.tool(
    "get_global_aggregates",
    "Get organization-level aggregate metrics",
    GetGlobalAggregatesSchema.shape,
    async (args) => getGlobalAggregates(args, context),
  );

  server.tool(
    "get_contributor_aggregates",
    "Get aggregates for a specific contributor",
    GetContributorAggregatesSchema.shape,
    async (args) => getContributorAggregates(args, context),
  );

  server.tool(
    "get_aggregate_definitions",
    "Get contributor aggregate definitions",
    GetAggregateDefinitionsSchema.shape,
    async (args) => getAggregateDefinitions(args, context),
  );

  server.tool(
    "batch_get_contributor_stats",
    "Get statistics for multiple contributors in batch",
    BatchGetContributorStatsSchema.shape,
    async (args) => batchGetContributorStats(args, context),
  );

  return server;
}

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    const server = createServer(env);
    return createMcpHandler(server)(request, env, ctx);
  },
};
