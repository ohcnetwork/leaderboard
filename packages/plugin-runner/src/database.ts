/**
 * Database initialization for plugin runner
 */

import {
  createDatabase,
  getDatabaseUrl,
  initializeSchema,
} from "@ohcnetwork/leaderboard-api";
import type { Database } from "@ohcnetwork/leaderboard-api";

/**
 * Initialize database with schema
 */
export async function initDatabase(dataDir: string): Promise<Database> {
  const dbUrl = getDatabaseUrl(dataDir);
  const db = createDatabase(dbUrl);

  // Initialize schema
  await initializeSchema(db);

  return db;
}
