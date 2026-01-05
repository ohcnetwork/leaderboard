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
  BadgeVariant,
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
      `INSERT INTO global_aggregate (slug, name, description, value, meta)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         value = excluded.value,
         meta = excluded.meta`,
      [
        aggregate.slug,
        aggregate.name,
        aggregate.description,
        JSON.stringify(aggregate.value),
        aggregate.meta ? JSON.stringify(aggregate.meta) : null,
      ]
    );
  },

  /**
   * Delete global aggregate
   */
  async delete(db: Database, slug: string): Promise<void> {
    await db.execute("DELETE FROM global_aggregate WHERE slug = ?", [slug]);
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
      `INSERT OR IGNORE INTO contributor_aggregate_definition (slug, name, description)
       VALUES (?, ?, ?)`,
      [definition.slug, definition.name, definition.description]
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
      `INSERT INTO contributor_aggregate_definition (slug, name, description)
       VALUES (?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         description = excluded.description`,
      [definition.slug, definition.name, definition.description]
    );
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
};
