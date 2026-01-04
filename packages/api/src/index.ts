/**
 * @leaderboard/api
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
} from "./types.js";

// Export database client utilities
export * from "./client.js";

// Export schema utilities
export * from "./schema.js";

// Export query helpers
export * from "./queries.js";

