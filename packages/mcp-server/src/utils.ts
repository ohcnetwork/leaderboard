/**
 * Utility functions for the MCP server
 */

import type { ToolResult } from "./types.js";

/**
 * Create a successful tool result
 */
export function createSuccessResult<T>(data: T): ToolResult<T> {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Create an error tool result
 */
export function createErrorResult(error: Error | string): ToolResult {
  const message = typeof error === "string" ? error : error.message;
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            error: message,
            code: "TOOL_ERROR",
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

/**
 * Parse date string with validation
 */
export function parseDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.toISOString().split("T")[0];
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  limit?: number,
  offset?: number,
): { limit: number; offset: number } {
  const validatedLimit = Math.min(Math.max(limit ?? 50, 1), 1000);
  const validatedOffset = Math.max(offset ?? 0, 0);
  return { limit: validatedLimit, offset: validatedOffset };
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

/**
 * Get database URL from environment or config
 */
export function getDatabaseUrl(dataDir?: string): string {
  if (process.env.LIBSQL_DB_URL) {
    return process.env.LIBSQL_DB_URL;
  }

  const dir = dataDir || process.env.LEADERBOARD_DATA_DIR || "./data";
  return `file:${dir}/.leaderboard.db`;
}

/**
 * Get data directory from environment or default
 */
export function getDataDir(): string {
  return process.env.LEADERBOARD_DATA_DIR || "./data";
}
