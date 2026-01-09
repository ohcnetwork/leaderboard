/**
 * Database schema definitions and initialization
 */

import type { Database } from "./types";

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

-- Global aggregates table (org-level metrics)
CREATE TABLE IF NOT EXISTS global_aggregate (
    slug                    VARCHAR PRIMARY KEY,
    name                    VARCHAR NOT NULL,
    description             TEXT,
    value                   JSON NOT NULL,
    hidden                  BOOLEAN DEFAULT FALSE,
    meta                    JSON
);

-- Contributor aggregate definitions table
CREATE TABLE IF NOT EXISTS contributor_aggregate_definition (
    slug                    VARCHAR PRIMARY KEY,
    name                    VARCHAR NOT NULL,
    description             TEXT,
    hidden                  BOOLEAN DEFAULT FALSE
);

-- Contributor aggregates table (per-contributor metrics)
CREATE TABLE IF NOT EXISTS contributor_aggregate (
    aggregate               VARCHAR REFERENCES contributor_aggregate_definition(slug) NOT NULL,
    contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
    value                   JSON NOT NULL,
    meta                    JSON,
    PRIMARY KEY (aggregate, contributor)
);

CREATE INDEX IF NOT EXISTS idx_contributor_aggregate_contributor ON contributor_aggregate(contributor);
CREATE INDEX IF NOT EXISTS idx_contributor_aggregate_aggregate ON contributor_aggregate(aggregate);

-- Badge definitions table
CREATE TABLE IF NOT EXISTS badge_definition (
    slug                    VARCHAR PRIMARY KEY,
    name                    VARCHAR NOT NULL,
    description             TEXT NOT NULL,
    variants                JSON NOT NULL
);

-- Contributor badges table (achievements earned by contributors)
CREATE TABLE IF NOT EXISTS contributor_badge (
    slug                    VARCHAR PRIMARY KEY,
    badge                   VARCHAR REFERENCES badge_definition(slug) NOT NULL,
    contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
    variant                 VARCHAR NOT NULL,
    achieved_on             DATE NOT NULL,
    meta                    JSON
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contributor_badge_unique ON contributor_badge(badge, contributor, variant);
CREATE INDEX IF NOT EXISTS idx_contributor_badge_contributor ON contributor_badge(contributor);
CREATE INDEX IF NOT EXISTS idx_contributor_badge_badge ON contributor_badge(badge);
CREATE INDEX IF NOT EXISTS idx_contributor_badge_achieved_on ON contributor_badge(achieved_on);
`;

/**
 * Initialize database with schema
 */
export async function initializeSchema(db: Database): Promise<void> {
  // Split schema into individual statements and execute
  const statements = SCHEMA.split(";")
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
  await db.execute("DELETE FROM contributor_badge");
  await db.execute("DELETE FROM badge_definition");
  await db.execute("DELETE FROM contributor_aggregate");
  await db.execute("DELETE FROM contributor_aggregate_definition");
  await db.execute("DELETE FROM global_aggregate");
  await db.execute("DELETE FROM activity");
  await db.execute("DELETE FROM contributor");
  await db.execute("DELETE FROM activity_definition");
}

/**
 * Drop all tables (useful for testing)
 */
export async function dropAllTables(db: Database): Promise<void> {
  await db.execute("DROP TABLE IF EXISTS contributor_badge");
  await db.execute("DROP TABLE IF EXISTS badge_definition");
  await db.execute("DROP TABLE IF EXISTS contributor_aggregate");
  await db.execute("DROP TABLE IF EXISTS contributor_aggregate_definition");
  await db.execute("DROP TABLE IF EXISTS global_aggregate");
  await db.execute("DROP TABLE IF EXISTS activity");
  await db.execute("DROP TABLE IF EXISTS activity_definition");
  await db.execute("DROP TABLE IF EXISTS contributor");
}
