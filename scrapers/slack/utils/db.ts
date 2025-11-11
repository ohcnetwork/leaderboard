import { Activity } from "@/types/db";
import { PGlite } from "@electric-sql/pglite";

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
 * Batch an array into smaller arrays of a given size
 * @param array - The array to batch
 * @param batchSize - The size of each batch
 * @returns An array of arrays
 */
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

/**
 * Creates an ephermal table for storing slack messages would be queued for
 * activity insertion and creates an activity definition for eod updates.
 */
export async function prepare() {
  const db = getDb();

  await db.exec(`
      CREATE TABLE IF NOT EXISTS slack_eod_update (
        id                      BIGINT PRIMARY KEY,
        user_id                 VARCHAR NOT NULL,
        timestamp               TIMESTAMP NOT NULL,
        text                    TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_slack_eod_update_timestamp ON slack_eod_update(timestamp);
      CREATE INDEX IF NOT EXISTS idx_slack_eod_update_user_id ON slack_eod_update(user_id);
      
      INSERT INTO activity_definition (slug, name, description, points)
      VALUES ('eod_update', 'EOD Update', 'Dropped an EOD Update', 2)
      ON CONFLICT (slug) DO NOTHING;
    `);
}

/**
 * Add activities to the database
 * @param activities - Array of Activity objects
 */
export async function addActivities(activities: Activity[]) {
  const db = getDb();

  for (const batch of batchArray(activities, 1000)) {
    const result = await db.query(
      `
      INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 9)}
      ON CONFLICT (slug) DO UPDATE SET 
        contributor = EXCLUDED.contributor, 
        activity_definition = EXCLUDED.activity_definition, 
        title = EXCLUDED.title, 
        occured_at = LEAST(activity.occured_at, EXCLUDED.occured_at),
        link = EXCLUDED.link, 
        text = CASE 
          WHEN activity.text IS NULL THEN EXCLUDED.text
          WHEN EXCLUDED.text IS NULL THEN activity.text
          WHEN activity.text = EXCLUDED.text THEN activity.text
          ELSE activity.text || E'\\n\\n' || EXCLUDED.text
        END;
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

/**
 * Add Slack messages to the slack_eod table
 * @param messages - Array of Slack messages
 * @param channel - Slack channel ID
 */
export async function addSlackEodMessages(
  messages: { id: number; user_id: string; timestamp: Date; text: string }[]
) {
  const db = getDb();

  for (const batch of batchArray(messages, 1000)) {
    const result = await db.query(
      `
      INSERT INTO slack_eod_update (id, user_id, timestamp, text)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 4)}
      ON CONFLICT DO NOTHING; -- Ignore duplicates
    `,
      batch.flatMap((m) => [m.id, m.user_id, m.timestamp.toISOString(), m.text])
    );

    console.log(
      `Added ${result.affectedRows}/${batch.length} Slack EOD messages`
    );
  }
}

/**
 * Get a contributor by their Slack user ID from the meta field
 * @param slackUserId - The Slack user ID to search for
 * @returns The contributor or null if not found
 */
export async function getContributorBySlackUserId(slackUserId: string) {
  const db = getDb();

  const result = await db.query<{ username: string; meta: string }>(
    `SELECT username, meta FROM contributor WHERE meta->>'slack_user_id' = $1;`,
    [slackUserId]
  );

  return result.rows[0] ?? null;
}

/**
 * Get multiple contributors by their Slack user IDs in a single query
 * @param slackUserIds - Array of Slack user IDs to search for
 * @returns Map of slack_user_id to contributor username
 */
export async function getContributorsBySlackUserIds(slackUserIds: string[]) {
  const db = getDb();

  const result = await db.query<{ username: string; slack_user_id: string }>(
    `SELECT username, meta->>'slack_user_id' as slack_user_id 
     FROM contributor 
     WHERE meta->>'slack_user_id' = ANY($1);`,
    [slackUserIds]
  );

  // Create a map for O(1) lookups
  const contributorMap = new Map<string, string>();
  for (const row of result.rows) {
    contributorMap.set(row.slack_user_id, row.username);
  }

  return contributorMap;
}

/**
 * Get all pending EOD updates grouped by user_id
 * @returns Array of grouped EOD updates per user
 */
export async function getPendingEodUpdates() {
  const db = getDb();

  const result = await db.query<{
    user_id: string;
    ids: number[];
    texts: string[];
    timestamps: string[];
  }>(
    `
    SELECT 
      user_id,
      array_agg(id ORDER BY timestamp) as ids,
      array_agg(text ORDER BY timestamp) as texts,
      array_agg(timestamp ORDER BY timestamp) as timestamps
    FROM slack_eod_update
    GROUP BY user_id;
  `
  );

  return result.rows.map((row) => ({
    user_id: row.user_id,
    ids: row.ids,
    texts: row.texts,
    timestamps: row.timestamps.map((ts) => new Date(ts)),
  }));
}

/**
 * Delete processed Slack EOD messages from the queue
 * @param ids - Array of message IDs to delete
 */
export async function deleteSlackEodMessages(ids: number[]) {
  const db = getDb();

  const result = await db.query(
    `DELETE FROM slack_eod_update WHERE id = ANY($1);`,
    [ids]
  );

  console.log(`Deleted ${result.affectedRows} processed EOD messages`);
}
