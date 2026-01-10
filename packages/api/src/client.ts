/**
 * LibSQL client wrapper
 */

import { createClient } from "@libsql/client";
import type {
  Database,
  ExecuteResult,
  BatchStatement,
  BatchResult,
} from "./types";
import type { Client, ResultSet } from "@libsql/client";

/**
 * Convert LibSQL ResultSet to our ExecuteResult format
 */
function convertResult(result: ResultSet): ExecuteResult {
  return {
    rows: result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    }),
    rowsAffected: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid,
  };
}

/**
 * Database client implementation using LibSQL
 */
export class LibSQLDatabase implements Database {
  private client: Client;

  constructor(url: string) {
    this.client = createClient({ url });
  }

  async execute(sql: string, params?: unknown[]): Promise<ExecuteResult> {
    const result = await this.client.execute({
      sql,
      args: (params || []) as any,
    });
    return convertResult(result);
  }

  async batch(statements: BatchStatement[]): Promise<BatchResult[]> {
    const results = await this.client.batch(
      statements.map((stmt) => ({
        sql: stmt.sql,
        args: (stmt.params || []) as any,
      }))
    );

    return results.map(convertResult);
  }

  async close(): Promise<void> {
    this.client.close();
  }

  /**
   * Get the underlying LibSQL client (for advanced usage)
   */
  getClient(): Client {
    return this.client;
  }
}

/**
 * Create a database instance
 */
export function createDatabase(url: string): Database {
  return new LibSQLDatabase(url);
}

/**
 * Get database URL from environment or default
 */
export function getDatabaseUrl(dataDir?: string): string {
  // Check for explicit DB URL
  if (process.env.LIBSQL_DB_URL) {
    return process.env.LIBSQL_DB_URL;
  }

  // Default to file-based database in data directory
  if (dataDir) {
    return `file:${dataDir}/.leaderboard.db`;
  }

  // Fallback to in-memory
  return ":memory:";
}
