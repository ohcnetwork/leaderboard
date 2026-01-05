/**
 * Reusable query builders and helpers
 */

import type {
  Database,
  Contributor,
  ActivityDefinition,
  Activity,
} from "./types";

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
    return result.rows as unknown as Contributor[];
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
    return (result.rows[0] as unknown as Contributor) || null;
  },

  /**
   * Get contributors by role
   */
  async getByRole(db: Database, role: string): Promise<Contributor[]> {
    const result = await db.execute(
      "SELECT * FROM contributor WHERE role = ? ORDER BY username",
      [role]
    );
    return result.rows as unknown as Contributor[];
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
    return result.rows as unknown as Activity[];
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
    return result.rows as unknown as Activity[];
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
    return result.rows as unknown as Activity[];
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
    return result.rows as unknown as Activity[];
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
};
