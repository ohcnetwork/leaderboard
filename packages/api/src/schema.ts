/**
 * Database schema definitions and initialization
 */

import type { Database } from "./types.js";

/**
 * SQL schema for the leaderboard database
 */
export const SCHEMA = `
-- Contributors table
CREATE TABLE IF NOT EXISTS contributor (
    username                VARCHAR PRIMARY KEY,
    name                    VARCHAR,
    role                    VARCHAR,
    title                   VARCHAR,
    avatar_url              VARCHAR,
    bio                     TEXT,
    social_profiles         JSON,
    joining_date            DATE,
    meta                    JSON
);

-- Activity definitions table (populated by plugins)
CREATE TABLE IF NOT EXISTS activity_definition (
    slug                    VARCHAR PRIMARY KEY,
    name                    VARCHAR NOT NULL,
    description             TEXT NOT NULL,
    points                  SMALLINT,
    icon                    VARCHAR
);

-- Activities table
CREATE TABLE IF NOT EXISTS activity (
    slug                    VARCHAR PRIMARY KEY,
    contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
    activity_definition     VARCHAR REFERENCES activity_definition(slug) NOT NULL,
    title                   VARCHAR,
    occured_at              TIMESTAMP NOT NULL,
    link                    VARCHAR,
    text                    TEXT,
    points                  SMALLINT,
    meta                    JSON
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_occured_at ON activity(occured_at);
CREATE INDEX IF NOT EXISTS idx_activity_contributor ON activity(contributor);
CREATE INDEX IF NOT EXISTS idx_activity_definition ON activity(activity_definition);
`;

/**
 * Initialize database with schema
 */
export async function initializeSchema(db: Database): Promise<void> {
  // Split schema into individual statements and execute
  const statements = SCHEMA
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement + ";");
  }
}

/**
 * Clear all data from tables (useful for testing)
 */
export async function clearAllData(db: Database): Promise<void> {
  await db.execute("DELETE FROM activity");
  await db.execute("DELETE FROM contributor");
  await db.execute("DELETE FROM activity_definition");
}

/**
 * Drop all tables (useful for testing)
 */
export async function dropAllTables(db: Database): Promise<void> {
  await db.execute("DROP TABLE IF EXISTS activity");
  await db.execute("DROP TABLE IF EXISTS activity_definition");
  await db.execute("DROP TABLE IF EXISTS contributor");
}

