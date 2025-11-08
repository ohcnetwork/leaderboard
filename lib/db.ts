import { PGlite } from "@electric-sql/pglite";
import type {
  Contributor,
  Activity,
  ActivityDefinition,
  TimeFilter,
  TimeRange,
  EnrichedActivity,
} from "@/types";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";

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
 * Convert TimeFilter to TimeRange with actual dates
 */
export function timeFilterToRange(filter: TimeFilter): TimeRange {
  const now = new Date();

  switch (filter.type) {
    case "all-time":
      return {};

    case "weekly": {
      const weeks = filter.weeks || 1;
      const since = startOfWeek(subWeeks(now, weeks - 1));
      return { since, till: now };
    }

    case "monthly": {
      const months = filter.months || 1;
      const since = startOfMonth(subMonths(now, months - 1));
      return { since, till: now };
    }

    case "yearly": {
      const years = filter.years || 1;
      const since = startOfYear(subYears(now, years - 1));
      return { since, till: now };
    }

    case "custom":
      return {
        since: new Date(filter.since),
        till: new Date(filter.till),
      };
  }
}

/**
 * Fetch all contributors
 */
export async function getAllContributors(db: PGlite): Promise<Contributor[]> {
  const result = await db.query<Contributor>(`
    SELECT * FROM contributor
    ORDER BY username ASC
  `);
  return result.rows;
}

/**
 * Fetch a single contributor by username
 */
export async function getContributor(
  db: PGlite,
  username: string
): Promise<Contributor | null> {
  const result = await db.query<Contributor>(
    `SELECT * FROM contributor WHERE username = $1`,
    [username]
  );
  return result.rows[0] || null;
}

/**
 * Fetch all activity definitions
 */
export async function getAllActivityDefinitions(
  db: PGlite
): Promise<ActivityDefinition[]> {
  const result = await db.query<ActivityDefinition>(`
    SELECT * FROM activity_definition
    ORDER BY slug ASC
  `);
  return result.rows;
}

/**
 * Fetch activities with optional filters
 */
export async function getActivities(
  db: PGlite,
  options: {
    contributor?: string;
    activityDefinition?: string;
    timeRange?: TimeRange;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Activity[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (options.contributor) {
    conditions.push(`contributor = $${paramIndex++}`);
    params.push(options.contributor);
  }

  if (options.activityDefinition) {
    conditions.push(`activity_definition = $${paramIndex++}`);
    params.push(options.activityDefinition);
  }

  if (options.timeRange?.since) {
    conditions.push(`occured_at >= $${paramIndex++}`);
    params.push(options.timeRange.since.toISOString());
  }

  if (options.timeRange?.till) {
    conditions.push(`occured_at <= $${paramIndex++}`);
    params.push(options.timeRange.till.toISOString());
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let query = `
    SELECT * FROM activity
    ${whereClause}
    ORDER BY occured_at DESC
  `;

  if (options.limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(options.limit);
  }

  if (options.offset) {
    query += ` OFFSET $${paramIndex++}`;
    params.push(options.offset);
  }

  const result = await db.query<Activity>(query, params);

  // Convert occured_at strings to Date objects
  return result.rows.map((row) => ({
    ...row,
    occured_at: new Date(row.occured_at),
  }));
}

/**
 * Fetch enriched activities with contributor and activity definition info
 */
export async function getEnrichedActivities(
  db: PGlite,
  options: {
    contributor?: string;
    activityDefinition?: string;
    timeRange?: TimeRange;
    limit?: number;
    offset?: number;
  } = {}
): Promise<EnrichedActivity[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (options.contributor) {
    conditions.push(`a.contributor = $${paramIndex++}`);
    params.push(options.contributor);
  }

  if (options.activityDefinition) {
    conditions.push(`a.activity_definition = $${paramIndex++}`);
    params.push(options.activityDefinition);
  }

  if (options.timeRange?.since) {
    conditions.push(`a.occured_at >= $${paramIndex++}`);
    params.push(options.timeRange.since.toISOString());
  }

  if (options.timeRange?.till) {
    conditions.push(`a.occured_at <= $${paramIndex++}`);
    params.push(options.timeRange.till.toISOString());
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let query = `
    SELECT 
      a.*,
      c.username as contributor_username,
      c.name as contributor_name,
      c.role as contributor_role,
      c.avatar_url as contributor_avatar_url,
      c.profile_url as contributor_profile_url,
      c.email as contributor_email,
      c.bio as contributor_bio,
      ad.slug as ad_slug,
      ad.name as ad_name,
      ad.description as ad_description,
      ad.points as ad_points,
      COALESCE(a.points, ad.points, 0) as calculated_points
    FROM activity a
    LEFT JOIN contributor c ON a.contributor = c.username
    LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
    ${whereClause}
    ORDER BY a.occured_at DESC
  `;

  if (options.limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(options.limit);
  }

  if (options.offset) {
    query += ` OFFSET $${paramIndex++}`;
    params.push(options.offset);
  }

  const result = await db.query(query, params);

  return (result.rows as Record<string, string | number | null>[]).map(
    (row) => ({
      slug: row.slug as string,
      contributor: row.contributor as string,
      activity_definition: row.activity_definition as string,
      title: row.title as string | null,
      occured_at: new Date(row.occured_at as string),
      link: row.link as string | null,
      text: row.text as string | null,
      points: row.points as number | null,
      meta: row.meta as Record<string, unknown> | null,
      contributor_info: {
        username: row.contributor_username as string,
        name: row.contributor_name as string | null,
        role: row.contributor_role as string | null,
        avatar_url: row.contributor_avatar_url as string | null,
        profile_url: row.contributor_profile_url as string | null,
        email: row.contributor_email as string | null,
        bio: row.contributor_bio as string | null,
      },
      activity_definition_info: {
        slug: row.ad_slug as string,
        name: row.ad_name as string,
        description: row.ad_description as string | null,
        points: row.ad_points as number | null,
      },
      calculated_points: row.calculated_points as number,
    })
  );
}

/**
 * Count total activities with optional filters
 */
export async function countActivities(
  db: PGlite,
  options: {
    contributor?: string;
    activityDefinition?: string;
    timeRange?: TimeRange;
  } = {}
): Promise<number> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (options.contributor) {
    conditions.push(`contributor = $${paramIndex++}`);
    params.push(options.contributor);
  }

  if (options.activityDefinition) {
    conditions.push(`activity_definition = $${paramIndex++}`);
    params.push(options.activityDefinition);
  }

  if (options.timeRange?.since) {
    conditions.push(`occured_at >= $${paramIndex++}`);
    params.push(options.timeRange.since.toISOString());
  }

  if (options.timeRange?.till) {
    conditions.push(`occured_at <= $${paramIndex++}`);
    params.push(options.timeRange.till.toISOString());
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT COUNT(*) as count FROM activity
    ${whereClause}
  `;

  const result = await db.query<{ count: string }>(query, params);
  return parseInt(result.rows[0]?.count || "0", 10);
}

/**
 * Get contributors with their activity counts and total points
 */
export async function getContributorsWithStats(
  db: PGlite,
  timeRange?: TimeRange
): Promise<
  Array<{
    contributor: Contributor;
    activity_count: number;
    total_points: number;
  }>
> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (timeRange?.since) {
    conditions.push(`a.occured_at >= $${paramIndex++}`);
    params.push(timeRange.since.toISOString());
  }

  if (timeRange?.till) {
    conditions.push(`a.occured_at <= $${paramIndex++}`);
    params.push(timeRange.till.toISOString());
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT 
      c.*,
      COUNT(a.slug) as activity_count,
      COALESCE(SUM(COALESCE(a.points, ad.points, 0)), 0) as total_points
    FROM contributor c
    LEFT JOIN activity a ON c.username = a.contributor ${
      whereClause ? `AND ${conditions.join(" AND ")}` : ""
    }
    LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
    GROUP BY c.username
    ORDER BY total_points DESC, activity_count DESC, c.username ASC
  `;

  const result = await db.query(
    query,
    timeRange?.since || timeRange?.till ? params : []
  );

  return (result.rows as Record<string, string | number | null>[]).map(
    (row) => ({
      contributor: {
        username: row.username as string,
        name: row.name as string | null,
        role: row.role as string | null,
        avatar_url: row.avatar_url as string | null,
        profile_url: row.profile_url as string | null,
        email: row.email as string | null,
        bio: row.bio as string | null,
      },
      activity_count: parseInt(row.activity_count as string, 10),
      total_points: parseInt(row.total_points as string, 10),
    })
  );
}
