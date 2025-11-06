import runGitHub from "@/scrapers/github/run";
import { db } from "./common";

async function main() {
  await db.exec(`
        CREATE TABLE IF NOT EXISTS contributor (
            username                VARCHAR PRIMARY KEY,
            name                    VARCHAR,
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
    `);

  runGitHub(db);
}

main();
