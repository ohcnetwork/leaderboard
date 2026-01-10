/**
 * LibSQL client for Next.js SSG
 * Reads from the persisted database file during build time
 */

import { dataDir } from "@ohcnetwork/leaderboard-api";
import { createDatabase, getDatabaseUrl } from "@ohcnetwork/leaderboard-api";
import type { Database } from "@ohcnetwork/leaderboard-api";

let cachedDb: Database | null = null;

/**
 * Get or create database instance for SSG
 * Uses the persisted database file from data-repo
 */
export function getDatabase(): Database {
  if (cachedDb) {
    return cachedDb;
  }

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
