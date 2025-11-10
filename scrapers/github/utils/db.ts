import { Activity, ActivityDefinition, Contributor } from "@/types/db";
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
 * Upsert activity definitions to the database
 */
export async function upsertActivityDefinitions() {
  const db = getDb();

  await db.query(`
    INSERT INTO activity_definition (slug, name, description, points)
    VALUES 
      ('comment_created', 'Commented', 'Commented on an Issue/PR', 0),
      ('issue_assigned', 'Issue Assigned', 'Got an issue assigned', 1),
      ('pr_reviewed', 'PR Reviewed', 'Reviewed a Pull Request', 2),
      ('issue_opened', 'Issue Opened', 'Raised an Issue', 2),
      ('pr_opened', 'PR Opened', 'Opened a Pull Request', 1),
      ('pr_merged', 'PR Merged', 'Merged a Pull Request', 7),
      ('pr_collaborated', 'PR Collaborated', 'Collaborated on a Pull Request', 2),
      ('issue_closed', 'Issue Closed', 'Closed an Issue', 0)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points;
  `);
}

export async function addContributors(contributors: string[]) {
  const db = getDb();

  await db.query(
    `
    INSERT INTO contributor (username)
    VALUES ${contributors.map((_, index) => `($${index + 1})`).join(", ")}
    ON CONFLICT (username) DO NOTHING;
  `,
    [...contributors]
  );
}

export async function addActivities(activities: Activity[]) {
  const db = getDb();

  await db.query(
    `
    INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
    VALUES ${activities
      .map(
        (_, index) =>
          `(${Array.from({ length: 9 }, (_, i) => `$${index * 9 + i + 1}`).join(
            ", "
          )})`
      )
      .join(", ")}
    ON CONFLICT (slug) DO UPDATE SET contributor = EXCLUDED.contributor, activity_definition = EXCLUDED.activity_definition, title = EXCLUDED.title, occured_at = EXCLUDED.occured_at, link = EXCLUDED.link;
  `,
    activities.flatMap((a) => [
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
}
