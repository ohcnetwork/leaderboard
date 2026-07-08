/**
 * Cloudflare D1 database client implementing the Database interface
 */

import type {
  BatchResult,
  BatchStatement,
  Database,
  ExecuteResult,
} from "@ohcnetwork/leaderboard-api";

/**
 * Database client implementation using Cloudflare D1
 */
export class D1DatabaseClient implements Database {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async execute(sql: string, params?: unknown[]): Promise<ExecuteResult> {
    const stmt = this.d1.prepare(sql);
    const bound = params && params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bound.all();

    return {
      rows: (result.results ?? []) as Record<string, unknown>[],
      rowsAffected: result.meta?.changes ?? 0,
      lastInsertRowid: result.meta?.last_row_id
        ? BigInt(result.meta.last_row_id)
        : undefined,
    };
  }

  async batch(statements: BatchStatement[]): Promise<BatchResult[]> {
    const d1Statements = statements.map((stmt) => {
      const s = this.d1.prepare(stmt.sql);
      return stmt.params && stmt.params.length > 0 ? s.bind(...stmt.params) : s;
    });

    const results = await this.d1.batch(d1Statements);

    return results.map((result) => ({
      rows: (result.results ?? []) as Record<string, unknown>[],
      rowsAffected: result.meta?.changes ?? 0,
    }));
  }

  async close(): Promise<void> {
    // D1 connections are managed by the Workers runtime — no-op
  }
}

/**
 * Create a Database instance backed by Cloudflare D1
 */
export function createD1Database(d1: D1Database): Database {
  return new D1DatabaseClient(d1);
}
