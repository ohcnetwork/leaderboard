import { Activity, ActivityDefinition, Contributor } from "@/types/db";
import { PGlite, types } from "@electric-sql/pglite";

let dbInstance: PGlite | null = null;

/**
 * Initialize and return PGlite database instance
 */
export function getDb(dataPath: string = "./db-data"): PGlite {
  if (!dbInstance) {
    dbInstance = new PGlite(dataPath);
  }

  return dbInstance;
}

/**
 * Create tables and indexes in the database if they don't exist
 */
export async function createTables() {
  const db = getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS contributor (
        username                VARCHAR PRIMARY KEY,
        name                    VARCHAR,
        role                    VARCHAR,
        avatar_url              VARCHAR,
        profile_url             VARCHAR,
        email                   VARCHAR,
        bio                     TEXT,
        meta                    JSON
    );

    CREATE TABLE IF NOT EXISTS activity_definition (
        slug                    VARCHAR PRIMARY KEY,
        name                    VARCHAR,
        description             TEXT,
        points                  SMALLINT CHECK (points IS NULL OR points > -1)
    );

    CREATE TABLE IF NOT EXISTS activity (
        slug                    VARCHAR PRIMARY KEY,
        contributor             VARCHAR REFERENCES contributor(username),
        activity_definition     VARCHAR REFERENCES activity_definition(slug),
        title                   VARCHAR,
        occured_at              TIMESTAMP,
        link                    VARCHAR,
        text                    TEXT,
        points                  SMALLINT CHECK (points IS NULL OR points > -1),
        meta                    JSON
    );

    CREATE INDEX IF NOT EXISTS idx_activity_occured_at ON activity(occured_at);
    CREATE INDEX IF NOT EXISTS idx_activity_contributor ON activity(contributor);
    CREATE INDEX IF NOT EXISTS idx_activity_definition ON activity(activity_definition);
  `);
}

/**
 * Upsert activity definitions to the database
 * @param activityDefinitions - The activity definitions to upsert
 */
export async function upsertActivityDefinitions(
  ...activityDefinitions: ActivityDefinition[]
) {
  const db = getDb();

  await db.query(`
    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ${activityDefinitions
      .map(
        (ad) =>
          `('${ad.slug}', '${ad.name}', '${ad.description}', ${ad.points})`
      )
      .join(",")}
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points;
  `);
}

/**
 * List all activity definitions from the database
 * @returns The list of all activity definitions
 */
export async function listActivityDefinitions() {
  const db = getDb();

  const result = await db.query<ActivityDefinition>(`
    SELECT * FROM activity_definition;
  `);

  return result.rows;
}

/**
 * Upsert contributors to the database
 * @param contributors - The contributors to upsert
 */
export async function upsertContributor(...contributors: Contributor[]) {
  const db = getDb();

  await db.query(`
    INSERT INTO contributor (username, name, role, avatar_url, profile_url, email, bio, meta)
    VALUES ${contributors
      .map(
        (c) =>
          `('${c.username}', '${c.name}', '${c.role}', '${c.avatar_url}', '${
            c.profile_url
          }', '${c.email}', '${c.bio}', '${JSON.stringify(c.meta)}')`
      )
      .join(",")}
    ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, avatar_url = EXCLUDED.avatar_url, profile_url = EXCLUDED.profile_url, email = EXCLUDED.email, bio = EXCLUDED.bio, meta = EXCLUDED.meta;
  `);
}

/**
 * List all contributors from the database
 * @returns The list of all contributors
 * @deprecated TODO: remove this as we'd never want all information about all contributors when listing.
 */
export async function listContributors() {
  const db = getDb();

  const result = await db.query<Contributor>(`
    SELECT * FROM contributor;
  `);

  return result.rows;
}

/**
 * Get a contributor from the database
 * @param username - The username of the contributor
 * @returns The contributor
 */
export async function getContributor(username: string) {
  const db = getDb();

  const result = await db.query<Contributor>(
    "SELECT * FROM contributor WHERE username = $1;",
    [username]
  );

  return result.rows[0] ?? null;
}

/**
 * Upsert activity to the database
 * @param activity - The activity to upsert
 */
export async function upsertActivity(...activities: Activity[]) {
  const db = getDb();

  await db.query(
    `
    INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
    VALUES ${activities
      .map(
        (a) =>
          `('${a.slug}', '${a.contributor}', '${a.activity_definition}', '${
            a.title
          }', '${a.occured_at}', '${a.link}', '${a.text}', ${
            a.points
          }, '${JSON.stringify(a.meta)}')`
      )
      .join(",")}
    ON CONFLICT (slug) DO UPDATE SET contributor = EXCLUDED.contributor, activity_definition = EXCLUDED.activity_definition, title = EXCLUDED.title, occured_at = EXCLUDED.occured_at, link = EXCLUDED.link, text = EXCLUDED.text, points = EXCLUDED.points, meta = EXCLUDED.meta;
  `,
    [],
    {
      serializers: {
        [types.DATE]: (date: Date) => date.toISOString(),
      },
      parsers: {
        [types.DATE]: (date: string) => new Date(date),
      },
    }
  );
}

/**
 * List all activities from the database
 * @returns The list of all activities
 * @deprecated TODO: remove this as we'd never want all information about all activities when listing.
 */
export async function listActivities() {
  const db = getDb();

  const result = await db.query<Activity>(
    `
    SELECT * FROM activity;
  `,
    [],
    {
      serializers: {
        [types.DATE]: (date: Date) => date.toISOString(),
      },
      parsers: {
        [types.DATE]: (date: string) => new Date(date),
      },
    }
  );

  return result.rows;
}
