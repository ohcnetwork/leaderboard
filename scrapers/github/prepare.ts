import { PGlite } from "@electric-sql/pglite";

async function prepare(db: PGlite) {
  await db.exec(`
    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('comment_created', 'Commented', 'Commented on an Issue/PR', 0)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('issue_assigned', 'Issue Assigned', 'Got an issue assigned', 1)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('pr_reviewed', 'PR Reviewed', 'Reviewed a Pull Request', 2)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('pr_reviewed', 'PR Reviewed', 'Reviewed a Pull Request', 2)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('issue_opened', 'Issue Opened', 'Raised an Issue', 2)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('pr_opened', 'PR Opened', 'Opened a Pull Request', 1)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('pr_merged', 'PR Merged', 'Merged a Pull Request', 7)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('pr_collaborated', 'PR Collaborated', 'Collaborated on a Pull Request', 2)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO activity_definition (slug, name, description, points)
    VALUES ('issue_closed', 'Issue Closed', 'Closed an Issue', 0)
    ON CONFLICT (slug) DO NOTHING;
        `);
}

export default prepare;
