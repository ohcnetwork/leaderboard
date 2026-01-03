import { getDb } from "@/src/db/pglite";
import { batchArray, getSqlParamPlaceholders } from "@/src/db/utils";
import {
  Activity,
  AggregateValue,
  Badge,
  Contributor,
  ContributorAggregate,
} from "@/src/types";
import { format } from "date-fns";

// TODO: add logging to all functions

/**
 * Upserts contributors into the database, uniquely identified by their username.
 * @param contributors - The contributors to upsert
 */
export async function upsertContributors(contributors: Contributor[]) {
  const pg = getDb();

  for (const batch of batchArray(contributors, 100)) {
    await pg.query(
      `
INSERT INTO contributor (username, name, role, title, avatar_url, bio, social_profiles, joining_date, meta)
VALUES ${getSqlParamPlaceholders(batch.length, 9)}
ON CONFLICT (username) DO UPDATE SET name            = EXCLUDED.name, 
                                     role            = EXCLUDED.role, 
                                     title           = EXCLUDED.title,
                                     avatar_url      = EXCLUDED.avatar_url, 
                                     bio             = EXCLUDED.bio, 
                                     social_profiles = EXCLUDED.social_profiles,
                                     joining_date    = EXCLUDED.joining_date,
                                     meta            = EXCLUDED.meta;
      `,
      batch.flatMap((c) => [
        c.username,
        c.name,
        c.role,
        c.title,
        c.avatar_url,
        c.bio,
        c.social_profiles,
        c.joining_date ? format(c.joining_date, "yyyy-MM-dd") : null,
        c.meta,
      ])
    );
  }
}

/**
 * Upserts activities into the database, uniquely identified by their slug.
 * @param activities - The activities to upsert
 */
export async function upsertActivities(activities: Activity[]) {
  const db = getDb();

  for (const batch of batchArray(activities, 1000)) {
    await db.query(
      `
INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
VALUES ${getSqlParamPlaceholders(batch.length, 9)}
ON CONFLICT (slug) DO UPDATE SET contributor         = EXCLUDED.contributor, 
                                 activity_definition = EXCLUDED.activity_definition, 
                                 title               = EXCLUDED.title, 
                                 occured_at          = EXCLUDED.occured_at, 
                                 link                = EXCLUDED.link,
                                 text                = EXCLUDED.text,
                                 points              = EXCLUDED.points,
                                 meta                = EXCLUDED.meta;
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
        a.meta,
      ])
    );
  }
}

/**
 * Upserts activities for an activity definition.
 * @param activityDefinition - The slug of the activity definition to upsert
 * activities for.
 * @param activities - The activities to upsert
 */
export async function upsertActivityDefinitionActivities(
  activityDefinition: string,
  activities: Omit<Activity, "activity_definition">[]
) {
  await upsertActivities(
    activities.map((a) => ({ ...a, activity_definition: activityDefinition }))
  );
}

/**
 * Upserts global aggregates into the database.
 * @param values - The values to upsert uniquely identified by their aggregate definition.
 */
export async function upsertGlobalAggregates(
  values: { aggregate: string; value: AggregateValue }[]
) {
  const db = getDb();

  for (const batch of batchArray(values, 1000)) {
    await db.query(
      `
INSERT INTO global_aggregate (aggregate, value)
VALUES ${getSqlParamPlaceholders(batch.length, 2)}
ON CONFLICT (aggregate) DO UPDATE SET value = EXCLUDED.value;
    `,
      batch.flatMap((v) => [v.aggregate, v.value])
    );
  }
}

/**
 * Upserts contributor aggregates into the database.
 * @param values - The values to upsert uniquely identified by their contributor and aggregate definition.
 */
export async function upsertContributorAggregates(
  values: ContributorAggregate[]
) {
  const db = getDb();

  for (const batch of batchArray(values, 1000)) {
    await db.query(
      `
INSERT INTO contributor_aggregate (contributor, aggregate, value)
VALUES ${getSqlParamPlaceholders(batch.length, 3)}
ON CONFLICT (contributor, aggregate) DO UPDATE SET value = EXCLUDED.value;
    `,
      batch.flatMap((v) => [v.contributor, v.aggregate, v.value])
    );
  }
}

/**
 * Upserts contributor aggregates for an aggregate definition.
 * @param definition - The slug of the aggregate definition to upsert
 * contributor aggregates for.
 * @param values - The values to upsert uniquely identified by their contributor.
 */
export async function upsertContributorAggregatesByDefinition(
  definition: string,
  values: Omit<ContributorAggregate, "aggregate">[]
) {
  await upsertContributorAggregates(
    values.map((v) => ({ ...v, aggregate: definition }))
  );
}

/**
 * Upserts badges into the database.
 * @param values - The values to upsert uniquely identified by their badge definition, contributor, and variant.
 */
export async function upsertBadges(values: Badge[]) {
  const db = getDb();

  for (const batch of batchArray(values, 1000)) {
    await db.query(
      `
INSERT INTO contributor_badge (badge, contributor, variant, achieved_on, meta)
VALUES ${getSqlParamPlaceholders(batch.length, 5)};
    `,
      batch.flatMap((v) => [
        v.badge,
        v.contributor,
        v.variant,
        v.achieved_on.toISOString(),
        v.meta,
      ])
    );
  }
}

/**
 * Upserts badges for a badge definition.
 * @param definition - The slug of the badge definition to upsert
 * badges for.
 * @param values - The values to upsert uniquely identified by their contributor.
 */
export async function upsertBadgesByDefinition(
  definition: string,
  values: Omit<Badge, "badge">[]
) {
  await upsertBadges(values.map((v) => ({ ...v, badge: definition })));
}
