/**
 * Database initialization for plugin runner
 */

import { createDatabase, getDatabaseUrl, initializeSchema } from "@leaderboard/db";
import type { Database } from "@leaderboard/plugin-api";

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

