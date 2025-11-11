import { Activity } from "@/types/db";
import { PGlite } from "@electric-sql/pglite";
import { SlackMessageData } from "./slack-api";

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
 * Prepare the database by creating the slack_eod table and upserting activity definitions
 */
export async function prepare() {
  const db = getDb();

  await db.exec(`
      CREATE TABLE IF NOT EXISTS slack_eod (
        id                      VARCHAR PRIMARY KEY,
        user_id                 VARCHAR NOT NULL,
        date                    DATE NOT NULL,
        text                    TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_slack_eod_date ON slack_eod(date);  
    `);

  await upsertActivityDefinitions();
}

export async function upsertActivityDefinitions() {
  const db = getDb();
  await db.query(`
    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('eod_update', 'EOD Update', 'Made an EOD Update', 2)
    ON CONFLICT (slug) DO NOTHING;
  `);
}

/**
 * Add contributors to the database
 * @param contributors - Array of contributor usernames
 */
export async function addContributors(contributors: string[]) {
  const db = getDb();

  // Remove duplicates from the array
  contributors = [...new Set(contributors)];

  for (const batch of batchArray(contributors, 1000)) {
    const result = await db.query(
      `
      INSERT INTO contributor (username, avatar_url, profile_url)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 3)}
      ON CONFLICT (username) DO NOTHING;
    `,
      batch.flatMap((c) => [
        c,
        null, // Slack user IDs don't have direct avatar URLs
        null, // Slack user IDs don't have direct profile URLs
      ])
    );

    console.log(
      `Added ${result.affectedRows}/${batch.length} new contributors`
    );
  }
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
      ON CONFLICT (slug) DO UPDATE SET contributor = EXCLUDED.contributor, activity_definition = EXCLUDED.activity_definition, title = EXCLUDED.title, occured_at = EXCLUDED.occured_at, link = EXCLUDED.link, text = EXCLUDED.text;
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
export async function addSlackEodMessages(messages: SlackMessageData[]) {
  const db = getDb();

  for (const batch of batchArray(messages, 1000)) {
    const result = await db.query(
      `
      INSERT INTO slack_eod (id, user_id, date, text)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 4)}
      ON CONFLICT (id) DO UPDATE 
        SET user_id = EXCLUDED.user_id,
            date = EXCLUDED.date,
            text = EXCLUDED.text;
    `,
      batch.flatMap((m) => [
        m.id || `${m.ts}`,
        m.user,
        m.timestamp.toISOString().split("T")[0], // date only
        m.text,
      ])
    );

    console.log(
      `Added ${result.affectedRows}/${batch.length} Slack EOD messages`
    );
  }
}

/**
 * Insert activities from slack_eod table where the slack_user_id exists in contributor metadata
 * This function creates activity records for EOD updates by matching slack_eod.user_id
 * with contributor.meta->>'slack_user_id'
 * @param channel - Slack channel ID for generating unique activity slugs
 */
export async function insertActivitiesFromSlackEod(channel: string) {
  const db = getDb();

  const result = await db.query(`
    INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
    SELECT 
     se.id AS slug,

    FROM slack_eod se
    INNER JOIN contributor c ON c.meta->>'slack_user_id' = se.user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM activity a 
      WHERE a.slug = 'eod_update_${channel}_' || se.id
    )
    ON CONFLICT (slug) DO NOTHING;
  `);

  console.log(
    `Inserted ${result.affectedRows} new EOD activities from slack_eod table`
  );

  return result.affectedRows;
}

/**
 * Transform Slack messages into Activity objects
 * @param messages - Array of Slack messages
 * @param channel - Slack channel ID
 * @returns Array of Activity objects
 */
export function transformSlackMessagesToActivities(
  messages: SlackMessageData[],
  channel: string
): Activity[] {
  const activities: Activity[] = [];

  for (const message of messages) {
    activities.push({
      slug: `eod_update_${channel}_${message.ts}`,
      contributor: message.user,
      activity_definition: "eod_update",
      title: "Made an EOD Update",
      occured_at: message.timestamp,
      link: message.permalink,
      text: message.text,
      points: null, // Points are defined in activity_definition
      meta: null,
    });
  }

  return activities;
}
