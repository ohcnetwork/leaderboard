import { getDb } from "@/lib/db";
import runGitHub from "@/scrapers/github/run";

async function main() {
  const db = getDb();

  await db.exec(`
        CREATE TABLE IF NOT EXISTS contributor (
            username                VARCHAR PRIMARY KEY,
            name                    VARCHAR,
            role                    VARCHAR,
            avatar_url              VARCHAR,
            profile_url             VARCHAR,
            email                   VARCHAR,
            bio                     TEXT,
            meta                    JSON
        );

        CREATE TABLE IF NOT EXISTS activity_definition (
            slug                    VARCHAR PRIMARY KEY,
            name                    VARCHAR,
            description             TEXT,
            points                  SMALLINT CHECK (points IS NULL OR points > -1)
        );

        CREATE TABLE IF NOT EXISTS activity (
            slug                    VARCHAR PRIMARY KEY,
            contributor             VARCHAR REFERENCES contributor(username),
            activity_definition     VARCHAR REFERENCES activity_definition(slug),
            title                   VARCHAR,
            occured_at              TIMESTAMP,
            link                    VARCHAR,
            text                    TEXT,
            points                  SMALLINT CHECK (points IS NULL OR points > -1),
            meta                    JSON
        );

        CREATE INDEX IF NOT EXISTS idx_activity_occured_at ON activity(occured_at);
        CREATE INDEX IF NOT EXISTS idx_activity_contributor ON activity(contributor);
        CREATE INDEX IF NOT EXISTS idx_activity_definition ON activity(activity_definition);
    `);

  runGitHub(db);
}

main();
