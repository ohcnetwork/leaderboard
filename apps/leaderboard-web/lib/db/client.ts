/**
 * LibSQL client for Next.js SSG
 * Reads from the persisted database file during build time
 */

import { createDatabase, getDatabaseUrl } from "@leaderboard/db";
import type { Database } from "@leaderboard/plugin-api";

let cachedDb: Database | null = null;

/**
 * Get or create database instance for SSG
 * Uses the persisted database file from data-repo
 */
export function getDatabase(): Database {
  if (cachedDb) {
    return cachedDb;
  }

  const dataDir = process.env.LEADERBOARD_DATA_DIR || "../../data";
  const dbUrl = getDatabaseUrl(dataDir);

  cachedDb = createDatabase(dbUrl);
  return cachedDb;
}

/**
 * Close database connection (useful for cleanup)
 */
export async function closeDatabase(): Promise<void> {
  if (cachedDb) {
    await cachedDb.close();
    cachedDb = null;
  }
}
