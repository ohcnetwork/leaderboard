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
  Activity,
  ActivityDefinition,
  AggregateValue,
  BadgeDefinition,
  BadgeVariant,
  BatchResult,
  BatchStatement,
  Contributor,
  ContributorAggregate,
  ContributorAggregateDefinition,
  ContributorBadge,
  Database,
  ExecuteResult,
  GlobalAggregate,
  Logger,
  NumberAggregateValue,
  NumberStatisticsAggregateValue,
  OrgConfig,
  Plugin,
  PluginConfig,
  PluginContext,
  PluginManifest,
  StringAggregateValue,
} from "./types";

// Export database client utilities
export * from "./client";

// Export schema utilities
export * from "./schema";

// Export query helpers
export * from "./queries";

// Export utility functions
export * from "./utils";
