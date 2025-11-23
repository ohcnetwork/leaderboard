import { PGlite } from "@electric-sql/pglite";
import { Activity, Contributor } from "./types/db";
import { format } from "date-fns";

let dbInstance: PGlite | null = null;

/**
 * Initialize and return PGlite database instance
 */
export function getDb(): PGlite {
  const dataPath = process.env.PGLITE_DB_PATH;

  if (!dataPath) {
    throw Error(
      "'PGLITE_DB_PATH' environment needs to be set with a path to the database data."
    );
  }

  // Initialize the database if it doesn't exist, otherwise return the existing instance.
  // This is to avoid creating a new database instance for each call to getDb().
  if (!dbInstance) {
    dbInstance = new PGlite(dataPath);
  }

  return dbInstance;
}

/**
 * Upsert contributors to the database
 * @param contributors - The contributors to upsert
 */
export async function upsertContributor(...contributors: Contributor[]) {
  const db = getDb();

  // Helper function to escape single quotes in SQL strings
  const escapeSql = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return "NULL";
    return `'${String(value).replace(/'/g, "''")}'`;
  };

  // Helper function to format JSON for SQL
  const formatJson = (
    value: Record<string, string> | null | undefined
  ): string => {
    if (value === null || value === undefined) return "NULL";
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  };

  // Helper function to format date for SQL
  const formatDate = (value: Date | null | undefined): string => {
    if (value === null || value === undefined) return "NULL";
    return `'${format(value, "yyyy-MM-dd")}'`;
  };

  await db.query(`
      INSERT INTO contributor (username, name, role, title, avatar_url, bio, social_profiles, joining_date, meta)
      VALUES ${contributors
        .map(
          (c) =>
            `(${escapeSql(c.username)}, ${escapeSql(c.name)}, ${escapeSql(
              c.role
            )}, ${escapeSql(c.title)}, ${escapeSql(c.avatar_url)}, ${escapeSql(
              c.bio
            )}, ${formatJson(c.social_profiles)}, ${formatDate(
              c.joining_date
            )}, ${formatJson(c.meta)})`
        )
        .join(",")}
      ON CONFLICT (username) DO UPDATE SET 
        name = EXCLUDED.name, 
        role = EXCLUDED.role, 
        title = EXCLUDED.title,
        avatar_url = EXCLUDED.avatar_url, 
        bio = EXCLUDED.bio, 
        social_profiles = EXCLUDED.social_profiles,
        joining_date = EXCLUDED.joining_date,
        meta = EXCLUDED.meta;
    `);
}

function batchArray<T>(array: T[], batchSize: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}

function getSqlPositionalParamPlaceholders(length: number, cols: number) {
  // $1, $2, $3, $4, $5, $6, $7, $8, $9, ...
  const params = Array.from({ length: length * cols }, (_, i) => `$${i + 1}`);

  // ($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ...
  return batchArray(params, cols)
    .map((p) => `\n        (${p.join(", ")})`)
    .join(", ");
}

export async function addContributors(contributors: string[]) {
  const db = getDb();

  // Remove duplicates from the array
  contributors = [...new Set(contributors)];

  for (const batch of batchArray(contributors, 1000)) {
    const result = await db.query(
      `
      INSERT INTO contributor (username, avatar_url, social_profiles)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 3)}
      ON CONFLICT (username) DO NOTHING;
    `,
      batch.flatMap((c) => [
        c,
        `https://avatars.githubusercontent.com/${c}`,
        JSON.stringify({ github: `https://github.com/${c}` }),
      ])
    );

    console.log(
      `Added ${result.affectedRows}/${batch.length} new contributors`
    );
  }
}

export async function addActivities(activities: Activity[]) {
  const db = getDb();

  for (const batch of batchArray(activities, 1000)) {
    const result = await db.query(
      `
      INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 9)}
      ON CONFLICT (slug) DO UPDATE SET contributor = EXCLUDED.contributor, activity_definition = EXCLUDED.activity_definition, title = EXCLUDED.title, occured_at = EXCLUDED.occured_at, link = EXCLUDED.link;
    `,
      batch.flatMap((a) => [
        a.slug,
        a.contributor,
        a.activity_definition,
        a.title,
        a.occured_at.toISOString(),
        a.link,
        a.text,
        a.points ?? null,
        a.meta ? JSON.stringify(a.meta) : null,
      ])
    );

    console.log(`Added ${result.affectedRows}/${batch.length} new activities`);
  }
}
