/**
 * Reusable query builders and helpers
 */

import type {
  Database,
  Contributor,
  ActivityDefinition,
  Activity,
  GlobalAggregate,
  ContributorAggregateDefinition,
  ContributorAggregate,
  BadgeDefinition,
  ContributorBadge,
  AggregateValue,
} from "./types";

/**
 * Helper to parse contributor JSON fields
 */
function parseContributor(row: any): Contributor {
  return {
    ...row,
    social_profiles: row.social_profiles
      ? JSON.parse(row.social_profiles as string)
      : null,
    meta: row.meta ? JSON.parse(row.meta as string) : null,
  } as Contributor;
}

/**
 * Contributor queries
 */
export const contributorQueries = {
  /**
   * Get all contributors
   */
  async getAll(db: Database): Promise<Contributor[]> {
    const result = await db.execute(
      "SELECT * FROM contributor ORDER BY username"
    );
    return result.rows.map(parseContributor);
  },

  /**
   * Get contributor by username
   */
  async getByUsername(
    db: Database,
    username: string
  ): Promise<Contributor | null> {
    const result = await db.execute(
      "SELECT * FROM contributor WHERE username = ?",
      [username]
    );
    return result.rows[0] ? parseContributor(result.rows[0]) : null;
  },

  /**
   * Get contributors by role
   */
  async getByRole(db: Database, role: string): Promise<Contributor[]> {
    const result = await db.execute(
      "SELECT * FROM contributor WHERE role = ? ORDER BY username",
      [role]
    );
    return result.rows.map(parseContributor);
  },

  /**
   * Insert or ignore contributor (used by plugins)
   */
  async insertOrIgnore(db: Database, contributor: Contributor): Promise<void> {
    await db.execute(
      `INSERT OR IGNORE INTO contributor (
        username, name, role, title, avatar_url, bio, social_profiles, joining_date, meta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contributor.username,
        contributor.name,
        contributor.role,
        contributor.title,
        contributor.avatar_url,
        contributor.bio,
        contributor.social_profiles
          ? JSON.stringify(contributor.social_profiles)
          : null,
        contributor.joining_date,
        contributor.meta ? JSON.stringify(contributor.meta) : null,
      ]
    );
  },

  /**
   * Insert or update contributor
   */
  async upsert(db: Database, contributor: Contributor): Promise<void> {
    await db.execute(
      `INSERT INTO contributor (
        username, name, role, title, avatar_url, bio, social_profiles, joining_date, meta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        name = excluded.name,
        role = excluded.role,
        title = excluded.title,
        avatar_url = excluded.avatar_url,
        bio = excluded.bio,
        social_profiles = excluded.social_profiles,
        joining_date = excluded.joining_date,
        meta = excluded.meta`,
      [
        contributor.username,
        contributor.name,
        contributor.role,
        contributor.title,
        contributor.avatar_url,
        contributor.bio,
        contributor.social_profiles
          ? JSON.stringify(contributor.social_profiles)
          : null,
        contributor.joining_date,
        contributor.meta ? JSON.stringify(contributor.meta) : null,
      ]
    );
  },

  /**
   * Delete contributor
   */
  async delete(db: Database, username: string): Promise<void> {
    await db.execute("DELETE FROM contributor WHERE username = ?", [username]);
  },

  /**
   * Count total contributors
   */
  async count(db: Database): Promise<number> {
    const result = await db.execute(
      "SELECT COUNT(*) as count FROM contributor"
    );
    return (result.rows[0] as { count: number }).count;
  },

  /**
   * Get all contributor usernames (optimized - returns only usernames)
   */
  async getAllUsernames(db: Database): Promise<string[]> {
    const result = await db.execute(
      "SELECT username FROM contributor ORDER BY username"
    );
    return result.rows.map((row: any) => row.username as string);
  },

  /**
   * Get contributors with total points, filtered by excluded roles
   * Optimized with JOIN and GROUP BY to avoid N+1 queries
   */
  async getLeaderboardWithPoints(
    db: Database,
    excludedRoles: string[] = []
  ): Promise<
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      role: string | null;
      totalPoints: number;
    }>
  > {
    let sql = `
      SELECT 
        c.username,
        c.name,
        c.avatar_url,
        c.role,
        COALESCE(SUM(a.points), 0) as totalPoints
      FROM contributor c
      LEFT JOIN activity a ON c.username = a.contributor
    `;
    const params: unknown[] = [];

    if (excludedRoles.length > 0) {
      const placeholders = excludedRoles.map(() => "?").join(",");
      sql += ` WHERE (c.role IS NULL OR c.role NOT IN (${placeholders}))`;
      params.push(...excludedRoles);
    }

    sql += `
      GROUP BY c.username
      ORDER BY totalPoints DESC
    `;

    const result = await db.execute(sql, params);
    return result.rows as unknown as Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      role: string | null;
      totalPoints: number;
    }>;
  },
};

/**
 * Activity definition queries
 */
export const activityDefinitionQueries = {
  /**
   * Get all activity definitions
   */
  async getAll(db: Database): Promise<ActivityDefinition[]> {
    const result = await db.execute(
      "SELECT * FROM activity_definition ORDER BY slug"
    );
    return result.rows as unknown as ActivityDefinition[];
  },

  /**
   * Get activity definition by slug
   */
  async getBySlug(
    db: Database,
    slug: string
  ): Promise<ActivityDefinition | null> {
    const result = await db.execute(
      "SELECT * FROM activity_definition WHERE slug = ?",
      [slug]
    );
    return (result.rows[0] as unknown as ActivityDefinition) || null;
  },

  /**
   * Insert or ignore activity definition (used by plugins)
   */
  async insertOrIgnore(
    db: Database,
    definition: ActivityDefinition
  ): Promise<void> {
    await db.execute(
      `INSERT OR IGNORE INTO activity_definition (slug, name, description, points, icon)
       VALUES (?, ?, ?, ?, ?)`,
      [
        definition.slug,
        definition.name,
        definition.description,
        definition.points,
        definition.icon,
      ]
    );
  },

  /**
   * Count total activity definitions
   */
  async count(db: Database): Promise<number> {
    const result = await db.execute(
      "SELECT COUNT(*) as count FROM activity_definition"
    );
    return (result.rows[0] as { count: number }).count;
  },
};

/**
 * Helper to parse activity JSON fields
 */
function parseActivity(row: any): Activity {
  return {
    ...row,
    meta: row.meta ? JSON.parse(row.meta as string) : null,
  } as Activity;
}

/**
 * Activity queries
 */
export const activityQueries = {
  /**
   * Get all activities
   */
  async getAll(
    db: Database,
    limit?: number,
    offset?: number
  ): Promise<Activity[]> {
    let sql = "SELECT * FROM activity ORDER BY occured_at DESC";
    const params: unknown[] = [];

    if (limit !== undefined) {
      sql += " LIMIT ?";
      params.push(limit);
    }

    if (offset !== undefined) {
      sql += " OFFSET ?";
      params.push(offset);
    }

    const result = await db.execute(sql, params);
    return result.rows.map(parseActivity);
  },

  /**
   * Get activities by contributor
   */
  async getByContributor(
    db: Database,
    username: string,
    limit?: number
  ): Promise<Activity[]> {
    let sql =
      "SELECT * FROM activity WHERE contributor = ? ORDER BY occured_at DESC";
    const params: unknown[] = [username];

    if (limit !== undefined) {
      sql += " LIMIT ?";
      params.push(limit);
    }

    const result = await db.execute(sql, params);
    return result.rows.map(parseActivity);
  },

  /**
   * Get activities by date range
   */
  async getByDateRange(
    db: Database,
    startDate: string,
    endDate: string
  ): Promise<Activity[]> {
    const result = await db.execute(
      "SELECT * FROM activity WHERE occured_at >= ? AND occured_at <= ? ORDER BY occured_at DESC",
      [startDate, endDate]
    );
    return result.rows.map(parseActivity);
  },

  /**
   * Get activities by definition
   */
  async getByDefinition(
    db: Database,
    definitionSlug: string
  ): Promise<Activity[]> {
    const result = await db.execute(
      "SELECT * FROM activity WHERE activity_definition = ? ORDER BY occured_at DESC",
      [definitionSlug]
    );
    return result.rows.map(parseActivity);
  },

  /**
   * Get activities filtered by multiple activity definitions
   * Optimized for streak calculation
   */
  async getByDefinitions(
    db: Database,
    activityDefinitionSlugs: string[]
  ): Promise<Activity[]> {
    if (activityDefinitionSlugs.length === 0) {
      return this.getAll(db);
    }

    const placeholders = activityDefinitionSlugs.map(() => "?").join(",");
    const result = await db.execute(
      `SELECT * FROM activity 
       WHERE activity_definition IN (${placeholders})
       ORDER BY occured_at ASC`,
      activityDefinitionSlugs
    );

    return result.rows.map(parseActivity);
  },

  /**
   * Get activities by contributor and activity definitions
   * Optimized for streak rule evaluation
   */
  async getByContributorAndDefinitions(
    db: Database,
    contributor: string,
    activityDefinitionSlugs: string[]
  ): Promise<Activity[]> {
    if (activityDefinitionSlugs.length === 0) {
      return this.getByContributor(db, contributor);
    }

    const placeholders = activityDefinitionSlugs.map(() => "?").join(",");
    const result = await db.execute(
      `SELECT * FROM activity 
       WHERE contributor = ? 
         AND activity_definition IN (${placeholders})
       ORDER BY occured_at ASC`,
      [contributor, ...activityDefinitionSlugs]
    );

    return result.rows.map(parseActivity);
  },

  /**
   * Insert or update activity
   */
  async upsert(db: Database, activity: Activity): Promise<void> {
    await db.execute(
      `INSERT INTO activity (
        slug, contributor, activity_definition, title, occured_at, link, text, points, meta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        contributor = excluded.contributor,
        activity_definition = excluded.activity_definition,
        title = excluded.title,
        occured_at = excluded.occured_at,
        link = excluded.link,
        text = excluded.text,
        points = excluded.points,
        meta = excluded.meta`,
      [
        activity.slug,
        activity.contributor,
        activity.activity_definition,
        activity.title,
        activity.occured_at,
        activity.link,
        activity.text,
        activity.points,
        activity.meta ? JSON.stringify(activity.meta) : null,
      ]
    );
  },

  /**
   * Delete activity
   */
  async delete(db: Database, slug: string): Promise<void> {
    await db.execute("DELETE FROM activity WHERE slug = ?", [slug]);
  },

  /**
   * Count total activities
   */
  async count(db: Database): Promise<number> {
    const result = await db.execute("SELECT COUNT(*) as count FROM activity");
    return (result.rows[0] as { count: number }).count;
  },

  /**
   * Get total points by contributor
   */
  async getTotalPointsByContributor(
    db: Database,
    username: string
  ): Promise<number> {
    const result = await db.execute(
      "SELECT COALESCE(SUM(points), 0) as total FROM activity WHERE contributor = ?",
      [username]
    );
    return (result.rows[0] as { total: number }).total;
  },

  /**
   * Get leaderboard (contributors ranked by points)
   */
  async getLeaderboard(
    db: Database,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{ contributor: string; total_points: number; activity_count: number }>
  > {
    let sql = `
      SELECT 
        contributor,
        COALESCE(SUM(points), 0) as total_points,
        COUNT(*) as activity_count
      FROM activity
    `;
    const params: unknown[] = [];

    if (startDate && endDate) {
      sql += " WHERE occured_at >= ? AND occured_at <= ?";
      params.push(startDate, endDate);
    }

    sql += " GROUP BY contributor ORDER BY total_points DESC";

    if (limit !== undefined) {
      sql += " LIMIT ?";
      params.push(limit);
    }

    const result = await db.execute(sql, params);
    return result.rows as unknown as Array<{
      contributor: string;
      total_points: number;
      activity_count: number;
    }>;
  },

  /**
   * Get leaderboard with contributor details (optimized with JOIN)
   */
  async getLeaderboardEnriched(
    db: Database,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      role: string | null;
      total_points: number;
      activity_count: number;
    }>
  > {
    let sql = `
      SELECT 
        a.contributor as username,
        c.name,
        c.avatar_url,
        c.role,
        COALESCE(SUM(a.points), 0) as total_points,
        COUNT(*) as activity_count
      FROM activity a
      LEFT JOIN contributor c ON a.contributor = c.username
    `;
    const params: unknown[] = [];

    if (startDate && endDate) {
      sql += " WHERE a.occured_at >= ? AND a.occured_at <= ?";
      params.push(startDate, endDate);
    }

    sql += " GROUP BY a.contributor ORDER BY total_points DESC";

    if (limit !== undefined) {
      sql += " LIMIT ?";
      params.push(limit);
    }

    const result = await db.execute(sql, params);
    return result.rows as unknown as Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      role: string | null;
      total_points: number;
      activity_count: number;
    }>;
  },

  /**
   * Get recent activities with enriched contributor and definition details
   * Optimized with JOINs to avoid separate queries
   */
  async getRecentActivitiesEnriched(
    db: Database,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      slug: string;
      contributor: string;
      contributor_name: string | null;
      contributor_avatar_url: string | null;
      contributor_role: string | null;
      activity_definition: string;
      activity_name: string;
      activity_description: string | null;
      title: string | null;
      occured_at: string;
      link: string | null;
      text: string | null;
      points: number | null;
    }>
  > {
    const sql = `
      SELECT 
        a.slug,
        a.contributor,
        c.name as contributor_name,
        c.avatar_url as contributor_avatar_url,
        c.role as contributor_role,
        a.activity_definition,
        ad.name as activity_name,
        ad.description as activity_description,
        a.title,
        a.occured_at,
        a.link,
        a.text,
        a.points
      FROM activity a
      JOIN activity_definition ad ON a.activity_definition = ad.slug
      LEFT JOIN contributor c ON a.contributor = c.username
      WHERE a.occured_at >= ? AND a.occured_at <= ?
      ORDER BY a.activity_definition, a.occured_at DESC
    `;

    const result = await db.execute(sql, [startDate, endDate]);
    return result.rows as unknown as Array<{
      slug: string;
      contributor: string;
      contributor_name: string | null;
      contributor_avatar_url: string | null;
      contributor_role: string | null;
      activity_definition: string;
      activity_name: string;
      activity_description: string | null;
      title: string | null;
      occured_at: string;
      link: string | null;
      text: string | null;
      points: number | null;
    }>;
  },

  /**
   * Get top contributors by specific activity type
   * Optimized with JOIN and GROUP BY
   */
  async getTopByActivityEnriched(
    db: Database,
    activitySlug: string,
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ): Promise<
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  > {
    let sql = `
      SELECT 
        a.contributor as username,
        c.name,
        c.avatar_url,
        COALESCE(SUM(a.points), 0) as points,
        COUNT(*) as count
      FROM activity a
      LEFT JOIN contributor c ON a.contributor = c.username
      WHERE a.activity_definition = ?
    `;
    const params: unknown[] = [activitySlug];

    if (startDate && endDate) {
      sql += " AND a.occured_at >= ? AND a.occured_at <= ?";
      params.push(startDate, endDate);
    }

    sql += `
      GROUP BY a.contributor
      ORDER BY points DESC
      LIMIT ?
    `;
    params.push(limit);

    const result = await db.execute(sql, params);
    return result.rows as unknown as Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>;
  },

  /**
   * Get activity count grouped by date for a contributor
   * Optimized with SQL GROUP BY
   */
  async getActivityCountByDate(
    db: Database,
    username: string
  ): Promise<Array<{ date: string; count: number }>> {
    const sql = `
      SELECT 
        DATE(occured_at) as date,
        COUNT(*) as count
      FROM activity
      WHERE contributor = ?
      GROUP BY DATE(occured_at)
      ORDER BY date
    `;

    const result = await db.execute(sql, [username]);
    return result.rows as unknown as Array<{ date: string; count: number }>;
  },
};

/**
 * Global aggregate queries
 */
export const globalAggregateQueries = {
  /**
   * Get all global aggregates
   */
  async getAll(db: Database): Promise<GlobalAggregate[]> {
    const result = await db.execute(
      "SELECT * FROM global_aggregate ORDER BY slug"
    );
    return result.rows.map((row: any) => ({
      ...row,
      value: JSON.parse(row.value as string),
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    })) as GlobalAggregate[];
  },

  /**
   * Get global aggregate by slug
   */
  async getBySlug(db: Database, slug: string): Promise<GlobalAggregate | null> {
    const result = await db.execute(
      "SELECT * FROM global_aggregate WHERE slug = ?",
      [slug]
    );
    if (result.rows.length === 0) return null;
    const row: any = result.rows[0];
    return {
      ...row,
      value: JSON.parse(row.value as string),
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    } as GlobalAggregate;
  },

  /**
   * Insert or update global aggregate
   */
  async upsert(db: Database, aggregate: GlobalAggregate): Promise<void> {
    await db.execute(
      `INSERT INTO global_aggregate (slug, name, description, value, hidden, meta)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         value = excluded.value,
         hidden = excluded.hidden,
         meta = excluded.meta`,
      [
        aggregate.slug,
        aggregate.name,
        aggregate.description,
        JSON.stringify(aggregate.value),
        aggregate.hidden ?? false,
        aggregate.meta ? JSON.stringify(aggregate.meta) : null,
      ]
    );
  },

  /**
   * Get all visible global aggregates (not hidden)
   */
  async getAllVisible(db: Database): Promise<GlobalAggregate[]> {
    const result = await db.execute(
      "SELECT * FROM global_aggregate WHERE hidden = FALSE OR hidden IS NULL ORDER BY slug"
    );
    return result.rows.map((row: any) => ({
      ...row,
      value: JSON.parse(row.value as string),
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    })) as GlobalAggregate[];
  },

  /**
   * Delete global aggregate
   */
  async delete(db: Database, slug: string): Promise<void> {
    await db.execute("DELETE FROM global_aggregate WHERE slug = ?", [slug]);
  },

  /**
   * Get global aggregates by slugs with visibility filtering
   * Optimized with WHERE IN clause
   */
  async getBySlugs(
    db: Database,
    slugs: string[]
  ): Promise<
    Array<Pick<GlobalAggregate, "slug" | "name" | "value" | "description">>
  > {
    if (slugs.length === 0) {
      return [];
    }

    const placeholders = slugs.map(() => "?").join(",");
    const sql = `
      SELECT slug, name, value, description
      FROM global_aggregate
      WHERE slug IN (${placeholders}) 
        AND (hidden = FALSE OR hidden IS NULL)
      ORDER BY slug
    `;

    const result = await db.execute(sql, slugs);
    return result.rows.map((row: any) => ({
      slug: row.slug,
      name: row.name,
      value: JSON.parse(row.value as string),
      description: row.description || null,
    }));
  },
};

/**
 * Contributor aggregate definition queries
 */
export const contributorAggregateDefinitionQueries = {
  /**
   * Get all contributor aggregate definitions
   */
  async getAll(db: Database): Promise<ContributorAggregateDefinition[]> {
    const result = await db.execute(
      "SELECT * FROM contributor_aggregate_definition ORDER BY slug"
    );
    return result.rows as unknown as ContributorAggregateDefinition[];
  },

  /**
   * Get contributor aggregate definition by slug
   */
  async getBySlug(
    db: Database,
    slug: string
  ): Promise<ContributorAggregateDefinition | null> {
    const result = await db.execute(
      "SELECT * FROM contributor_aggregate_definition WHERE slug = ?",
      [slug]
    );
    return (
      (result.rows[0] as unknown as ContributorAggregateDefinition) || null
    );
  },

  /**
   * Insert or ignore contributor aggregate definition
   */
  async insertOrIgnore(
    db: Database,
    definition: ContributorAggregateDefinition
  ): Promise<void> {
    await db.execute(
      `INSERT OR IGNORE INTO contributor_aggregate_definition (slug, name, description, hidden)
       VALUES (?, ?, ?, ?)`,
      [
        definition.slug,
        definition.name,
        definition.description,
        definition.hidden ?? false,
      ]
    );
  },

  /**
   * Insert or update contributor aggregate definition
   */
  async upsert(
    db: Database,
    definition: ContributorAggregateDefinition
  ): Promise<void> {
    await db.execute(
      `INSERT INTO contributor_aggregate_definition (slug, name, description, hidden)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         hidden = excluded.hidden`,
      [
        definition.slug,
        definition.name,
        definition.description,
        definition.hidden ?? false,
      ]
    );
  },

  /**
   * Get all visible contributor aggregate definitions (not hidden)
   */
  async getAllVisible(db: Database): Promise<ContributorAggregateDefinition[]> {
    const result = await db.execute(
      "SELECT * FROM contributor_aggregate_definition WHERE hidden = FALSE OR hidden IS NULL ORDER BY slug"
    );
    return result.rows as unknown as ContributorAggregateDefinition[];
  },
};

/**
 * Contributor aggregate queries
 */
export const contributorAggregateQueries = {
  /**
   * Get all contributor aggregates
   */
  async getAll(db: Database): Promise<ContributorAggregate[]> {
    const result = await db.execute(
      "SELECT * FROM contributor_aggregate ORDER BY contributor, aggregate"
    );
    return result.rows.map((row: any) => ({
      ...row,
      value: JSON.parse(row.value as string),
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    })) as ContributorAggregate[];
  },

  /**
   * Get aggregates for a specific contributor
   */
  async getByContributor(
    db: Database,
    username: string
  ): Promise<ContributorAggregate[]> {
    const result = await db.execute(
      "SELECT * FROM contributor_aggregate WHERE contributor = ? ORDER BY aggregate",
      [username]
    );
    return result.rows.map((row: any) => ({
      ...row,
      value: JSON.parse(row.value as string),
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    })) as ContributorAggregate[];
  },

  /**
   * Get a specific aggregate for a contributor
   */
  async getByContributorAndAggregate(
    db: Database,
    username: string,
    aggregateSlug: string
  ): Promise<ContributorAggregate | null> {
    const result = await db.execute(
      "SELECT * FROM contributor_aggregate WHERE contributor = ? AND aggregate = ?",
      [username, aggregateSlug]
    );
    if (result.rows.length === 0) return null;
    const row: any = result.rows[0];
    return {
      ...row,
      value: JSON.parse(row.value as string),
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    } as ContributorAggregate;
  },

  /**
   * Insert or update contributor aggregate
   */
  async upsert(db: Database, aggregate: ContributorAggregate): Promise<void> {
    await db.execute(
      `INSERT INTO contributor_aggregate (aggregate, contributor, value, meta)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(aggregate, contributor) DO UPDATE SET
         value = excluded.value,
         meta = excluded.meta`,
      [
        aggregate.aggregate,
        aggregate.contributor,
        JSON.stringify(aggregate.value),
        aggregate.meta ? JSON.stringify(aggregate.meta) : null,
      ]
    );
  },

  /**
   * Delete contributor aggregate
   */
  async delete(
    db: Database,
    username: string,
    aggregateSlug: string
  ): Promise<void> {
    await db.execute(
      "DELETE FROM contributor_aggregate WHERE contributor = ? AND aggregate = ?",
      [username, aggregateSlug]
    );
  },

  /**
   * Delete all aggregates for a contributor
   */
  async deleteByContributor(db: Database, username: string): Promise<void> {
    await db.execute(
      "DELETE FROM contributor_aggregate WHERE contributor = ?",
      [username]
    );
  },

  /**
   * Get contributors where aggregate value meets threshold
   * Optimized for threshold-based badge rules
   */
  async getContributorsAboveThreshold(
    db: Database,
    aggregateSlug: string,
    minValue: number
  ): Promise<Array<{ contributor: string; value: number }>> {
    const result = await db.execute(
      `SELECT contributor, value
       FROM contributor_aggregate
       WHERE aggregate = ? 
         AND json_extract(value, '$.value') >= ?
         AND json_extract(value, '$.type') = 'number'
       ORDER BY json_extract(value, '$.value') DESC`,
      [aggregateSlug, minValue]
    );

    return result.rows.map((row: any) => ({
      contributor: row.contributor as string,
      value: JSON.parse(row.value as string).value as number,
    }));
  },

  /**
   * Get contributors with specific aggregate (for composite rules)
   */
  async getContributorsWithAggregate(
    db: Database,
    aggregateSlug: string
  ): Promise<Array<{ contributor: string; value: AggregateValue }>> {
    const result = await db.execute(
      `SELECT contributor, value
       FROM contributor_aggregate
       WHERE aggregate = ?`,
      [aggregateSlug]
    );

    return result.rows.map((row: any) => ({
      contributor: row.contributor as string,
      value: JSON.parse(row.value as string) as AggregateValue,
    }));
  },

  /**
   * Get contributor aggregates enriched with definition details
   * Optimized with JOIN and filtering
   */
  async getByContributorEnriched(
    db: Database,
    username: string,
    slugs: string[]
  ): Promise<
    Array<{
      aggregate: string;
      name: string;
      value: AggregateValue;
      description: string | null;
    }>
  > {
    if (slugs.length === 0) {
      return [];
    }

    const placeholders = slugs.map(() => "?").join(",");
    const sql = `
      SELECT 
        ca.aggregate,
        cad.name,
        ca.value,
        cad.description
      FROM contributor_aggregate ca
      JOIN contributor_aggregate_definition cad ON ca.aggregate = cad.slug
      WHERE ca.contributor = ?
        AND ca.aggregate IN (${placeholders})
        AND (cad.hidden = FALSE OR cad.hidden IS NULL)
      ORDER BY ca.aggregate
    `;

    const result = await db.execute(sql, [username, ...slugs]);
    return result.rows.map((row: any) => ({
      aggregate: row.aggregate,
      name: row.name,
      value: JSON.parse(row.value as string),
      description: row.description || null,
    }));
  },
};

/**
 * Badge definition queries
 */
export const badgeDefinitionQueries = {
  /**
   * Get all badge definitions
   */
  async getAll(db: Database): Promise<BadgeDefinition[]> {
    const result = await db.execute(
      "SELECT * FROM badge_definition ORDER BY slug"
    );
    return result.rows.map((row: any) => ({
      ...row,
      variants: JSON.parse(row.variants as string),
    })) as BadgeDefinition[];
  },

  /**
   * Get badge definition by slug
   */
  async getBySlug(db: Database, slug: string): Promise<BadgeDefinition | null> {
    const result = await db.execute(
      "SELECT * FROM badge_definition WHERE slug = ?",
      [slug]
    );
    if (result.rows.length === 0) return null;
    const row: any = result.rows[0];
    return {
      ...row,
      variants: JSON.parse(row.variants as string),
    } as BadgeDefinition;
  },

  /**
   * Insert or ignore badge definition
   */
  async insertOrIgnore(db: Database, badge: BadgeDefinition): Promise<void> {
    await db.execute(
      `INSERT OR IGNORE INTO badge_definition (slug, name, description, variants)
       VALUES (?, ?, ?, ?)`,
      [
        badge.slug,
        badge.name,
        badge.description,
        JSON.stringify(badge.variants),
      ]
    );
  },

  /**
   * Insert or update badge definition
   */
  async upsert(db: Database, badge: BadgeDefinition): Promise<void> {
    await db.execute(
      `INSERT INTO badge_definition (slug, name, description, variants)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         variants = excluded.variants`,
      [
        badge.slug,
        badge.name,
        badge.description,
        JSON.stringify(badge.variants),
      ]
    );
  },
};

/**
 * Contributor badge queries
 */
export const contributorBadgeQueries = {
  /**
   * Get all contributor badges
   */
  async getAll(db: Database): Promise<ContributorBadge[]> {
    const result = await db.execute(
      "SELECT * FROM contributor_badge ORDER BY achieved_on DESC"
    );
    return result.rows.map((row: any) => ({
      ...row,
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    })) as ContributorBadge[];
  },

  /**
   * Get badges for a specific contributor
   */
  async getByContributor(
    db: Database,
    username: string
  ): Promise<ContributorBadge[]> {
    const result = await db.execute(
      "SELECT * FROM contributor_badge WHERE contributor = ? ORDER BY achieved_on DESC",
      [username]
    );
    return result.rows.map((row: any) => ({
      ...row,
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    })) as ContributorBadge[];
  },

  /**
   * Get a specific badge for a contributor
   */
  async getByContributorAndBadge(
    db: Database,
    username: string,
    badgeSlug: string
  ): Promise<ContributorBadge | null> {
    const result = await db.execute(
      "SELECT * FROM contributor_badge WHERE contributor = ? AND badge = ?",
      [username, badgeSlug]
    );
    if (result.rows.length === 0) return null;
    const row: any = result.rows[0];
    return {
      ...row,
      meta: row.meta ? JSON.parse(row.meta as string) : null,
    } as ContributorBadge;
  },

  /**
   * Check if a contributor has a specific badge variant
   */
  async exists(
    db: Database,
    username: string,
    badgeSlug: string,
    variant: string
  ): Promise<boolean> {
    const result = await db.execute(
      "SELECT COUNT(*) as count FROM contributor_badge WHERE contributor = ? AND badge = ? AND variant = ?",
      [username, badgeSlug, variant]
    );
    return (result.rows[0] as { count: number }).count > 0;
  },

  /**
   * Award a badge to a contributor
   */
  async award(db: Database, badge: ContributorBadge): Promise<void> {
    await db.execute(
      `INSERT OR IGNORE INTO contributor_badge (slug, badge, contributor, variant, achieved_on, meta)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        badge.slug,
        badge.badge,
        badge.contributor,
        badge.variant,
        badge.achieved_on,
        badge.meta ? JSON.stringify(badge.meta) : null,
      ]
    );
  },

  /**
   * Upgrade a badge variant for a contributor
   */
  async upgrade(
    db: Database,
    slug: string,
    newVariant: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    await db.execute(
      `UPDATE contributor_badge 
       SET variant = ?, achieved_on = ?, meta = ?
       WHERE slug = ?`,
      [
        newVariant,
        new Date().toISOString().split("T")[0],
        meta ? JSON.stringify(meta) : null,
        slug,
      ]
    );
  },

  /**
   * Delete a contributor badge
   */
  async delete(db: Database, slug: string): Promise<void> {
    await db.execute("DELETE FROM contributor_badge WHERE slug = ?", [slug]);
  },

  /**
   * Delete all badges for a contributor
   */
  async deleteByContributor(db: Database, username: string): Promise<void> {
    await db.execute("DELETE FROM contributor_badge WHERE contributor = ?", [
      username,
    ]);
  },

  /**
   * Get recent badge achievements with enriched details
   * Optimized with JOINs to avoid N+1 queries
   */
  async getRecentEnriched(
    db: Database,
    limit: number = 20
  ): Promise<
    Array<{
      slug: string;
      badge: string;
      contributor: string;
      variant: string;
      achieved_on: string;
      meta: Record<string, unknown> | null;
      contributor_name: string | null;
      contributor_avatar_url: string | null;
      badge_name: string;
      badge_description: string;
      badge_variants: Record<string, { description: string; svg_url: string }>;
    }>
  > {
    const sql = `
      SELECT 
        cb.slug,
        cb.badge,
        cb.contributor,
        cb.variant,
        cb.achieved_on,
        cb.meta,
        c.name as contributor_name,
        c.avatar_url as contributor_avatar_url,
        bd.name as badge_name,
        bd.description as badge_description,
        bd.variants as badge_variants
      FROM contributor_badge cb
      JOIN contributor c ON cb.contributor = c.username
      JOIN badge_definition bd ON cb.badge = bd.slug
      ORDER BY cb.achieved_on DESC
      LIMIT ?
    `;

    const result = await db.execute(sql, [limit]);
    return result.rows.map((row: any) => ({
      slug: row.slug,
      badge: row.badge,
      contributor: row.contributor,
      variant: row.variant,
      achieved_on: row.achieved_on,
      meta: row.meta ? JSON.parse(row.meta as string) : null,
      contributor_name: row.contributor_name,
      contributor_avatar_url: row.contributor_avatar_url,
      badge_name: row.badge_name,
      badge_description: row.badge_description,
      badge_variants: JSON.parse(row.badge_variants as string),
    }));
  },

  /**
   * Get top badge earners with enriched contributor details
   * Optimized with GROUP BY and JOIN
   */
  async getTopEarnersEnriched(
    db: Database,
    limit: number = 10
  ): Promise<
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      badge_count: number;
    }>
  > {
    const sql = `
      SELECT 
        c.username,
        c.name,
        c.avatar_url,
        COUNT(cb.slug) as badge_count
      FROM contributor c
      JOIN contributor_badge cb ON c.username = cb.contributor
      GROUP BY c.username
      ORDER BY badge_count DESC
      LIMIT ?
    `;

    const result = await db.execute(sql, [limit]);
    return result.rows as unknown as Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      badge_count: number;
    }>;
  },
};
