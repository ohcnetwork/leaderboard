import { ActivityDefinition, Contributor } from "@/types/db";
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
