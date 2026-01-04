/**
 * Core types for the leaderboard plugin system
 */

/**
 * Database interface that plugins receive
 * Abstraction over LibSQL client
 */
export interface Database {
  /**
   * Execute a SQL statement
   */
  execute(sql: string, params?: unknown[]): Promise<ExecuteResult>;

  /**
   * Execute multiple SQL statements in a transaction
   */
  batch(statements: BatchStatement[]): Promise<BatchResult[]>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;
}

export interface ExecuteResult {
  rows: Record<string, unknown>[];
  rowsAffected: number;
  lastInsertRowid?: bigint;
}

export interface BatchStatement {
  sql: string;
  params?: unknown[];
}

export interface BatchResult {
  rows: Record<string, unknown>[];
  rowsAffected: number;
}

/**
 * Logger interface for structured logging
 */
export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

/**
 * Organization configuration from config.yaml
 */
export interface OrgConfig {
  name: string;
  description: string;
  url: string;
  logo_url: string;
  start_date?: string;
  socials?: {
    github?: string;
    slack?: string;
    linkedin?: string;
    youtube?: string;
    email?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Plugin-specific configuration
 * This is the config section for the specific plugin from config.yaml
 */
export type PluginConfig = Record<string, unknown>;

/**
 * Context passed to plugin methods
 */
export interface PluginContext {
  /**
   * Database instance for querying and writing data
   */
  db: Database;

  /**
   * Plugin-specific configuration from config.yaml
   */
  config: PluginConfig;

  /**
   * Organization configuration
   */
  orgConfig: OrgConfig;

  /**
   * Structured logger instance
   */
  logger: Logger;
}

/**
 * Plugin interface that all plugins must implement
 */
export interface Plugin {
  /**
   * Unique name for the plugin
   */
  name: string;

  /**
   * Semantic version of the plugin
   */
  version: string;

  /**
   * Optional setup method called before scraping
   * Used to populate activity_definition table and perform initialization
   */
  setup?: (ctx: PluginContext) => Promise<void>;

  /**
   * Main scrape method that fetches and stores activity data
   */
  scrape: (ctx: PluginContext) => Promise<void>;
}

/**
 * Plugin manifest format - what the plugin module should export
 */
export interface PluginManifest {
  default: Plugin;
}

/**
 * Database table types for type safety
 */
export interface Contributor {
  username: string;
  name: string | null;
  role: string | null;
  title: string | null;
  avatar_url: string | null;
  bio: string | null;
  social_profiles: Record<string, string> | null;
  joining_date: string | null;
  meta: Record<string, unknown> | null;
}

export interface ActivityDefinition {
  slug: string;
  name: string;
  description: string;
  points: number | null;
  icon: string | null;
}

export interface Activity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title: string | null;
  occured_at: string;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, unknown> | null;
}

