/**
 * @ohcnetwork/leaderboard-api
 *
 * Unified API package combining database utilities and plugin type definitions
 * for the leaderboard system.
 *
 * @packageDocumentation
 */

// Export all type definitions
export type {
  Database,
  ExecuteResult,
  BatchStatement,
  BatchResult,
  Logger,
  OrgConfig,
  PluginConfig,
  PluginContext,
  Plugin,
  PluginManifest,
  Contributor,
  ActivityDefinition,
  Activity,
  NumberAggregateValue,
  NumberStatisticsAggregateValue,
  StringAggregateValue,
  AggregateValue,
  GlobalAggregate,
  ContributorAggregateDefinition,
  ContributorAggregate,
  BadgeVariant,
  BadgeDefinition,
  ContributorBadge,
} from "./types";

// Export database client utilities
export * from "./client";

// Export schema utilities
export * from "./schema";

// Export query helpers
export * from "./queries";

// Export utility functions
export * from "./utils";
