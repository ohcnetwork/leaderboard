import { getDb } from "@/src/db/pglite";
import { batchArray, getSqlParamPlaceholders } from "@/src/db/utils";
import { Activity, Contributor } from "@/src/types";
import { format } from "date-fns";
/**
 * Upserts contributors into the database, uniquely identified by their username.
 * @param contributors - The contributors to upsert
 */
export async function upsertContributor(...contributors: Contributor[]) {
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
    const result = await db.query(
      `
INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
VALUES ${getSqlParamPlaceholders(batch.length, 9)}
ON CONFLICT (slug) DO UPDATE SET contributor = EXCLUDED.contributor, 
                                 activity_definition = EXCLUDED.activity_definition, 
                                 title = EXCLUDED.title, 
                                 occured_at = EXCLUDED.occured_at, 
                                 link = EXCLUDED.link,
                                 text = EXCLUDED.text,
                                 points = EXCLUDED.points,
                                 meta = EXCLUDED.meta;
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
