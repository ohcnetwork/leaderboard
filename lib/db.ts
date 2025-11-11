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

/**
 * Activity with contributor details
 */
export interface ActivityWithContributor extends Activity {
  contributor_name: string | null;
  contributor_avatar_url: string | null;
  contributor_role: string | null;
}

/**
 * Activity group by activity definition
 */
export interface ActivityGroup {
  activity_definition: string;
  activity_name: string;
  activity_description: string | null;
  activity_points: number | null;
  activities: ActivityWithContributor[];
}

/**
 * Get recent activities grouped by activity type
 * @param days - Number of days to look back
 * @returns Activities grouped by activity definition
 */
export async function getRecentActivitiesGroupedByType(
  days: number
): Promise<ActivityGroup[]> {
  const db = getDb();

  const result = await db.query<
    ActivityWithContributor & {
      activity_name: string;
      activity_description: string | null;
      activity_points: number | null;
    }
  >(
    `
    SELECT 
      a.slug,
      a.contributor,
      a.activity_definition,
      a.title,
      a.occured_at,
      a.link,
      a.text,
      COALESCE(a.points, ad.points) as points,
      a.meta,
      c.name as contributor_name,
      c.avatar_url as contributor_avatar_url,
      c.role as contributor_role,
      ad.name as activity_name,
      ad.description as activity_description,
      ad.points as activity_points
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE a.occured_at >= NOW() - INTERVAL '${days} days'
    ORDER BY a.occured_at DESC;
  `,
    [],
    {
      parsers: {
        [types.DATE]: (date: string) => new Date(date),
      },
    }
  );

  // Group activities by activity_definition
  const grouped = result.rows.reduce((acc, row) => {
    const key = row.activity_definition;
    if (!acc[key]) {
      acc[key] = {
        activity_definition: row.activity_definition,
        activity_name: row.activity_name,
        activity_description: row.activity_description,
        activity_points: row.activity_points,
        activities: [],
      };
    }
    acc[key].activities.push(row);
    return acc;
  }, {} as Record<string, ActivityGroup>);

  return Object.values(grouped);
}

/**
 * Leaderboard entry with contributor details and activity breakdown
 */
export interface LeaderboardEntry {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role: string | null;
  total_points: number;
  activity_breakdown: Record<string, { count: number; points: number }>;
}

/**
 * Get leaderboard for a specific date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Leaderboard entries sorted by total points
 */
export async function getLeaderboard(
  startDate: Date,
  endDate: Date
): Promise<LeaderboardEntry[]> {
  const db = getDb();

  // Get all activities in the date range with contributor info
  const result = await db.query<{
    username: string;
    name: string | null;
    avatar_url: string | null;
    role: string | null;
    activity_definition: string;
    activity_name: string;
    points: number | null;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      c.role,
      a.activity_definition,
      ad.name as activity_name,
      COALESCE(a.points, ad.points) as points
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE a.occured_at >= $1 AND a.occured_at <= $2
    ORDER BY c.username;
  `,
    [startDate.toISOString(), endDate.toISOString()],
    {
      parsers: {
        [types.DATE]: (date: string) => new Date(date),
      },
    }
  );

  // Group by contributor and calculate totals
  const leaderboardMap = result.rows.reduce((acc, row) => {
    const username = row.username;
    if (!acc[username]) {
      acc[username] = {
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
        role: row.role,
        total_points: 0,
        activity_breakdown: {},
      };
    }

    const points = row.points || 0;
    acc[username].total_points += points;

    const activityKey = row.activity_name;
    if (!acc[username].activity_breakdown[activityKey]) {
      acc[username].activity_breakdown[activityKey] = {
        count: 0,
        points: 0,
      };
    }
    acc[username].activity_breakdown[activityKey].count += 1;
    acc[username].activity_breakdown[activityKey].points += points;

    return acc;
  }, {} as Record<string, LeaderboardEntry>);

  // Filter contributors with points > 0 and sort by total points
  return Object.values(leaderboardMap)
    .filter((entry) => entry.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points);
}

/**
 * Get all contributor usernames for static generation
 * @returns List of all contributor usernames
 */
export async function getAllContributorUsernames(): Promise<string[]> {
  const db = getDb();

  const result = await db.query<{ username: string }>(
    "SELECT username FROM contributor ORDER BY username;"
  );

  return result.rows.map((row) => row.username);
}

/**
 * Activity with full details for timeline
 */
export interface ContributorActivity extends Activity {
  activity_name: string;
  activity_description: string | null;
  activity_points: number | null;
}

/**
 * Get contributor profile with all activities
 * @param username - The username of the contributor
 * @returns Contributor profile with activities
 */
export async function getContributorProfile(username: string): Promise<{
  contributor: Contributor | null;
  activities: ContributorActivity[];
  totalPoints: number;
  activityByDate: Record<string, number>; // For activity graph
}> {
  const db = getDb();

  // Get contributor info
  const contributor = await getContributor(username);

  if (!contributor) {
    return {
      contributor: null,
      activities: [],
      totalPoints: 0,
      activityByDate: {},
    };
  }

  // Get all activities for this contributor
  const activitiesResult = await db.query<ContributorActivity>(
    `
    SELECT 
      a.slug,
      a.contributor,
      a.activity_definition,
      a.title,
      a.occured_at,
      a.link,
      a.text,
      COALESCE(a.points, ad.points) as points,
      a.meta,
      ad.name as activity_name,
      ad.description as activity_description,
      ad.points as activity_points
    FROM activity a
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE a.contributor = $1
    ORDER BY a.occured_at DESC;
  `,
    [username],
    {
      parsers: {
        [types.DATE]: (date: string) => new Date(date),
      },
    }
  );

  const activities = activitiesResult.rows;

  // Calculate total points
  const totalPoints = activities.reduce(
    (sum, activity) => sum + (activity.points || 0),
    0
  );

  // Group activities by date for the activity graph
  const activityByDate: Record<string, number> = {};
  activities.forEach((activity) => {
    const dateKey = activity.occured_at.toISOString().split("T")[0];
    if (dateKey) {
      activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
    }
  });

  return {
    contributor,
    activities,
    totalPoints,
    activityByDate,
  };
}
