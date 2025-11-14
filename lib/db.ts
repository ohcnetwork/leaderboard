import { Activity, ActivityDefinition, Contributor } from "@/types/db";
import { PGlite, types } from "@electric-sql/pglite";

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
 * Create tables and indexes in the database if they don't exist
 */
export async function createTables() {
  const db = getDb();

  await db.exec(`
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

    CREATE TABLE IF NOT EXISTS activity_definition (
        slug                    VARCHAR PRIMARY KEY,
        name                    VARCHAR NOT NULL,
        description             TEXT NOT NULL,
        points                  SMALLINT,
        icon                    VARCHAR
    );

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
    INSERT INTO activity_definition (slug, name, description, points, icon)
    VALUES ${activityDefinitions
      .map(
        (ad) =>
          `('${ad.slug}', '${ad.name}', '${ad.description}', ${ad.points}, '${ad.icon}')`
      )
      .join(",")}
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points, icon = EXCLUDED.icon;
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
    return `'${value.toISOString().split("T")[0]}'`;
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
  daily_activity: Array<{ date: string; count: number; points: number }>;
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
    occured_at: Date;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      c.role,
      a.activity_definition,
      ad.name as activity_name,
      COALESCE(a.points, ad.points) as points,
      a.occured_at
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE a.occured_at >= $1 AND a.occured_at <= $2
    ORDER BY c.username, a.occured_at;
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
        daily_activity: [],
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

    // Group by date for daily activity
    const dateKey = row.occured_at.toISOString().split("T")[0];
    if (dateKey) {
      const existingDay = acc[username].daily_activity.find(
        (d) => d.date === dateKey
      );
      if (existingDay) {
        existingDay.count += 1;
        existingDay.points += points;
      } else {
        acc[username].daily_activity.push({
          date: dateKey,
          count: 1,
          points: points,
        });
      }
    }

    return acc;
  }, {} as Record<string, LeaderboardEntry>);

  // Filter contributors with points > 0 and sort by total points
  return Object.values(leaderboardMap)
    .filter((entry) => entry.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points);
}

/**
 * Get top contributors by activity type for a specific date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param activitySlugs - Optional array of activity definition slugs to filter by
 * @returns Top contributors grouped by activity type
 */
export async function getTopContributorsByActivity(
  startDate: Date,
  endDate: Date,
  activitySlugs?: string[]
): Promise<
  Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  >
> {
  const db = getDb();

  // Build WHERE clause for activity slug filtering
  const whereClause =
    activitySlugs && activitySlugs.length > 0
      ? `a.occured_at >= $1 AND a.occured_at <= $2 AND ad.slug = ANY($3)`
      : `a.occured_at >= $1 AND a.occured_at <= $2`;

  const queryParams =
    activitySlugs && activitySlugs.length > 0
      ? [startDate.toISOString(), endDate.toISOString(), activitySlugs]
      : [startDate.toISOString(), endDate.toISOString()];

  const result = await db.query<{
    username: string;
    name: string | null;
    avatar_url: string | null;
    activity_name: string;
    activity_slug: string;
    points: number;
    count: number;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      ad.name as activity_name,
      ad.slug as activity_slug,
      SUM(COALESCE(a.points, ad.points)) as points,
      COUNT(*) as count
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${whereClause}
    GROUP BY c.username, c.name, c.avatar_url, ad.name, ad.slug
    HAVING SUM(COALESCE(a.points, ad.points)) > 0
    ORDER BY ad.name, points DESC;
  `,
    queryParams,
    {
      parsers: {
        [types.DATE]: (date: string) => new Date(date),
      },
    }
  );

  // Group by activity type and take top 3 for each
  const topByActivityMap: Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  > = {};

  result.rows.forEach((row) => {
    const activityName = row.activity_name;
    if (!topByActivityMap[activityName]) {
      topByActivityMap[activityName] = [];
    }
    if (topByActivityMap[activityName].length < 3) {
      topByActivityMap[activityName].push({
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
        points: Number(row.points),
        count: Number(row.count),
      });
    }
  });

  // If slugs are provided, return in the order specified in config
  // Otherwise, return in alphabetical order by activity name
  if (activitySlugs && activitySlugs.length > 0) {
    const orderedResult: Record<
      string,
      Array<{
        username: string;
        name: string | null;
        avatar_url: string | null;
        points: number;
        count: number;
      }>
    > = {};

    // Create a map of slug to activity name from the results
    const slugToName = new Map<string, string>();
    result.rows.forEach((row) => {
      slugToName.set(row.activity_slug, row.activity_name);
    });

    // Add activities in the order specified by activitySlugs
    activitySlugs.forEach((slug) => {
      const activityName = slugToName.get(slug);
      if (activityName && topByActivityMap[activityName]) {
        orderedResult[activityName] = topByActivityMap[activityName];
      }
    });

    return orderedResult;
  }

  return topByActivityMap;
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
 * Get all contributors with avatars sorted by total points
 * @param excludeRoles - Optional array of role names to exclude
 * @returns List of contributors with avatar URLs and usernames
 */
export async function getAllContributorsWithAvatars(
  excludeRoles?: string[]
): Promise<
  Array<{
    username: string;
    name: string | null;
    avatar_url: string;
    role: string | null;
    total_points: number;
  }>
> {
  const db = getDb();

  const whereConditions = ["c.avatar_url IS NOT NULL"];
  const params: string[] = [];

  if (excludeRoles && excludeRoles.length > 0) {
    params.push(...excludeRoles);
    const placeholders = excludeRoles.map((_, i) => `$${i + 1}`).join(", ");
    whereConditions.push(`(c.role IS NULL OR c.role NOT IN (${placeholders}))`);
  }

  const whereClause = whereConditions.join(" AND ");

  const result = await db.query<{
    username: string;
    name: string | null;
    avatar_url: string;
    role: string | null;
    total_points: number;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      c.role,
      COALESCE(SUM(COALESCE(a.points, ad.points)), 0) as total_points
    FROM contributor c
    LEFT JOIN activity a ON c.username = a.contributor
    LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${whereClause}
    GROUP BY c.username, c.name, c.avatar_url, c.role
    ORDER BY total_points DESC, c.username ASC;
  `,
    params
  );

  return result.rows;
}

/**
 * Activity with full details for timeline
 */
export interface ContributorActivity extends Activity {
  activity_name: string;
  activity_description: string | null;
  activity_points: number | null;
  activity_icon: string | null;
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
      ad.points as activity_points,
      ad.icon as activity_icon
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
