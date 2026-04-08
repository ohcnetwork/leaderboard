/**
 * MCP server-specific types
 */

import type { Database } from "@ohcnetwork/leaderboard-api";

/**
 * Server configuration options
 */
export interface ServerConfig {
  name: string;
  version: string;
  dataDir?: string;
  dbUrl?: string;
  transport: "stdio" | "http";
  httpPort?: number;
}

/**
 * Server context passed to all handlers
 */
export interface ServerContext {
  db: Database;
  config: ServerConfig;
}

/**
 * Tool execution result wrapper
 */
export interface ToolResult<T = unknown> {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Batch operation request
 */
export interface BatchRequest {
  operations: Array<{
    tool: string;
    arguments: Record<string, unknown>;
  }>;
}

/**
 * Batch operation response
 */
export interface BatchResponse {
  results: Array<{
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
}
