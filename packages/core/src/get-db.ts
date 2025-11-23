import { PGlite } from "@electric-sql/pglite";

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
