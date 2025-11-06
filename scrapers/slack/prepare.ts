import { PGlite } from "@electric-sql/pglite";

async function prepare(db: PGlite) {
  await db.exec(`
    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('eod_update', 'EOD Update', 'Made an EOD Update', 2)
    ON CONFLICT (slug) DO NOTHING;
    `);
}

export default prepare;
